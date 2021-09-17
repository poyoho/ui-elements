import teamplateElement from "./unpkg-manage-element"
import { getShadowHost, debounce } from "@ui-elements/utils"
import { resolvePackageVersion, resolveRecommendPackage } from "../libs/resolvePackage"
import type { SelectBox } from "@ui-elements/select-box"
import { nextTick, version } from "vue/types/umd"

interface PackageMetadata {
  name: string
  description: string
  version: string
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
    case "Installed":
    {
      const items = host.installed
      renderPackageMetadata(items, resultContent, host.activeMenu === "Installed")
      break
    }
  }
}

function renderPackageMetadata (items: PackageMetadata[], container: HTMLElement, installed: boolean) {
  const host = getShadowHost(container) as UnpkgManage
  const installedPackages = new Set(host.installed.map(el => el.name))
  container.innerHTML = items.reduce((prev, next) => {
    const version = next.version
    const packageStatus = installed
      ? 'uninstall'
      : installedPackages.has(next.name) ? '✔ installed' : 'install'
    return prev.concat([
      // don't alert it, [function clickInstallPackage] use it.
      `<div class="item">`,
      `<a class="pkg-title" target="_blank" href="https://www.npmjs.com/package/${next.name}${version ? "/v/" + version : ""}">${next.name}${version ? "@" + version : ""}</a>`,
      `<div class="pkg-desc">${next.description}</div>`,
      `<div class="pkg-ctrl ${packageStatus}">`,
      `<select-box placeholder="select version"></select-box>`,
      `<button name="${next.name}">${packageStatus}</button>`,
      `</div></div>`
    ])
  }, [] as string[]).join("\n")
}

async function keywordFileter(e: Event) {
  const target = e.target as HTMLInputElement
  const host = getShadowHost(target) as UnpkgManage
  switch(host.activeMenu) {
    case "Packages":
    {
      const keyword = host.keywordInput.value
      const packagesMetadata = await resolveRecommendPackage(keyword)
      renderPackageMetadata(packagesMetadata, host.resultContent, false)
    }
    case "Installed":
    {

    }
  }

}

async function clickInstallPackage (e: MouseEvent) {
  const target = e.target as HTMLButtonElement
  if (target.tagName !== "BUTTON") {
    return
  }
  switch (target.innerHTML) {
    case "install":
    {
      const pkgName = target.getAttribute("name")!
      const versionList = await resolvePackageVersion(pkgName)
      const select = target.previousElementSibling! as HTMLSelectElement
      select.innerHTML = versionList.map(version => `<option-box value="${version}">${version}</option-box>`).join("")
      select.style.display = "inline-block"
      target.innerHTML = "<button>confirm</button>  <button>cancel</button>"
      break
    }
    case "uninstall":
    {
      break
    }
    case "confirm":
    {
      const wrap = target.parentElement!
      const select = wrap.previousElementSibling! as SelectBox
      const version = select.value
      if (!version) {
        select.classList.toggle("input-error", true)
        setTimeout(() => {
          select.classList.toggle("input-error", false)
        }, 400)
        break
      }
      const host = getShadowHost(target) as UnpkgManage
      select.style.display = "none"
      wrap.innerHTML = "✔ installed"
      wrap.parentElement!.classList.toggle("installed", true)
      const itemWrap = wrap.parentElement!.parentElement!
      const name = itemWrap.querySelector(".pkg-title")!.innerHTML
      const description = itemWrap.querySelector(".pkg-desc")!.innerHTML
      host.installed.push({
        name,
        version,
        description
      })
      host.dispatchEvent(new CustomEvent("change", { detail: host.installed }))
      break
    }
    case "cancel":
    {
      const select = target.parentElement!.previousElementSibling! as SelectBox
      target.parentElement!.innerHTML = "install"
      select.style.display = "none"
      break
    }
  }
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
    resultContent.addEventListener("click", clickInstallPackage)
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
