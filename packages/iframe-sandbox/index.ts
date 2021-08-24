import IframeSandbox from "./src/iframe-sandbox"

export function install() {
  window.customElements.define("iframe-sandbox", IframeSandbox)
}
