import { createSinglePromise } from "@ui-elements/utils"
import * as monacoESM from "monaco-editor"
import innerStyle from "./virtual-monaco-editor.css?virtualMonacoCSS"

type monaco = typeof monaco

interface MonacoEditorImportData {
  monaco: monaco
  style: HTMLStyleElement
}

export const useMonacoEditorMain = createSinglePromise<MonacoEditorImportData>(async() => {
  if (typeof window !== 'undefined') {

    const style = document.createElement("style")
    style.innerHTML = `@import "${innerStyle}"`

    return {
      monaco: monacoESM as monaco,
      style,
    }
  }

  throw "can not load moncao"
})
