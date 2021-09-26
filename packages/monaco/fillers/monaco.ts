import { createSinglePromise } from "@ui-elements/utils"
import loaderURL from "monaco-editor/min/vs/loader.js?url"
import styleURL from "monaco-editor/min/vs/editor/editor.main.css?url"

type monaco = typeof monaco

interface MonacoEditorImportData {
  monaco: monaco
  style: HTMLStyleElement
}

export const useMonacoEditorMain = createSinglePromise<MonacoEditorImportData>(async() => {
  if (typeof window !== 'undefined') {

    const innerStyle = document.createElement('style');
    innerStyle.innerText = `@import "${styleURL}";`
    console.log(styleURL)

    const script = document.createElement("script")
    script.src = loaderURL.replace("export default", "")
    document.body.appendChild(script)

    return new Promise(resolve => {
      script.onload = async () => {
        const editorURL = loaderURL.replace("loader.js", "")
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
