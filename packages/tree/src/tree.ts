import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./tree-element"

export default class DrapWrap extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.style.width = "100%"
    wrap.style.height = "100%"
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback () {
  }

  disconnectedCallback () {
  }

  attributeChangedCallback () {
  }
}
