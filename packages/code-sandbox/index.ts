import CodeSandbox from "./src/code-sandbox"

export function install() {
  window.customElements.define("code-sandbox", CodeSandbox)
}
