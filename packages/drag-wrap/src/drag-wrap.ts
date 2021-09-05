import { getShadowHost } from "@ui-elements/utils"
import { couldStartTrivia } from "typescript"
import teamplateElement from "./drag-wrap-element"

type direction = "row" | "column"

function mouseDown (e: MouseEvent) {
  const target = e.currentTarget! as HTMLElement
  const hostElement = getShadowHost(target) as DrapWrap
  const { items } = hostElement
  console.log("mouseDown", e, items)

  const startX = e.clientX
  const mounseMove = (e: MouseEvent) => {
    console.log("mounseMove", e)
  }

  document.addEventListener("mousemove", mounseMove)
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", mounseMove)
  })
}

function formatDirection (item: string): direction {
  if (["row", "column"].includes(item)) {
    return item as any
  }
  return "row"
}

export default class DrapWrap extends HTMLElement {
  #direction: "row" | "column" = "row"
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  get direction () {
    return this.#direction
  }

  get items (): NodeListOf<HTMLElement> {
    return this.querySelectorAll("[slot='item']")
  }

  get wrap (): HTMLElement {
    return this.shadowRoot!.querySelector(".drag-wrap")!
  }

  connectedCallback () {
    this.attributeChangedCallback()
    this.updateItems()
  }

  disconnectedCallback () {

  }

  attributeChangedCallback () {
    const attr = this.attributes.getNamedItem("direction")
    this.#direction = attr ? formatDirection(attr.value) : "row"
    this.wrap.style.flexDirection = this.#direction
  }

  updateItems () {
    const { items, wrap } = this
    const itemWidth = (100 / items.length) + "%"
    console.log(items);

    items.forEach((item) => {
      item.style.width = itemWidth
      item.style.cursor = "auto"
      item.addEventListener("mousedown", (e) => e.stopPropagation())
    })

    wrap.addEventListener("mousedown", mouseDown)
  }
}
