import teamplateElement from "./code-comment-element"

export default class CodeCommentElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  get comment () {
    return this.querySelectorAll("[slot='comment']")!
  }

  connectedCallback() {
    this.comment.forEach(el => {
      const top = el.getAttribute("top")
    })
  }

  disconnectedCallback() {
  }
}
