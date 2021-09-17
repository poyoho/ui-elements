import templateElement from "./option-element"

export default class Option extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: "open" })
    const template = this.ownerDocument.createElement("template")
    template.innerHTML = templateElement
    const content = template.content.cloneNode(true)
    shadow.appendChild(content)
  }
}
