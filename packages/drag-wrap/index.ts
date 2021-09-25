import DragWrap from "./src/drag-wrap"
export * from "./src/drag-wrap"
export { DragWrap }

declare global {
  interface Window {
    DragWrap: typeof DragWrap
  }
  interface HTMLElementTagNameMap {
    "drag-wrap": DragWrap
  }
}

export function install() {
  if (!window.customElements.get("drag-wrap")) {
    window.DragWrap = DragWrap
    window.customElements.define("drag-wrap", DragWrap)
  }
}
