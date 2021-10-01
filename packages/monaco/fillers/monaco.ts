import { createSinglePromise } from "@ui-elements/utils"
import * as monaco from "monaco-editor"
const innerStyle = await import("./virtual-monaco-editor.css?virtualMonacoCSS")

type monaco = typeof monaco

interface MonacoEditorImportData {
  monaco: monaco
  style: HTMLStyleElement
}

export const useMonacoEditorMain = createSinglePromise<MonacoEditorImportData>(async() => {
  if (typeof window !== 'undefined') {

    const style = document.createElement("style")
    style.innerHTML = innerStyle.default

    return {
      monaco,
      style,
    }
  }

  throw "can not load moncao"
})
