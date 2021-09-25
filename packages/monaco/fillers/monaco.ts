import { createSinglePromise } from "@ui-elements/utils"
type monaco = typeof monaco

interface MonacoEditorImportData {
  monaco: monaco
  style: HTMLStyleElement
}

export const useMonacoEditorMain = createSinglePromise<MonacoEditorImportData>(async() => {
  if (typeof window !== 'undefined') {
    const loaderURL = new URL("../../../node_modules/monaco-editor/min/vs/loader.js", import.meta.url) // load amd loader
    const styleURL = new URL("../../../node_modules/monaco-editor/min/vs/editor/editor.main.css", import.meta.url)

    const innerStyle = document.createElement('style');
    innerStyle.innerText = `@import "${styleURL.href}";`

    const script = document.createElement("script")
    script.src = loaderURL.href
    document.body.appendChild(script)

    return new Promise(resolve => {
      script.onload = async () => {
        const editorURL = loaderURL.href.replace("loader.js", "")
        ;(require as any).config({
          paths: { vs: editorURL },
          'vs/css': { disabled: true } // dont't load css, and load with editor.main.css
        })
        ;(require as any)(['vs/editor/editor.main'], (monaco: any) => {
          resolve({
            monaco,
            style: innerStyle
          })
        })
      }
    })
  }

  throw "can not load moncao"
})
