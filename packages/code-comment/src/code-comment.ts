import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

interface State {
  sourceNode: HTMLElement
  commentNode: HTMLElement
  wrapNode: HTMLElement
  topNode: HTMLElement
  topLeftNode: HTMLElement
  topRightNode: HTMLElement
  bottomOccupyNode: HTMLElement

  paddingTopAttr: string
  commentHeight: number
}

interface BottomStickyCallback {
  onBottomSticky: () => void
  outBottomSticky: () => void
}

let observer: IntersectionObserver
const eventMap = new WeakMap<HTMLElement, BottomStickyCallback>()
const states = new WeakMap<CodeCommentElement, State>()

function createBottomSticky (opts: {
  observeNode: HTMLElement
} & BottomStickyCallback) {
  eventMap.set(opts.observeNode, opts)
  if (!observer) {
    observer = new IntersectionObserver((records) => {
      for (const record of records) {
        const ratio = record.intersectionRatio
        const targetInfo = record.boundingClientRect
        const rootBoundsInfo = record.rootBounds!
        const fn = eventMap.get(record.target as HTMLElement)
        if (!fn) {
          return
        }
        if (targetInfo.top - rootBoundsInfo.top > 0 && ratio === 1) {
          fn.outBottomSticky()
        }

        if (targetInfo.top - rootBoundsInfo.top < 0 &&
          targetInfo.bottom - rootBoundsInfo.bottom < 0
        ) {
          fn.onBottomSticky()
        }
      }
    }, { threshold: [1] })
  }
  observer.observe(opts.observeNode)
  return () => {
    eventMap.delete(opts.observeNode)
    observer.unobserve(opts.observeNode)
  }
}

function mouseDown (e: MouseEvent) {
  const target = e.currentTarget! as HTMLElement
  const hostElement = getShadowHost(target) as CodeCommentElement
  const state = states.get(hostElement)!

  const startX = e.clientX
  const maxWidth = state.sourceNode.parentElement!.clientWidth
  const sourceCurrentWidth = state.sourceNode.clientWidth
  const mounseMove = (e: MouseEvent) => {
    const offset = e.clientX - startX
    const changeWidth = sourceCurrentWidth + offset
    if (changeWidth > maxWidth || changeWidth < 0) {
      return
    }
    let sourceWidth = (changeWidth * 100) / maxWidth
    if (sourceWidth < 5) {
      sourceWidth = 0
    } else if (sourceWidth > 95) {
      sourceWidth = 100
    }
    state.sourceNode.style.width = sourceWidth + "%"
    state.commentNode.style.width = (100 - sourceWidth) + "%"
    state.topLeftNode.style.width = sourceWidth + "%"
    state.topRightNode.style.width = (100 - sourceWidth) + "%"

    if (sourceWidth === 0) {
      state.sourceNode.style.paddingLeft = "0px"
      state.commentNode.style.paddingLeft = "0px"
    } else if (sourceWidth === 100) {
      state.sourceNode.style.paddingLeft = "0px"
      state.commentNode.style.paddingLeft = "0px"
      state.topRightNode.style.opacity = "0"
    } else {
      state.sourceNode.style.paddingLeft = "10px"
      state.commentNode.style.paddingLeft = "10px"
      state.topRightNode.style.opacity = "1"
    }
  }

  document.addEventListener("mousemove", mounseMove)
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", mounseMove)
  })
}

function fullScreen (e: Event) {
  const target = e.currentTarget! as HTMLElement
  const hostElement = getShadowHost(target) as CodeCommentElement
  const { commentNode, wrapNode, sourceNode } = states.get(hostElement)!

  if (wrapNode.classList.toggle("full-screen")) {
    sourceNode.style.height = "100%"
    commentNode.style.height = "100%"
  } else {
    const staticHeight = Math.max(sourceNode.offsetHeight, commentNode.offsetHeight) + 20
    sourceNode.style.height = staticHeight + 'px'
    commentNode.style.height = staticHeight + 'px'
  }
}

// TODO 立即左右全屏 上下分屏

export default class CodeCommentElement extends HTMLElement {
  private cancelObserve = () => {}
  private resizeEvent = () => {}

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  get wrap (): HTMLElement {
    return this.shadowRoot!.querySelector(".code-comment")!
  }

  get source (): HTMLElement {
    return this.shadowRoot!.querySelector(".source-wrap")!
  }

  get comment (): HTMLElement {
    return this.shadowRoot!.querySelector(".comment-wrap")!
  }

  get split (): HTMLElement {
    return this.shadowRoot!.querySelector(".split")!
  }

  get control (): HTMLElement {
    return this.shadowRoot!.querySelector(".control")!
  }

  get top (): HTMLElement {
    return this.shadowRoot!.querySelector(".top")!
  }

  get topRight (): HTMLElement {
    return this.shadowRoot!.querySelector(".comment-content")!
  }

  get topLeft (): HTMLElement {
    return this.shadowRoot!.querySelector(".top-left-occupy")!
  }

  get topOccupy (): HTMLElement {
    return this.shadowRoot!.querySelector(".top-occupy")!
  }

  get bottomOccupy (): HTMLElement {
    return this.shadowRoot!.querySelector(".bottom-occupy")!
  }

  connectedCallback() {
    const { wrap, source, comment, control, split, top, topLeft, topRight, bottomOccupy } = this
    const state: State = {
      sourceNode: source,
      commentNode: comment,
      wrapNode: wrap,
      topNode: top,
      topLeftNode: topLeft,
      topRightNode: topRight,
      bottomOccupyNode: bottomOccupy,

      paddingTopAttr: this.getAttribute("paddingTop") || "0",
      commentHeight: topRight.clientHeight,
    }

    top.style.top = state.paddingTopAttr
    states.set(this, state)

    this.cancelObserve = (() => createBottomSticky({
      observeNode: bottomOccupy,
      onBottomSticky: () => {
        const { commentHeight } = states.get(this)!
        top.style.position = "absolute"
        top.style.top = "auto"
        top.style.bottom = "0"
        top.style.transform = `translateY(-${commentHeight+40}px)` // 40px is control bar height
      },
      outBottomSticky: () => {
        const { paddingTopAttr } = states.get(this)!
        top.style.position = "sticky"
        top.style.top = paddingTopAttr
        top.style.bottom = "auto"
        top.style.transform = "none"
      },
    }))()
    this.resizeEvent = () => resize(this)

    this.resizeEvent()
    window.addEventListener('resize', this.resizeEvent)
    split.addEventListener("mousedown", mouseDown)
    control.addEventListener("click", fullScreen)
  }

  disconnectedCallback() {
    const { split, control } = this

    split && split.removeEventListener("mousedown", mouseDown)
    control && control.removeEventListener("click", fullScreen)
    window.removeEventListener("resize", this.resizeEvent)
    this.cancelObserve()
  }
}

function resize (hostElement: CodeCommentElement) {
  const state = states.get(hostElement)!

  const wrapHeight = Math.max(state.sourceNode.offsetHeight, state.commentNode.offsetHeight)
  state.topRightNode.style.height = "auto"
  state.commentHeight = state.topRightNode.clientHeight
  state.topRightNode.style.height = "0"

  state.sourceNode.style.height = wrapHeight + 'px'
  state.commentNode.style.height = wrapHeight + 'px'
  state.bottomOccupyNode.style.height = `calc(${state.paddingTopAttr} + ${state.commentHeight}px)` // 占位符
}
