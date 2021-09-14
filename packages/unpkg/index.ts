export * from "./libs"
import UnpkgManage from "./element/unpkg-manage"

declare global {
  interface Window {
    UnpkgManage: typeof UnpkgManage
  }
  interface HTMLElementTagNameMap {
    "unpkg-manage": UnpkgManage
  }
}

export function install() {
  if (!window.customElements.get("unpkg-manage")) {
    window.UnpkgManage = UnpkgManage
    window.customElements.define("unpkg-manage", UnpkgManage)
  }
}
