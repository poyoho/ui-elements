import UnpkgManage from "./element/unpkg-manage"
import type { PackageMetadata, UnpkgChangeEventDetail } from "./element/unpkg-manage"
import * as SelectBox from "@ui-elements/select-box"
export * from "./libs"
export { UnpkgManage, PackageMetadata, UnpkgChangeEventDetail }

declare global {
  interface Window {
    UnpkgManage: typeof UnpkgManage
  }
  interface HTMLElementTagNameMap {
    "unpkg-manage": UnpkgManage
  }

  interface HTMLElementEventMap {
    "unpkg-change": CustomEvent<UnpkgChangeEventDetail>
  }
}

export function install() {
  if (!window.customElements.get("unpkg-manage")) {
    SelectBox.install()
    window.UnpkgManage = UnpkgManage
    window.customElements.define("unpkg-manage", UnpkgManage)
  }
}
