import * as SelectBox from "@ui-elements/select-box"

import type { PackageMetadata, UnpkgChangeEventDetail } from "./element/unpkg-manage"
import UnpkgManage from "./element/unpkg-manage"
export * from "./libs"
export { PackageMetadata, UnpkgChangeEventDetail,UnpkgManage }

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
