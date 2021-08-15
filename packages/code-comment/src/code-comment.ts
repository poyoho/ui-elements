import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

interface State {
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
  const { source, comment, topLeft, topRight } = hostElement

  const startX = e.clientX
  const maxWidth = source.parentElement!.clientWidth
  const sourceCurrentWidth = source.clientWidth
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
    source.style.width = sourceWidth + "%"
    comment.style.width = (100 - sourceWidth) + "%"
    topLeft.style.width = sourceWidth + "%"
    topRight.style.width = (100 - sourceWidth) + "%"

    if (sourceWidth === 0) {
      source.style.paddingLeft = "0px"
      comment.style.paddingLeft = "0px"
    } else if (sourceWidth === 100) {
      source.style.paddingLeft = "0px"
      comment.style.paddingLeft = "0px"
      topRight.style.opacity = "0"
    } else {
      source.style.paddingLeft = "10px"
      comment.style.paddingLeft = "10px"
      topRight.style.opacity = "1"
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
  const { wrap, comment, source } = hostElement

  if (wrap.classList.toggle("full-screen")) {
    source.style.height = "100%"
    comment.style.height = "100%"
  } else {
    const staticHeight = Math.max(source.offsetHeight, comment.offsetHeight) + 20
    source.style.height = staticHeight + 'px'
    comment.style.height = staticHeight + 'px'
  }
}

function resize (hostElement: CodeCommentElement) {
  const state = states.get(hostElement)!
  const { source, comment, topLeft, topRight, bottomOccupy } = hostElement

  const wrapHeight = Math.max(source.offsetHeight, comment.offsetHeight)
  topRight.style.height = "auto"
  state.commentHeight = topRight.clientHeight
  topRight.style.height = "0"

  topLeft.style.width = "0"
  topRight.style.width = "100%"
  source.style.height = wrapHeight + 'px'
  comment.style.height = wrapHeight + 'px'
  bottomOccupy.style.height = `calc(${state.paddingTopAttr} + ${state.commentHeight}px)` // 占位符

  states.set(hostElement, state)
}

// TODO 立即左右全屏 上下分屏
function upDownSplitScreen (hostElement: CodeCommentElement) {
  const { contentWrap, comment, source, top, topRight } = hostElement

  const cache = {
    sourceWidth: "100%",
    commentWidth: "100%",
    topPostion: "absolute",
    topTop: "0",
    contentWrapFlexDirection: "column-reverse"
  }

  contentWrap.style.flexDirection = cache.contentWrapFlexDirection
  source.style.width = cache.sourceWidth
  comment.style.width = cache.commentWidth
  top.style.position = cache.topPostion
  top.style.top = cache.topTop

  topRight.style.height = "auto"
  const commentHeight = topRight.clientHeight
  topRight.style.height = "0"
  comment.style.height = commentHeight + "px"
}

export default class CodeCommentElement extends HTMLElement {
  private cancelObserve = () => {}
  private resizeEvent = () => {}
  private upDownSplitScreen = () => {}

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback() {
    this.resizeEvent = () => resize(this)
    this.upDownSplitScreen = () => upDownSplitScreen(this)
    const { wrap, source, comment, control, split, top, topLeft, topRight, bottomOccupy } = this
    const state: State = {
      paddingTopAttr: this.getAttribute("paddingTop") || "0",
      commentHeight: 0,
    }
    top.style.top = state.paddingTopAttr
    states.set(this, state)

    // this.cancelObserve = (() => createBottomSticky({
    //   observeNode: bottomOccupy,
    //   onBottomSticky: () => {
    //     const { commentHeight } = states.get(this)!
    //     top.style.position = "absolute"
    //     top.style.top = "auto"
    //     top.style.bottom = "0"
    //     top.style.transform = `translateY(-${commentHeight+40}px)` // 40px is control bar height
    //   },
    //   outBottomSticky: () => {
    //     const { paddingTopAttr } = states.get(this)!
    //     top.style.position = "sticky"
    //     top.style.top = paddingTopAttr
    //     top.style.bottom = "auto"
    //     top.style.transform = "none"
    //   },
    // }))()
    this.resizeEvent()
    this.upDownSplitScreen()
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

  get wrap (): HTMLElement {
    return this.shadowRoot!.querySelector(".code-comment")!
  }

  get contentWrap (): HTMLElement {
    return this.shadowRoot!.querySelector(".wrap")!
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

  get bottomOccupy (): HTMLElement {
    return this.shadowRoot!.querySelector(".bottom-occupy")!
  }
}
