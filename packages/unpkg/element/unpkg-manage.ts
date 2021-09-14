import teamplateElement from "./unpkg-manage-element"
import { getShadowHost } from "@ui-elements/utils"
import { resolveRecommendPackage } from "../libs/resolvePackage"

function showPanel (e: MouseEvent) {
  const target = e.target! as HTMLElement
  const host = getShadowHost(target) as UnpkgManage
  const { panel } = host
  panel.classList.toggle("show", true)
}

export default class UnpkgManage extends HTMLElement {
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
    const { entry } = this
    entry.addEventListener("click", showPanel)
    resolveRecommendPackage("vue")
  }

  disconnectedCallback() {
  }

  get entry (): HTMLButtonElement {
    return this.shadowRoot!.querySelector("#entry")!
  }

  get panel (): HTMLDivElement {
    return this.shadowRoot!.querySelector("#panel")!
  }
}
