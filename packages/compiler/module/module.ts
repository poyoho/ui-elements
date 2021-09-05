import {
  modulesKey, exportKey, dynamicImportKey, moduleKey, globalCSS,
  babelParse, babelParserDefaultPlugins, walkIdentifiers, walk, MagicString
} from "./env"
import type { ExportSpecifier, Identifier, Node, ObjectProperty } from '@babel/types'

export interface CompiledFile {
  filename: string
  compiled: {
    js: string
    css: string
  }
}

export interface FileSystem {
  isExist: (filename: string) => boolean
  readFile: (filename: string) => CompiledFile | undefined
}

const isStaticProperty = (node: Node): node is ObjectProperty => {
  return node.type === 'ObjectProperty' && !node.computed
}

export function procssCSSModule (
  filename: string,
  css: string | undefined,
  filesystem: FileSystem,) {
  return {
    code: css ? `\n${globalCSS} += ${JSON.stringify(css)}` : '',
  }
}

export function processJavaScriptModule (
  filename: string,
  js: string,
  filesystem: FileSystem,
) {
  const s = new MagicString(js)

  const ast = babelParse(js, {
    sourceFilename: filename,
    sourceType: 'module',
    plugins: [...babelParserDefaultPlugins],
  }).program.body

  const idToImportMap = new Map<string, string>()
  const declaredConst = new Set<string>()
  const importedFiles = new Set<string>()
  const importToIdMap = new Map<string, string>()

  function defineImport(node: Node, source: string) {
    const filename = source.replace(/^\.\/+/, '')
    if (!(filesystem.isExist(filename))) {
      throw new Error(`File "${filename}" does not exist.`)
    }

    if (importedFiles.has(filename)) {
      return importToIdMap.get(filename)!
    }

    importedFiles.add(filename)
    const id = `__import_${importedFiles.size}__`
    importToIdMap.set(filename, id)
    s.appendLeft(
      node.start!,
      `const ${id} = ${modulesKey}[${JSON.stringify(filename)}]\n`,
    )
    return id
  }

  function defineExport(name: string, local = name) {
    s.append(`\n${exportKey}(${moduleKey}, "${name}", () => ${local})`)
  }

  // 0. instantiate module
  s.prepend(
    `const ${moduleKey} = __modules__[${JSON.stringify(
      filename,
    )}] = { [Symbol.toStringTag]: "Module" }\n\n`,
  )

  // 1. check all import statements and record id -> importName map
  for (const node of ast) {
    // import foo from 'foo' --> foo -> __import_foo__.default
    // import { baz } from 'foo' --> baz -> __import_foo__.baz
    // import * as ok from 'foo' --> ok -> __import_foo__
    if (node.type === 'ImportDeclaration') {
      const source = node.source.value
      if (source.startsWith('./')) {
        const importId = defineImport(node, node.source.value)
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier') {
            idToImportMap.set(
              spec.local.name,
              `${importId}.${(spec.imported as Identifier).name}`,
            )
          } else if (spec.type === 'ImportDefaultSpecifier') {
            idToImportMap.set(spec.local.name, `${importId}.default`)
          } else {
            // namespace specifier
            idToImportMap.set(spec.local.name, importId)
          }
        }
        s.remove(node.start!, node.end!)
      }
    }
  }

  // 2. check all export statements and define exports
  for (const node of ast) {
    // named exports
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        if (
          node.declaration.type === 'FunctionDeclaration'
          || node.declaration.type === 'ClassDeclaration'
        ) {
          // export function foo() {}
          defineExport(node.declaration.id!.name)
        } else if (node.declaration.type === 'VariableDeclaration') {
          // export const foo = 1, bar = 2
          for (const decl of node.declaration.declarations) {
            const names = extractNames(decl.id as any)
            for (const name of names) {
              defineExport(name)
            }
          }
        }
        s.remove(node.start!, node.declaration.start!)
      } else if (node.source) {
        // export { foo, bar } from './foo'
        const importId = defineImport(node, node.source.value)
        for (const spec of node.specifiers) {
          defineExport(
            (spec.exported as Identifier).name,
            `${importId}.${(spec as ExportSpecifier).local.name}`,
          )
        }
        s.remove(node.start!, node.end!)
      } else {
        // export { foo, bar }
        for (const spec of node.specifiers) {
          const local = (spec as ExportSpecifier).local.name
          const binding = idToImportMap.get(local)
          defineExport((spec.exported as Identifier).name, binding || local)
        }
        s.remove(node.start!, node.end!)
      }
    }

    // default export
    if (node.type === 'ExportDefaultDeclaration') {
      s.overwrite(node.start!, node.start! + 14, `${moduleKey}.default =`)
    }

    // export * from './foo'
    if (node.type === 'ExportAllDeclaration') {
      const importId = defineImport(node, node.source.value)
      s.remove(node.start!, node.end!)
      s.append(`\nfor (const key in ${importId}) {
        if (key !== 'default') {
          ${exportKey}(${moduleKey}, key, () => ${importId}[key])
        }
      }`)
    }
  }

  // 3. convert references to import bindings
  for (const node of ast) {
    if (node.type === 'ImportDeclaration') {
      continue
    }
    walkIdentifiers(node, (id, parent, parentStack) => {
      const binding = idToImportMap.get(id.name)
      if (!binding) {
        return
      }

      if (isStaticProperty(parent) && parent.shorthand) {
        // let binding used in a property shorthand
        // { foo } -> { foo: __import_x__.foo }
        // skip for destructure patterns
        if (
          !(parent as any).inPattern
          || isInDestructureAssignment(parent, parentStack)
        ) {
          s.appendLeft(id.end!, `: ${binding}`)
        }
      } else if (
        parent.type === 'ClassDeclaration'
        && id === parent.superClass
      ) {
        if (!declaredConst.has(id.name)) {
          declaredConst.add(id.name)
          // locate the top-most node containing the class declaration
          const topNode = parentStack[1]
          s.prependRight(topNode.start!, `const ${id.name} = ${binding};\n`)
        }
      } else {
        s.overwrite(id.start!, id.end!, binding)
      }
    })
  }

  // 4. convert dynamic imports
  (walk as any)(ast, {
    enter(node: Node, parent: Node) {
      if (node.type === 'Import' && parent.type === 'CallExpression') {
        const arg = parent.arguments[0]
        if (arg.type === 'StringLiteral' && arg.value.startsWith('./')) {
          s.overwrite(node.start!, node.start! + 6, dynamicImportKey)
          s.overwrite(
            arg.start!,
            arg.end!,
            JSON.stringify(arg.value.replace(/^\.\/+/, '')),
          )
        }
      }
    },
  })
  return {
    code: s.toString(),
    importedFiles,
  }
}

export function processFile(
  file: CompiledFile,
  filesystem: FileSystem,
  seen = new Set<CompiledFile>()
) {
  if (seen.has(file)) {
    return []
  }

  seen.add(file)

  const { js, css } = file.compiled

  const { code: jscode, importedFiles } = processJavaScriptModule(file.filename, js, filesystem)
  const { code: csscode } = processJavaScriptModule(file.filename, css, filesystem)


  const processed = [jscode + csscode]
  if (importedFiles.size) {
    for (const imported of importedFiles) {
      const processedFile = processFile(
        filesystem.readFile(imported)!,
        filesystem,
        seen
      )
      processed.push(...processedFile)
    }
  }
  // return a list of files to further process
  return processed
}

function extractNames(param: Node): string[] {
  return extractIdentifiers(param).map(id => id.name)
}

function extractIdentifiers(
  param: Node,
  nodes: Identifier[] = [],
): Identifier[] {
  switch (param.type) {
    case 'Identifier':
      nodes.push(param)
      break

    case 'MemberExpression':
      let object: any = param // eslint-disable-line no-case-declarations
      while (object.type === 'MemberExpression') {
        object = object.object
      }
      nodes.push(object)
      break

    case 'ObjectPattern':
      param.properties.forEach((prop) => {
        if (prop.type === 'RestElement') {
          extractIdentifiers(prop.argument, nodes)
        } else {
          extractIdentifiers(prop.value, nodes)
        }
      })
      break

    case 'ArrayPattern':
      param.elements.forEach((element) => {
        if (element) {
          extractIdentifiers(element, nodes)
        }
      })
      break

    case 'RestElement':
      extractIdentifiers(param.argument, nodes)
      break

    case 'AssignmentPattern':
      extractIdentifiers(param.left, nodes)
      break
  }

  return nodes
}

function isInDestructureAssignment(parent: Node, parentStack: Node[]): boolean {
  if (
    parent
    && (parent.type === 'ObjectProperty' || parent.type === 'ArrayPattern')
  ) {
    let i = parentStack.length
    while (i--) {
      const p = parentStack[i]
      if (p.type === 'AssignmentExpression') {
        return true
      } else if (p.type !== 'ObjectProperty' && !p.type.endsWith('Pattern')) {
        break
      }
    }
  }
  return false
}
