import Tree from "./src/tree"

declare global {
  interface Window {
    Tree: typeof Tree
  }
  interface HTMLElementTagNameMap {
    "tree": Tree
  }
}

export function install() {
  if (!window.customElements.get("tree")) {
    window.Tree = Tree
    window.customElements.define("tree", Tree)
  }
}
