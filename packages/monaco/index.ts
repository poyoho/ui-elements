import { createSinglePromise, tryPromise } from "@ui-elements/utils"

export * from "./textmate"
import { setupTypescriptLanguageService } from "./setup"
import { useMonacoEditorMain } from "./fillers/monaco"
type monaco = typeof monaco

export async function getEmitResult (monaco: monaco, model: monaco.editor.ITextModel) {
  // sometimes typescript worker is not loaded
  const worker = await tryPromise(() => monaco.languages.typescript.getTypeScriptWorker(), 3, 100)
  const client = await worker(model.uri)
  return await client.getEmitOutput(model.uri.toString())
}

export async function getRunnableJS (monaco: monaco, model: monaco.editor.ITextModel) {
  const result = await getEmitResult(monaco, model)
  const firstJS = result.outputFiles.find((o: any) => o.name.endsWith(".js"))
  return (firstJS && firstJS.text) || ""
}

export const SupportLanguage = {
  "vuehtml": "vuehtml",
  "html": "html",
  "js": "javascript",
  "ts": "typescript",
  "css": "css",
  "json": "json"
}

export const loadWorkers = createSinglePromise(async () => {
  const [
    {},
    { default: VueHTMLWorker },
    { default: EditorWorker },
    { default: JSONWorker },
    { default: TsWorker },
    { default: CSSWorker },
    { default: HTMLWorker },
  ] = await Promise.all([
    import("./language/vuehtml/monaco.contribution" as any),
    import('./language/vuehtml/vuehtml.worker.js?worker' as any),
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
      console.log("[load worker]", label)
      switch(label) {
        case 'json':
          return new JSONWorker()
        case 'vuehtml':
          return new VueHTMLWorker()
        case 'html':
          return new HTMLWorker()
        case 'typescript':
        case 'javascript':
          return new TsWorker()
        case 'css':
          return new CSSWorker()
        default:
          return new EditorWorker()
      }
    },
  }
})

export const setupMonaco = createSinglePromise(async () => {
  const { monaco, style } = await useMonacoEditorMain()

  await loadWorkers()

  return {
    monaco,
    style,
    typescript: setupTypescriptLanguageService(monaco),
  }
})

export default setupMonaco
