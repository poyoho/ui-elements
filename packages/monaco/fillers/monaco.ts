import { createSinglePromise } from "@ui-elements/utils"
import loaderURL from "monaco-editor/min/vs/loader.js?url"
import styleURL from "monaco-editor/min/vs/editor/editor.main.css?import&url"
// import monacoURL from "monaco-editor/min/vs/*?url"

type monaco = typeof monaco

interface MonacoEditorImportData {
  monaco: monaco
  style: HTMLStyleElement
}
console.log(styleURL)
export const useMonacoEditorMain = createSinglePromise<MonacoEditorImportData>(async() => {
  if (typeof window !== 'undefined') {

    const innerStyle = document.createElement('style');
    innerStyle.innerText = `@import "${styleURL}";`
    console.log(styleURL)

    const script = document.createElement("script")
    script.src = loaderURL
    document.body.appendChild(script)

    return new Promise(resolve => {
      script.onload = async () => {
        ;(require as any).config({
          paths: { vs: "monacoURL" },
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
