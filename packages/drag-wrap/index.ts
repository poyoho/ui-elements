import DrapWrap from "./src/drap-wrap"

declare global {
  interface Window {
    DrapWrap: typeof DrapWrap
  }
  interface HTMLElementTagNameMap {
    "drap-wrap": DrapWrap
  }
}

export function install() {
  if (!window.customElements.get("drap-wrap")) {
    window.DrapWrap = DrapWrap
    window.customElements.define("drap-wrap", DrapWrap)
  }
}
