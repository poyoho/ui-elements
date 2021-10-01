import { createSinglePromise } from "@ui-elements/utils"
const innerStyle = await import("./virtual-monaco-editor.css?virtualMonacoCSS")
import * as monacoESM from "monaco-editor"

type monaco = typeof monaco

interface MonacoEditorImportData {
  monaco: monaco
  style: HTMLStyleElement
}

export const useMonacoEditorMain = createSinglePromise<MonacoEditorImportData>(async() => {
  if (typeof window !== 'undefined') {

    const style = document.createElement("style")
    style.innerHTML = `@import "${innerStyle.default}"`

    console.log(style);


    return {
      monaco: monacoESM as monaco,
      style,
    }
  }

  throw "can not load moncao"
})
