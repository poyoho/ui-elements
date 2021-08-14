import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

interface State {
  sourceNode: HTMLElement
  commentNode: HTMLElement
  wrapNode: HTMLElement
  commentContentNode: HTMLElement
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
    state.commentContentNode.style.transform = `translate(${(-50 + sourceWidth)*2}%, 0)`

    if (sourceWidth === 0) {
      state.sourceNode.style.paddingLeft = "0px"
      state.commentNode.style.paddingLeft = "0px"
    } else if (sourceWidth === 100) {
      state.sourceNode.style.paddingLeft = "0px"
      state.commentNode.style.paddingLeft = "0px"
      state.commentContentNode.style.opacity = "0"
    } else {
      state.sourceNode.style.paddingLeft = "10px"
      state.commentNode.style.paddingLeft = "10px"
      state.commentContentNode.style.opacity = "1"
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

  get commentContent (): HTMLElement {
    return this.shadowRoot!.querySelector(".comment-content")!
  }

  get split (): HTMLElement {
    return this.shadowRoot!.querySelector(".split")!
  }

  get control (): HTMLElement {
    return this.shadowRoot!.querySelector(".control")!
  }

  connectedCallback() {
    const { wrap, source, comment, commentContent, control, split } = this
    const state: State = {
      sourceNode: source,
      commentNode: comment,
      commentContentNode: commentContent,
      wrapNode: wrap,
    }

    const staticHeight = Math.max(source.offsetHeight, comment.offsetHeight) + 20
    source.style.height = staticHeight + 'px'
    comment.style.height = staticHeight + 'px'
    source.style.paddingLeft = '10px'
    comment.style.paddingLeft = '10px'

    states.set(this, state)

    split.addEventListener("mousedown", mouseDown)
    control.addEventListener("click", fullScreen)
  }

  disconnectedCallback() {
    const { split, control } = this

    split && split.removeEventListener("mousedown", mouseDown)
    control && control.removeEventListener("click", fullScreen)
  }
}
