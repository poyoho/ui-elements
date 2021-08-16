import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

type NOOP = () => void
export type Mode = "leftRight" | "topBottom"

type StyleCache = Readonly<{
  top: {
    height: string
    position: string
    top: string
    bottom: string
    overflow: string
    transform: string
  }
  topRight: {
    width: string
  }
  topLeft: {
    width: string
  }
  contentWrap: {
    flexDirection: string
  }
  source: {
    width: string
  }
  comment: {
    width: string
  }
}>

interface Observer {
  observe: NOOP
  unobserve: NOOP
}

interface State {
  observer: Observer
  resize: NOOP
  upDownSplitScreen: NOOP

  mode: Mode
  paddingTopAttr: string
  willChangeSourceWidth: number
  cache: StyleCache[] // stack
}

interface BottomStickyCallback {
  onBottomSticky: NOOP
  outBottomSticky: NOOP
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

function pushStyleState (hostElement: CodeCommentElement) {
  console.log("pushStyleState")
  const { top, topLeft, topRight, contentWrap, source, comment } = hostElement
  const currentStyle = window.getComputedStyle(top)
  const state = states.get(hostElement)!

  state.cache.push({
    top: {
      overflow: currentStyle.overflowY,
      height: currentStyle.height,
      position: currentStyle.position,
      top: currentStyle.top,
      bottom: currentStyle.bottom,
      transform: currentStyle.transform,
    },
    topLeft: {
      width: topLeft.style.width,
    },
    topRight: {
      width: topRight.style.width
    },
    contentWrap: {
      flexDirection: contentWrap.style.flexDirection,
    },
    source: {
      width: source.style.width,
    },
    comment: {
      width: comment.style.width,
    }
  })
}


function useStyleState (hostElement: CodeCommentElement, state?: Partial<StyleCache>) {
  let topItem = state
  if (!topItem) {
    topItem = states.get(hostElement)!.cache.pop()!
  }
  const { top, topLeft, topRight, contentWrap, source, comment } = hostElement
  if (topItem) {
    Object.assign(top.style, topItem.top)
    Object.assign(topLeft.style, topItem.topLeft)
    Object.assign(topRight.style, topItem.topRight)
    Object.assign(contentWrap.style, topItem.contentWrap)
    Object.assign(source.style, topItem.source)
    Object.assign(comment.style, topItem.comment)
  }
}

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
      if (state.willChangeSourceWidth) {
        top.style.overflow = "scroll"
      }
    }
    bottomOccupy.style.height = `calc(${state.paddingTopAttr} + ${topRight.scrollHeight + 30}px)` // 占位符

    // topRight高度过高处理
    if (top.scrollHeight > comment.clientHeight && !state.willChangeSourceWidth) {
      pushStyleState(hostElement)
      useStyleState(hostElement, {
        top: {
          height: comment.style.height,
          position: "absolute",
          overflow: "scroll",
          top: "0",
          bottom: "auto",
          transform: "none"
        }
      })
      state.willChangeSourceWidth = sourceWidth
      state.observer.unobserve()
    } else if (sourceWidth < state.willChangeSourceWidth && state.willChangeSourceWidth) {
      useStyleState(hostElement)
      state.willChangeSourceWidth = 0
      state.observer.observe()
    }

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
  const { comment, source, topRight } = hostElement
  const state = states.get(hostElement)!

  if (state.mode === "leftRight") {
    pushStyleState(hostElement)
    state.mode = "topBottom"
    states.set(hostElement, state)
    useStyleState(hostElement, {
      top: {
        overflow: "visible",
        height: "0",
        position: "absolute",
        top: "0",
        bottom: "auto",
        transform: "none",
      },
      topLeft: {
        width: "0",
      },
      topRight: {
        width: "100%",
      },
      contentWrap: {
        flexDirection: "column-reverse",
      },
      source: {
        width: "100%",
      },
      comment: {
        width: "100%",
      }
    })
    state.observer.unobserve()
    comment.style.height = topRight.scrollHeight + 20 + "px"
  } else if (state.mode === "topBottom") {
    state.mode = "leftRight"
    states.set(hostElement, state)
    useStyleState(hostElement)
    // mouseDown event disable observer need mouseDown event enable it
    !state.willChangeSourceWidth && state.observer.observe()
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
    const { controlFold, controlFullScreen, controlSpliteScreen, split, top, topRight, bottomOccupy } = this

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
      cache: [],

      resize: () => resize(this),
      upDownSplitScreen: () => {
        controlSpliteScreen.classList.toggle("rotate90")
        toggleShowMode(this)
      },
    }
    top.style.top = state.paddingTopAttr
    states.set(this, state)

    state.resize()
    observer.observe()
    window.addEventListener("resize", state.resize)
    split.addEventListener("mousedown", mouseDown)
    controlFullScreen.addEventListener("click", fullScreen)
    controlSpliteScreen.addEventListener("click", state.upDownSplitScreen)
  }

  disconnectedCallback() {
    const { split, controlFullScreen, controlSpliteScreen } = this
    const state = states.get(this)!
    states.delete(this)

    split && split.removeEventListener("mousedown", mouseDown)
    controlFullScreen && controlFullScreen.removeEventListener("click", fullScreen)
    controlSpliteScreen && controlSpliteScreen.removeEventListener("click", state.upDownSplitScreen)
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

  get controlFullScreen (): HTMLElement {
    return this.shadowRoot!.querySelector(".icon-full-screen")!
  }

  get controlSpliteScreen (): HTMLElement {
    return this.shadowRoot!.querySelector(".icon-splite-screen")!
  }

  get controlFold (): HTMLElement {
    return this.shadowRoot!.querySelector(".icon-left")!
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
