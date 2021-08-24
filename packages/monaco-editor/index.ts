import MonacoEditor from "./src/monaco-editor"

export function install() {
  window.customElements.define("monaco-editor", MonacoEditor)
}
