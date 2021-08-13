import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./code-comment-element"

interface State {
  sourceNode: HTMLElement
  commentNode: HTMLElement
  wrapNode: HTMLElement

  commentOffsetTop: number
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
    state.sourceNode.style.paddingLeft = (sourceWidth ? 10 : 0) + "px"
    state.commentNode.style.paddingLeft = (100 - sourceWidth ? 10 : 0) + "px"
  }

  document.addEventListener("mousemove", mounseMove)
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", mounseMove)
  })
}

function fullScreen (e: Event) {
  const target = e.currentTarget! as HTMLElement
  const hostElement = getShadowHost(target) as CodeCommentElement
  const state = states.get(hostElement)!
  if (state.wrapNode.classList.toggle("full-screen")) {
    state.sourceNode.style.height = "100%"
    state.commentNode.style.height = "100%"
  } else {
    const staticHeight = Math.max(state.sourceNode.offsetHeight, state.commentNode.offsetHeight) + 20
    state.sourceNode.style.height = staticHeight + 'px'
    state.commentNode.style.height = staticHeight + 'px'
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
    return this.shadowRoot!.querySelector(".source")!
  }

  get comment (): HTMLElement {
    return this.shadowRoot!.querySelector(".comment")!
  }

  get split (): HTMLElement {
    return this.shadowRoot!.querySelector(".split")!
  }

  get control (): HTMLElement {
    return this.shadowRoot!.querySelector(".control")!
  }

  connectedCallback() {
    const { wrap, source, comment, control } = this
    const state: State = {
      sourceNode: source,
      commentNode: comment,
      wrapNode: wrap,

      commentOffsetTop: comment.offsetTop
    }

    const staticHeight = Math.max(source.offsetHeight, comment.offsetHeight) + 20
    source.style.height = staticHeight + 'px'
    comment.style.height = staticHeight + 'px'
    source.style.paddingLeft = '10px'
    comment.style.paddingLeft = '10px'

    states.set(this, state)

    this.split.addEventListener("mousedown", mouseDown)
    control.addEventListener("click", fullScreen)
    document.addEventListener("scroll", () => {
      const commentOffsetWrapTop = document.documentElement.scrollTop - comment.offsetTop
      if (commentOffsetWrapTop > 0) {
        comment.style.paddingTop = commentOffsetWrapTop + 'px'
      }
    })
  }

  disconnectedCallback() {
    const { split } = this

    split && split.removeEventListener("mousedown", mouseDown)
  }
}
