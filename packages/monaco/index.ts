import { createSinglePromise } from "@ui-elements/utils"

import type { editor } from "monaco-editor"
export type { editor }
export type monaco = typeof import("monaco-editor")
export * from "./textmate"


export async function getEmitResult (monaco: monaco, model: editor.ITextModel) {
  const worker = await monaco.languages.typescript.getTypeScriptWorker()
  const client = await worker(model.uri)
  return await client.getEmitOutput(model.uri.toString())
}

export async function getRunnableJS (monaco: monaco, model: editor.ITextModel) {
  const result = await getEmitResult(monaco, model)
  const firstJS = result.outputFiles.find((o: any) => o.name.endsWith(".js"))
  return (firstJS && firstJS.text) || ""
}

export const SupportLanguage = {
  "html": "html",
  "js": "javascript",
  "ts": "typescript",
  "css": "css",
  "json": "json"
}

export const loadWorkers = createSinglePromise(async () => {
  const [
    { default: EditorWorker },
    { default: JSONWorker },
    { default: TsWorker },
    { default: CSSWorker },
    { default: HTMLWorker },
  ] = await Promise.all([
    import('monaco-editor/esm/vs/editor/editor.worker?worker' as any),
    import('monaco-editor/esm/vs/language/json/json.worker?worker' as any),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker' as any),
    import('monaco-editor/esm/vs/language/css/css.worker?worker' as any),
    import('monaco-editor/esm/vs/language/html/html.worker?worker' as any),
  ])

  // monaco要求将worker挂载到window上
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new JSONWorker()
      }
      if (label === "html") {
        return new HTMLWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new TsWorker()
      }
      if (label === 'css') {
        return new CSSWorker()
      }

      return new EditorWorker()
    },
  }
})

export const useMonacoImport = createSinglePromise(async() => {
  if (typeof window !== 'undefined')
    return await import('monaco-editor')

  return null
})

export const setupMonaco = createSinglePromise(async () => {
  const monaco = await useMonacoImport()

  if (!monaco) {
    throw "can not load moncao"
  }

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    moduleResolution: 2,
    allowUnusedLabels: true,
    strict: false,
    allowJs: true,
    importHelpers: true,
    noImplicitUseStrict: false,
  })

  const packages = new Map<string, {
    content: string;
    filePath?: string;
  }>()

  await loadWorkers()

  return {
    monaco,
    addPackage (options: Array<{name: string, types: string}>) {
      options.forEach(opt => {
        if (packages.has(opt.name)) {
          return
        }
        const lib =  {
          content: `declare module '${opt.name}' { ${opt.types} } `
        }
        packages.set(opt.name, lib)
      })
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(Array.from(packages.values()))
    },
    deletePackage (names: string[]) {
      names.forEach(name => {
        packages.delete(name)
      })
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(Array.from(packages.values()))
    }
  }
})

export default setupMonaco

// preload worker
loadWorkers()
