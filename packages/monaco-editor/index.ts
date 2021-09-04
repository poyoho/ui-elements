import MonacoEditor from "./src/monaco-editor"

declare global {
  interface Window {
    MonacoEditor: typeof MonacoEditor
  }
  interface HTMLElementTagNameMap {
    "monaco-editor": MonacoEditor
  }
}

export function install() {
  if (!window.customElements.get("monaco-editor")) {
    window.MonacoEditor = MonacoEditor
    window.customElements.define("monaco-editor", MonacoEditor)
  }
}
