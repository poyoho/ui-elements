import { getShadowHost } from "@ui-elements/utils"
import teamplateElement from "./demo-block-element"

interface State {
  expaned: boolean
  height: number
  componentContext: string
}

const states = new WeakMap<DemoBlockElement, State>()

function expandContract(e: Event) {
  const target = e.target! as HTMLElement
  const host = getShadowHost(target) as DemoBlockElement
  const { source, tipText, expandContractIcon } = host
  const state = states.get(host)!
  state.expaned = !state.expaned
  if (state.expaned) {
    source.style.height = `${state.height}px`
    tipText.textContent = "隐藏"
  } else {
    source.style.height = "0"
    tipText.textContent = "展开"
  }
  expandContractIcon.classList.toggle("expand")
  states.set(host, state)
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
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback() {
    const { source, ctrl, component, copyIcon } = this
    const state: State = {
      expaned: false,
      height: source.clientHeight,
      componentContext: component?.textContent || "",
    }
    states.set(this, state)

    source.style.height = "0"
    if (!component) {
      copyIcon.parentElement?.remove()
      copyIcon.remove()
    } else {
      copyIcon.addEventListener("click", copyToClipBoard)
      copyIcon.addEventListener("mouseleave", resetCopyIcon)
    }
    ctrl.addEventListener("click", expandContract)
  }

  disconnectedCallback() {
    const ctrl = this.ctrl
    const copyIcon = this.copyIcon
    const state = states.get(this)
    if (state) {
      states.delete(this)
    }
    if (ctrl) {
      ctrl.removeEventListener("click", expandContract)
    }
    if (copyIcon) {
      copyIcon.removeEventListener("click", copyToClipBoard)
      copyIcon.removeEventListener("mouseleave", resetCopyIcon)
    }
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
    return this.shadowRoot!.querySelector<HTMLSpanElement>(".control .contract-icon")!
  }

  get copyIcon(): HTMLElement {
    return this.shadowRoot!.querySelector<HTMLElement>(".highlight .copy")!
  }

  get component(): HTMLDivElement | null {
    // !!! this component add in packages/compile
    return this.querySelector("[slot='highlight'] .cloneable")
  }
}
