import CodeCommentElement from "./src/code-comment"

declare global {
  interface Window {
    CodeCommentElement: typeof CodeCommentElement
  }
  interface HTMLElementTagNameMap {
    "code-comment": CodeCommentElement
  }
}

export function install() {
  if (!window.customElements.get("code-comment")) {
    window.CodeCommentElement = CodeCommentElement
    window.customElements.define("code-comment", CodeCommentElement)
  }
}
