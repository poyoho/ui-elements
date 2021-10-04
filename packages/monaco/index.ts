import { createSinglePromise } from "@ui-elements/utils"

export * from "./textmate"
import { useMonacoEditorMain } from "./fillers/monaco"
import { setupTypescriptLanguageService } from "./setup"

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
    _, // just import it
    { default: VueHTMLWorker },
    { default: EditorWorker },
    { default: JSONWorker },
    { default: TsWorker },
    { default: CSSWorker },
    { default: HTMLWorker },
  ] = await Promise.all([
    import("./language/vuehtml/monaco.contribution"),
    import('./language/vuehtml/vuehtml.worker.ts?worker'),
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
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
