import {
  babelParse,
  babelParserDefaultPlugins,
  MagicString} from "./env"

export async function parseSkypackDTSModule (
  filename: string,
  script: string,
  fetchDTS: (packUri: string) => Promise<string>,
  packageDependencies: Set<string> = new Set<string>()
) {
  const s = new MagicString(script)
  const addDependencies = new Set<string>()

  const ast = babelParse(script, {
    sourceFilename: filename,
    sourceType: 'module',
    plugins: [
      ...babelParserDefaultPlugins,
      "typescript"
    ],
  }).program.body

  function defineImport (source: string) {
    const filename = source.match(/\/-\/(.*)@/)![1]
    if (!packageDependencies.has(source)) {
      addDependencies.add(source)
    }
    return filename
  }

  // 1. check all import statements and record id -> importName map
  // import foo from '/-/@vue/compiler-dom@v3.2.6-...' --> @vue/compiler-dom
  // import { baz } from '/-/@vue/compiler-dom@v3.2.6-...' --> @vue/compiler-dom
  // import * as ok from '/-/@vue/compiler-dom@v3.2.6-...' --> @vue/compiler-dom
  for (const node of ast) {
    if (node.type === 'ImportDeclaration') {
      const importId = defineImport(node.source.value)
      s.remove(node.source.start!, node.source.end!)
      s.appendLeft(node.source.start!, `'${importId}'`)
    }
  }

  // 2. check all export statements and define exports
  // export { foo, bar } from '/-/packageName@version/' --> packageName
  // export * from '/-/packageName@version/' --> packageName
  for (const node of ast) {
    if (
      (
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportAllDeclaration'
      )
      && node.source
    ) {
      const importId = defineImport(node.source.value)
      s.remove(node.source.start!, node.source.end!)
      s.appendRight(node.source.start!, `'${importId}'`)
    }
  }

  let result = [
    {
      filePath: filename,
      content: `declare module '${filename}' { ${s.toString()} }`
    }
  ]

  addDependencies.forEach(pkg => packageDependencies.add(pkg))
  await Promise.all(
    Array.from(addDependencies.values()).map(async moduleURI => {
      const dtsScript = await fetchDTS(moduleURI)
      const filename = moduleURI.match(/\/-\/(.*)@/)![1]
      const module = await parseSkypackDTSModule(filename, dtsScript, fetchDTS, packageDependencies)
      result = result.concat(module)
    })
  )

  return result
}
