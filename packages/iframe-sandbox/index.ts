import IframeSandbox from "./src/iframe-sandbox"

declare global {
  interface Window {
    IframeSandbox: typeof IframeSandbox
  }
  interface HTMLElementTagNameMap {
    "iframe-sandbox": IframeSandbox
  }
}

export function install() {
  if (!window.customElements.get("iframe-sandbox")) {
    window.IframeSandbox = IframeSandbox
    window.customElements.define("iframe-sandbox", IframeSandbox)
  }
}
