import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./drag-wrap-element"

type direction = "row" | "column"

function calcPostion (
  clickPostion: number,
  items: NodeListOf<HTMLElement>,
  clientSize: (elm: HTMLElement) => number,
) {
  const postion = {
    start: 0,
    end: 0
  }
  let sum = 0

  for(let idx = 0; idx < items.length; idx++) {
    const item = items[idx]
    const itemSize = clientSize(item)
    sum += itemSize
    if (sum >= clickPostion) {
      postion.end = idx
      break
    } else if (itemSize !== 0) {
      postion.start = idx
    }
  }
  console.log(postion);
  if (postion.start >= postion.end) {
    postion.end = postion.start + 1
  }
  console.log(postion);
  return {
    start: items[postion.start],
    end: items[postion.end]
  }
}

function mouseDown (e: MouseEvent) {
  console.log("mousedown");
  const target = e.currentTarget! as HTMLElement
  const hostElement = getShadowHost(target) as DrapWrap
  const { items, wrap, direction } = hostElement

  const clientOffset = (e: MouseEvent) =>
    direction === "row" ? e.offsetX : e.offsetY
  const clientPostion = (e: MouseEvent) =>
    direction === "row" ? e.clientX : e.clientY
  const clientSize = (elm: HTMLElement) =>
    direction === "row" ? elm.clientWidth : elm.clientHeight
  const changeSize = (elm: HTMLElement, size: string) =>
    direction === "row" ? (elm.style.width = size) : (elm.style.height = size);

  const startPostion = clientPostion(e)
  const postion = calcPostion(clientOffset(e), items, clientSize)
  const wrapSize = clientSize(wrap)
  const startSize = clientSize(postion.start)
  const maxSize = clientSize(postion.start) + clientSize(postion.end)
  const maxPercent = maxSize * 100 / wrapSize
  console.log(postion)
  const mounseMove = (e: MouseEvent) => {
    const startOffsetSize = startSize + (clientPostion(e) - startPostion)
    if (startOffsetSize > maxSize || startOffsetSize < 0) {
      return
    }
    let startPercentSize = (startOffsetSize * 100) / wrapSize
    if (startPercentSize < 2) {
      startPercentSize = 0
    } else if (startPercentSize > maxPercent - 2) {
      startPercentSize = maxPercent
    }
    changeSize(postion.start, startPercentSize + "%")
    changeSize(postion.end, (maxPercent - startPercentSize) + "%")
    console.log(startPercentSize, maxPercent)
    // if (maxPercent === startPercentSize) {
    //   // mouseup
    //   const event = document.createEvent("MouseEvent")
    //   event.initEvent("mouseup", false, false)
    //   document.dispatchEvent(event)
    //   console.log(calcPostion(clientOffset(e), items, clientSize));
    // }
  }

  document.addEventListener("mousemove", mounseMove)
  document.addEventListener("mouseup", () => {
    console.log("mouse up")
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
    wrap.style.width = "100%"
    wrap.style.height = "100%"
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
    const { wrap } = this
    const attr = this.attributes.getNamedItem("direction")
    this.#direction = attr ? formatDirection(attr.value) : "row"
    wrap.style.cursor = this.#direction === "row" ? "col-resize" : "row-resize"
    wrap.style.flexDirection = this.#direction
  }

  updateItems () {
    const { items, wrap, direction } = this
    const itemSize = (100 / items.length) + "%"

    items.forEach((item, idx) => {
      item.style.cursor = "auto"
      if (!idx) {
        item.style.width = "100%"
      } else {
        item.style.width = "0"
      }
      // direction === "row" ? (item.style.width = itemSize) : (item.style.height = itemSize)
      item.addEventListener("mousedown", (e) => e.stopPropagation())
    })

    wrap.addEventListener("mousedown", mouseDown)
  }
}
