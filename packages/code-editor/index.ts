import CodeEditor from "./src/code-editor"

export function install() {
  window.customElements.define("code-editor", CodeEditor)
}
