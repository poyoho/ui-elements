import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

interface ModeCache {
  topHeight: string
  topPostion: string
  topTop: string
  topBottom: string
  topOverflowY: string
  topTransform: string
  topLeftWidth: string
  topRightWidth: string
  contentWrapFlexDirection: string
  sourceWrapWidth: string
  commentWrapWidth: string
}

export type Mode = "leftRight" | "topBottom"

interface State {
  observer: {
    observe: () => void
    unobserve: () => void
  }
  resize: () => void
  upDownSplitScreen: () => void

  mode: Mode
  paddingTopAttr: string
  willChangeSourceWidth: number
  cache: ModeCache
}

interface BottomStickyCallback {
  onBottomSticky: () => void
  outBottomSticky: () => void
}

const states = new WeakMap<CodeCommentElement, State>()

const createBottomSticky = (() => {
  const eventMap = new WeakMap<HTMLElement, BottomStickyCallback>()
  const observer = new IntersectionObserver((records) => {
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
      if (targetInfo.top - rootBoundsInfo.top < 0 && targetInfo.bottom - rootBoundsInfo.bottom < 0) {
        fn.onBottomSticky()
      }
    }
  }, { threshold: [1] })

  return (opts: { observeNode: HTMLElement } & BottomStickyCallback) => {
    const eventHandle = {
      onBottomSticky: opts.onBottomSticky,
      outBottomSticky: opts.outBottomSticky,
    }
    eventMap.set(opts.observeNode, eventHandle)
    return {
      ...observer,
      observe: () => {
        eventMap.set(opts.observeNode, eventHandle)
        observer.observe(opts.observeNode)
      },
      unobserve: () => {
        eventMap.delete(opts.observeNode)
        observer.unobserve(opts.observeNode)
      }
    }
  }
})()

function mouseDown (e: MouseEvent) {
  const target = e.currentTarget! as HTMLElement
  const hostElement = getShadowHost(target) as CodeCommentElement
  const { source, comment, topLeft, topRight, bottomOccupy, top } = hostElement
  const state = states.get(hostElement)!

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

    if (top.scrollHeight > comment.clientHeight && !state.willChangeSourceWidth) {
      const currentStyle = window.getComputedStyle(top)
      state.cache.topHeight = currentStyle.height
      state.cache.topPostion = currentStyle.position
      state.cache.topOverflowY = currentStyle.overflow
      state.cache.topTop = currentStyle.top
      top.style.cssText = `
        height: ${comment.style.height};
        position: absolute;
        overflow-y: scroll;
        top: 0;
      `
      state.willChangeSourceWidth = sourceWidth
      states.set(hostElement, state)
    } else if (sourceWidth < state.willChangeSourceWidth && state.willChangeSourceWidth) {
      top.style.height = state.cache.topHeight
      top.style.position = state.cache.topPostion
      top.style.overflow = state.cache.topOverflowY
      top.style.top = state.cache.topTop
      state.willChangeSourceWidth = 0
      states.set(hostElement, state)
    }

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
    bottomOccupy.style.height = `calc(${state.paddingTopAttr} + ${topRight.scrollHeight + 30}px)` // 占位符
    states.set(hostElement, state)
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
    source.style.height = staticHeight + "px"
    comment.style.height = staticHeight + "px"
  }
}

function resize (hostElement: CodeCommentElement) {
  const state = states.get(hostElement)!
  const { source, comment, topRight, bottomOccupy } = hostElement
  const wrapHeight = Math.max(source.offsetHeight, comment.offsetHeight)

  source.style.height = wrapHeight + "px"
  comment.style.height = wrapHeight + "px"
  bottomOccupy.style.height = `calc(${state.paddingTopAttr} + ${topRight.scrollHeight + 20}px)` // 占位符

  states.set(hostElement, state)
}

function toggleShowMode (hostElement: CodeCommentElement) {
  const { contentWrap, comment, source, top, topLeft, topRight } = hostElement
  const state = states.get(hostElement)!

  let cache: ModeCache
  if (state.mode === "leftRight") {
    state.cache = {
      topOverflowY: top.style.overflow,
      topHeight: top.style.height,
      topPostion: top.style.position,
      topTop: top.style.top,
      topBottom: top.style.bottom,
      topTransform: top.style.transform,
      topLeftWidth: topLeft.style.width,
      topRightWidth: topRight.style.width,
      contentWrapFlexDirection: contentWrap.style.flexDirection,
      sourceWrapWidth: source.style.width,
      commentWrapWidth: comment.style.width,
    }
    state.mode = "topBottom"
    states.set(hostElement, state)
    cache = {
      topOverflowY: "none",
      topHeight: "0",
      topPostion: "absolute",
      topTop: "0",
      topBottom: "auto",
      topTransform: "none",
      topLeftWidth: "0",
      topRightWidth: "100%",
      contentWrapFlexDirection: "column-reverse",
      sourceWrapWidth: "100%",
      commentWrapWidth: "100%",
    }
  } else if (state.mode === "topBottom") {
    state.mode = "leftRight"
    cache = state.cache!
    states.set(hostElement, state)
  } else {
    return
  }

  top.style.overflow = cache.topOverflowY
  top.style.height = cache.topHeight
  top.style.position = cache.topPostion
  top.style.top = cache.topTop
  top.style.bottom = cache.topBottom
  top.style.transform = cache.topTransform
  topLeft.style.width = cache.topLeftWidth
  topRight.style.width = cache.topRightWidth
  contentWrap.style.flexDirection = cache.contentWrapFlexDirection
  source.style.width = cache.sourceWrapWidth
  comment.style.width = cache.commentWrapWidth

  // need calc
  if (state.mode === "topBottom") {
    state.observer.unobserve()
    comment.style.height = topRight.scrollHeight + 20 + "px"
  } else if (state.mode === "leftRight") {
    state.observer.observe()
    comment.style.height = source.style.height
  }
}

export default class CodeCommentElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback() {
    const { wrap, source, comment, control, split, top, topLeft, topRight, bottomOccupy } = this

    const observer = createBottomSticky({
      observeNode: bottomOccupy,
      onBottomSticky: () => {
        top.style.position = "absolute"
        top.style.top = "auto"
        top.style.bottom = "0"
        top.style.transform = `translateY(-${topRight.scrollHeight+20+40}px)` // 40px is control bar height
      },
      outBottomSticky: () => {
        const { paddingTopAttr } = states.get(this)!
        top.style.position = "sticky"
        top.style.top = paddingTopAttr
        top.style.bottom = "auto"
        top.style.transform = "none"
      },
    })

    const state: State = {
      paddingTopAttr: this.getAttribute("paddingTop") || "0",
      willChangeSourceWidth: 0,
      mode: "leftRight",
      observer: observer,
      cache: {
        topOverflowY: "",
        topHeight: "",
        topPostion: "",
        topTop: "",
        topBottom: "",
        topTransform: "",
        topLeftWidth: "",
        topRightWidth: "",
        contentWrapFlexDirection: "",
        sourceWrapWidth: "",
        commentWrapWidth: "",
      },

      resize: () => resize(this),
      upDownSplitScreen: () => toggleShowMode(this),
    }
    top.style.top = state.paddingTopAttr
    states.set(this, state)

    state.resize()
    observer.observe()
    window.addEventListener("resize", state.resize)
    split.addEventListener("mousedown", mouseDown)
    control.addEventListener("click", state.upDownSplitScreen)
  }

  disconnectedCallback() {
    const { split, control } = this
    const state = states.get(this)!
    states.delete(this)

    split && split.removeEventListener("mousedown", mouseDown)
    control && control.removeEventListener("click", fullScreen)
    state && window.removeEventListener("resize", state.resize)
    state && state.observer.unobserve()
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
