import teamplateElement from "./code-comment-element"

export default class CodeCommentElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  get source () {
    return this.querySelector("[slot='source']")!
  }

  get comment () {
    return this.querySelectorAll("[slot='comment']")!
  }

  connectedCallback() {
    Array.from(this.source.children).forEach(elm => {
      const css = getComputedStyle(elm)
      console.log(css.display)
    })
  }

  disconnectedCallback() {
  }
}
