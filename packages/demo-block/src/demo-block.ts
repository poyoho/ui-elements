import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./demo-block-element"

interface State {
  expaned: boolean
  height: number
  componentContext: string

  expandContractIconNode: HTMLElement
  expandContractTextNode: HTMLSpanElement
  expandContractWrapNode: HTMLDivElement
}

const states = new WeakMap<DemoBlockElement, State>()

function expandContract(e: Event) {
  const target = e.target! as HTMLElement
  const demoBlock = getShadowHost(target) as DemoBlockElement
  const state = states.get(demoBlock)!
  state.expaned = !state.expaned
  if (state.expaned) {
    state.expandContractWrapNode.style.height = `${state.height}px`
    state.expandContractTextNode.textContent = "隐藏"
    state.expandContractIconNode.className = "expand"
  } else {
    state.expandContractWrapNode.style.height = "0"
    state.expandContractTextNode.textContent = "展开"
    state.expandContractIconNode.className = "contract"
  }
  states.set(demoBlock, state)
}

function copyToClipBoard(e: Event) {
  const target = e.currentTarget! as HTMLElement
  if (target.textContent === "copyed") {
    return
  }
  const demoBlock = getShadowHost(target) as DemoBlockElement
  const state = states.get(demoBlock)!
  e.stopPropagation()
  if ('clipboard' in navigator) {
    target.textContent = "copyed"
    navigator.clipboard.writeText(state.componentContext)
  }
}

function resetCopyIcon(e: Event) {
  const target = e.target! as HTMLElement
  target.textContent = "copy"
}

export default class DemoBlockElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback() {
    const source = this.source
    const tipText = this.tipText
    const ctrl = this.ctrl
    const component = this.componentSource
    const copyIcon = this.copyIcon
    const expandContractIcon = this.expandContractIcon
    const state: State = {
      expaned: false,
      height: source.clientHeight,
      componentContext: component?.textContent || "",

      expandContractIconNode: expandContractIcon,
      expandContractTextNode: tipText,
      expandContractWrapNode: source
    }
    states.set(this, state)

    source.style.height = "0"
    // if(component?.className.includes("vue")) {
    //   appendVueSFCPlaygroundCtrl(ctrl, state.componentContext)
    // }
    ctrl.addEventListener("click", expandContract)
    copyIcon.addEventListener("click", copyToClipBoard)
    copyIcon.addEventListener("mouseleave", resetCopyIcon)
  }

  disconnectedCallback() {
    const ctrl = this.ctrl
    const copyIcon = this.copyIcon
    const state = states.get(this)
    if (!state || !ctrl || !copyIcon) {
      return
    }

    states.delete(this)
    ctrl.removeEventListener("click", expandContract)
    copyIcon.removeEventListener("click", copyToClipBoard)
    copyIcon.removeEventListener("mouseleave", resetCopyIcon)
  }

  get source(): HTMLDivElement {
    return this.shadowRoot!.querySelector(".source")!
  }

  get ctrl(): HTMLDivElement {
    return this.shadowRoot!.querySelector(".control")!
  }

  get tipText(): HTMLSpanElement {
    return this.shadowRoot!.querySelector<HTMLSpanElement>(".control span")!
  }

  get expandContractIcon(): HTMLElement {
    return this.shadowRoot!.querySelector<HTMLSpanElement>(".control .contract")!
  }

  get copyIcon(): HTMLElement {
    return this.shadowRoot!.querySelector<HTMLElement>(".highlight .copy")!
  }

  get componentSource(): HTMLDivElement | null {
    // !!! this component add in packages/compile
    return this.querySelector("[slot='highlight'] .component")
  }
}
