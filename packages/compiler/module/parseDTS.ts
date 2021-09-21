import {
  MagicString, babelParse,
  babelParserDefaultPlugins
} from "./env"

export function parseSkypackDTSModule (
  filename: string,
  script: string,
  fetchDTS: (packUri: string) => Promise<string>,
) {
  const s = new MagicString(script)

  const ast = babelParse(script, {
    sourceFilename: filename,
    sourceType: 'module',
    plugins: [
      ...babelParserDefaultPlugins,
      "typescript"
    ],
  }).program.body

  const dependenciesFiles = new Set<string>()

  function defineImport (source: string) {
    const filename = source.match(/\/-\/(.*)@/)![1]
    dependenciesFiles.add(source)
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
      s.appendLeft(node.source.start!, importId)
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
      s.appendRight(node.source.start!, importId)
    }
  }

  if (dependenciesFiles.size) {
    dependenciesFiles.forEach(async file => {
      const dtsScript = await fetchDTS(file)
      const module = parseSkypackDTSModule(file, dtsScript, fetchDTS)
      s.append(module)
    })
  }

  return s.toString()
}
