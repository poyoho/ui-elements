import TabContainer from "./src/tab-container"

declare global {
  interface Window {
    TabContainer: typeof TabContainer
  }
  interface HTMLElementTagNameMap {
    "tab-container": TabContainer
  }
}

export function install() {
  if (!window.customElements.get("tab-container")) {
    window.TabContainer = TabContainer
    window.customElements.define("tab-container", TabContainer)
  }
}
