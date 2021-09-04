import DemoBlockElement from "./src/demo-block"

declare global {
  interface Window {
    DemoBlockElement: typeof DemoBlockElement
  }
  interface HTMLElementTagNameMap {
    "demo-block": DemoBlockElement
  }
}

export function install() {
  if (!window.customElements.get("demo-block")) {
    window.DemoBlockElement = DemoBlockElement
    window.customElements.define("demo-block", DemoBlockElement)
  }
}
