import CodeCommentElement from "./src/code-comment"

export function install() {
  window.customElements.define("code-comment", CodeCommentElement)
}
