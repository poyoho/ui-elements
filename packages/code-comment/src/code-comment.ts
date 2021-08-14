import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

interface State {
  sourceNode: HTMLElement
  commentNode: HTMLElement
  wrapNode: HTMLElement
  topLeftNode: HTMLElement
  topRightNode: HTMLElement
}

const states = new WeakMap<CodeCommentElement, State>()

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

export default class CodeCommentElement extends HTMLElement {
  private cancelObserve = () => {}

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
      topLeftNode: topLeft,
      topRightNode: topRight,
    }

    const staticHeight = Math.max(source.offsetHeight, comment.offsetHeight) + 20
    const commentPaddintTop = this.getAttribute("paddingTop") || "0"
    source.style.height = staticHeight + 'px'
    comment.style.height = staticHeight + 'px'
    source.style.paddingLeft = '10px'
    comment.style.paddingLeft = '10px'
    top.style.top = commentPaddintTop
    bottomOccupy.style.height = `calc(${commentPaddintTop} + ${topRight.clientHeight}px)` // 占位符
    top.style.height = "0"
    states.set(this, state)

    this.cancelObserve = createBottomSticky({
      observeNode: bottomOccupy,
      onBottomSticky () {
        top.style.height = "auto"
        const commentHeight = top.clientHeight
        top.style.height = "0"

        top.style.position = "absolute"
        top.style.top = "auto"
        top.style.bottom = "0"
        top.style.transform = `translateY(-${commentHeight+40}px)` // 40px is control bar height
      },
      outBottomSticky () {
        top.style.position = "sticky"
        top.style.top = commentPaddintTop
        top.style.bottom = "auto"
        top.style.transform = "none"
      },
    })

    split.addEventListener("mousedown", mouseDown)
    control.addEventListener("click", fullScreen)
  }

  disconnectedCallback() {
    const { split, control } = this

    split && split.removeEventListener("mousedown", mouseDown)
    control && control.removeEventListener("click", fullScreen)
    this.cancelObserve()
  }
}

interface BottomStickyCallback {
  onBottomSticky: () => void
  outBottomSticky: () => void
}

let observer: IntersectionObserver
const eventMap = new Map<HTMLElement, BottomStickyCallback>()

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
