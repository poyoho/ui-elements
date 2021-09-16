import teamplateElement from "./unpkg-manage-element"
import { getShadowHost, debounce } from "@ui-elements/utils"
import { resolvePackageVersion, resolveRecommendPackage } from "../libs/resolvePackage"

interface PackageMetadata {
  name: string
  description: string
  hasTypes: boolean
  updateAt: string
}

function showPanel (e: MouseEvent) {
  const target = e.target! as HTMLElement
  const host = getShadowHost(target) as UnpkgManage
  const { panel } = host
  panel.classList.toggle("show", true)
}

function switchMenu (e: MouseEvent) {
  const target = e.target as HTMLLIElement
  if (target.tagName !== "LI" || target.hasAttribute("noclick")) {
    return
  }
  const host = getShadowHost(target) as UnpkgManage
  const ulTarget = e.currentTarget as HTMLUListElement
  ulTarget.querySelector(".active")!.classList.toggle("active", false)
  target.classList.toggle("active", true)
  host.activeMenu = target.innerHTML
  switchResult(host)
}

function switchResult (host: UnpkgManage) {
  const { resultContent, activeMenu } = host
  Array.from(resultContent.children).forEach(chlid => chlid.remove())
  switch (activeMenu) {
    case "Packages":
    {
      const keyword = host.keywordInput.value
      console.log(keyword)
      break
    }
    case "Installed":
    {
      const items = host.installed
      renderPackageMetadata(items, resultContent, host.activeMenu === "Installed")
      break
    }
  }
}

function renderPackageMetadata (items: PackageMetadata[], container: HTMLElement, installed: boolean) {
  container.innerHTML = items.reduce((prev, next) => prev.concat([
    `<div class="item">`,
    `<a class="pkg-title" target="_blank" href="https://www.npmjs.com/package/${next.name}">${next.name}</a>`,
    `<div class="pkg-desc">${next.description}</div>`,
    `<div class="pkg-ctrl">`,
    `<select></select>`,
    `<button pkg="${next.name}">${installed ? 'uninstall' : 'install'}</button>`,
    `</div></div>`
  ]), [] as string[]).join("\n")
}

async function keywordFileter(e: Event) {
  const target = e.target as HTMLInputElement
  const host = getShadowHost(target) as UnpkgManage
  switch(host.activeMenu) {
    case "Packages":
    {
      const keyword = host.keywordInput.value
      const packagesMetadata = await resolveRecommendPackage(keyword)
      console.log(keyword, packagesMetadata)
      renderPackageMetadata(packagesMetadata, host.resultContent, false)
    }
    case "Installed":
    {

    }
  }

}

async function clickResultContent (e: MouseEvent) {
  const target = e.target as HTMLButtonElement
  if (target.tagName !== "BUTTON") {
    return
  }
  const pkgName = target.getAttribute("pkg")!
  const versionList = await resolvePackageVersion(pkgName)
  const select = target.previousElementSibling! as HTMLSelectElement
  select.innerHTML = versionList.map(version => `<option>${version}</option>`).join("")
  select.style.display = "inline-block"
}

export default class UnpkgManage extends HTMLElement {
  public activeMenu = "Installed"
  public installed: PackageMetadata[] = []
  private inputEventHandle = debounce(keywordFileter)

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
    const { entry, menu, keywordInput, resultContent } = this
    entry.addEventListener("click", showPanel)
    menu.addEventListener("click", switchMenu)
    keywordInput.addEventListener("input", this.inputEventHandle)
    resultContent.addEventListener("click", clickResultContent)
    switchResult(this)
    entry.click()
  }

  disconnectedCallback() {
  }

  get entry (): HTMLButtonElement {
    return this.shadowRoot!.querySelector("#entry")!
  }

  get panel (): HTMLDivElement {
    return this.shadowRoot!.querySelector("#panel")!
  }

  get menu (): HTMLLIElement {
    return this.shadowRoot!.querySelector("ul.menu")!
  }

  get resultContent (): HTMLDivElement {
    return this.shadowRoot!.querySelector(".result .content")!
  }

  get keywordInput (): HTMLInputElement {
    return this.shadowRoot!.querySelector(".result .filter")!
  }
}
