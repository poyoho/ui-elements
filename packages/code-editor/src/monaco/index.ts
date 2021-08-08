import * as monaco from 'monaco-editor'

export const SupportLanguage = {
  // "html": "html",
  "js": "javascript",
  "ts": "typescript",
  "css": "css",
  "json": "json"
}

async function loadWorker () {
  const [
    { default: EditorWorker },
    { default: JSONWorker },
    { default: TsWorker },
    { default: CSSWorker },
  ] = await Promise.all([
    import('monaco-editor/esm/vs/editor/editor.worker?worker' as any),
    import('monaco-editor/esm/vs/language/json/json.worker?worker' as any),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker' as any),
    import('monaco-editor/esm/vs/language/css/css.worker?worker' as any),
  ])

  // monaco要求将worker挂载到window上
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new JSONWorker()
      }
      // if (label === 'html' || label === 'handlebars' || label === 'razor') {
      //   return new HtmlWorker()
      // }
      if (label === 'typescript' || label === 'javascript') {
        return new TsWorker()
      }
      if (label === 'css') {
        return new CSSWorker()
      }

      return new EditorWorker()
    },
  }
}

export async function setupMonaco () {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    allowUnusedLabels: true,
    strict: false,
    allowJs: true,
  })

  monaco.editor.defineTheme('dark', await import("./dark.json") as any)
  await loadWorker()


  const packages = new Map<string, {
    content: string;
    filePath?: string;
  }>()

  return {
    monaco,
    addPackages (pack: string, types: string) {
      if (packages.has(pack)) {
        return
      }
      const lib =  {
        content: `declare module '${pack}' { ${types} } `
      }
      packages.set(pack, lib)
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(Array.from(packages.values()))
    }
  }
}

export default setupMonaco

