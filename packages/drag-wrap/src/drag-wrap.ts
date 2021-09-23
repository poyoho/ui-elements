import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./drag-wrap-element"

type direction = "row" | "column"

function calcPostion (
  clickPostion: number,
  items: Array<HTMLElement>,
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
  if (postion.start - postion.end >= 0) {
    postion.end = postion.start + 1
  } else if (
    postion.end - postion.start > 1
    // && clientSize(items[postion.end]) === sum
  ) {
    postion.start = postion.end - 1
  }
  return {
    start: items[postion.start],
    end: items[postion.end]
  }
}

function itemsUserSelect (items: Array<HTMLElement>, enable: boolean) {
  items.forEach(item => {
    item.style.userSelect = enable ? "auto" : "none"
  })
}

function mouseDown (e: MouseEvent) {
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
    direction === "row" ? (elm.style.width = size) : (elm.style.height = size)
  const updatePostion = (e: MouseEvent) => {
    const wrapSize = clientSize(wrap)
    console.log("[wrapsize]", wrap.clientWidth)
    const postion = calcPostion(clientOffset(e), items, clientSize)
    const maxSize = clientSize(postion.start) + clientSize(postion.end)
    const startSize = clientSize(postion.start)
    const maxPercent = maxSize * 100 / wrapSize
    const startPostion = clientPostion(e)
    return {
      startPostion,
      postion,
      maxSize,
      startSize,
      maxPercent,
      wrapSize
    }
  }

  itemsUserSelect(items, false)
  let cItem = updatePostion(e)
  const mounseMove = (e: MouseEvent) => {
    const startOffsetSize = cItem.startSize + (clientPostion(e) - cItem.startPostion)
    if (startOffsetSize > cItem.maxSize || startOffsetSize < 0) {
      // cItem = updatePostion(e)
      return
    }
    let startPercentSize = (startOffsetSize * 100) / cItem.wrapSize
    if (startPercentSize < 2) {
      startPercentSize = 0
    } else if (startPercentSize > cItem.maxPercent - 2) {
      startPercentSize = cItem.maxPercent
    }
    changeSize(cItem.postion.start, startPercentSize + "%")
    changeSize(cItem.postion.end, (cItem.maxPercent - startPercentSize) + "%")
  }

  document.addEventListener("mousemove", mounseMove)
  document.addEventListener("mouseup", () => {
    itemsUserSelect(items, true)
    document.removeEventListener("mousemove", mounseMove)
  })
}

function stopPropagation (e: Event) {
  e.stopPropagation()
}

function formatDirection (item: string): direction {
  if (["row", "column"].includes(item)) {
    return item as any
  }
  return "row"
}

let id = 0

export default class DrapWrap extends HTMLElement {
  #direction: "row" | "column" = "row"
  #id = ++id
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
    this.setAttribute("data-index", `${this.#id}`)
  }

  get direction () {
    return this.#direction
  }

  get items (): Array<HTMLElement> {
    return Array.from(this.ownerDocument.querySelectorAll(`[data-index='${this.#id}']>[slot='item']`))
      .filter(item => !item.hasAttribute("hidden")) as Array<HTMLElement>
  }

  get wrap (): HTMLElement {
    return this.shadowRoot!.querySelector(".drag-wrap")!
  }

  connectedCallback () {
    this.attributeChangedCallback()
    this.updateItems()
  }

  disconnectedCallback () {
    const { wrap, items } = this
    items.forEach(item => item.removeEventListener("mousedown", stopPropagation))
    wrap.removeEventListener("mousedown", mouseDown)
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

    console.log("[drag-wrap] update item");
    items.forEach((item) => {
      item.style.cursor = "auto"
      direction === "row" ? (item.style.width = itemSize) : (item.style.height = itemSize)
      item.addEventListener("mousedown", stopPropagation)
    })

    wrap.addEventListener("mousedown", mouseDown)
  }
}
