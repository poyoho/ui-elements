import teamplateElement from "./drap-wrap-element"

export default class DrapWrap extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback() {

  }

  disconnectedCallback() {

  }
}
