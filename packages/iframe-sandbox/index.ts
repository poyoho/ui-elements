import IframeSandbox from "./src/iframe-sandbox"
export * from "./src/iframe-sandbox"
export { IframeSandbox }
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
