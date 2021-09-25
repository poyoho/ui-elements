import DrapWrap from "./src/drag-wrap"
export * from "./src/drag-wrap"
export { DrapWrap }

declare global {
  interface Window {
    DrapWrap: typeof DrapWrap
  }
  interface HTMLElementTagNameMap {
    "drag-wrap": DrapWrap
  }
}

export function install() {
  if (!window.customElements.get("drag-wrap")) {
    window.DrapWrap = DrapWrap
    window.customElements.define("drag-wrap", DrapWrap)
  }
}
