import DemoBlockElement from "./src/demo-block"

export function install() {
  window.customElements.define("demo-block", DemoBlockElement)
}
