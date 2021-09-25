import teamplateElement from "./select-element"
import { getShadowHost } from "@ui-elements/utils"
import type OptionBox from "./option"

function toggleDrag (e: MouseEvent) {
  const target = e.target as HTMLElement
  const host = getShadowHost(target) as Select
  const { drop } = host
  drop.classList.toggle("show")
}

function selectDrop (e: MouseEvent) {
  const target = e.target as OptionBox
  if (target.tagName !== "OPTION-BOX") {
    return
  }
  const drop = e.currentTarget as HTMLDivElement
  const host = getShadowHost(drop) as Select
  const checkValue = target.getAttribute("value")!
  const event = new CustomEvent("change", { detail: checkValue })
  host.dispatchEvent(event)
  host.input.value = checkValue
  host.value = checkValue
  drop.classList.toggle("show")
}

export default class Select extends HTMLElement {
  public value = ""
  constructor() {
    super()
    const template = document.createElement("template")
    template.innerHTML = teamplateElement

    const shadowELe = this.attachShadow({ mode: "open" })
    const content = template.content.cloneNode(true)
    shadowELe.appendChild(content)
  }

  get input (): HTMLInputElement {
    return this.shadowRoot!.querySelector(".select-inner")!
  }

  get drop (): HTMLDivElement {
    return this.shadowRoot!.querySelector(".drop")!
  }

  connectedCallback() {
    const { input, drop } = this
    input.placeholder = this.getAttribute("placeholder") || ""
    input.addEventListener("click", toggleDrag)
    drop.addEventListener("click", selectDrop)
  }
  disconnectedCallback() {
    const { input, drop } = this
    input.removeEventListener("click", toggleDrag)
    drop.removeEventListener("click", selectDrop)
  }
}
