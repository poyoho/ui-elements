import type { SelectBox } from "@ui-elements/select-box"
import { debounce,getShadowHost } from "@ui-elements/utils"

import { resolvePackageData, resolveRecommendPackage } from "../libs/resolvePackage"
import teamplateElement from "./unpkg-manage-element"

export interface UnpkgChangeEventDetail {
  list: PackageMetadata[]
  item: PackageMetadata
  action: "add" | "delete"
}

export interface PackageMetadata {
  name: string
  description: string
  version: string
}

function createUnpkgManageChangeEvent (detail: UnpkgChangeEventDetail) {
  return new CustomEvent<UnpkgChangeEventDetail>("unpkg-change", { detail })
}

function showPanel (e: MouseEvent) {
  const target = e.target! as HTMLElement
  const host = getShadowHost(target) as UnpkgManage
  const { panel } = host
  panel.classList.toggle("show")
  renderPackageMetadata(host.installed, host.resultContent, true)
}

function switchMenu (e: MouseEvent) {
  const target = e.target as HTMLLIElement
  if (target.tagName !== "LI" || !target.hasAttribute("key")) {
    return
  }
  const host = getShadowHost(target) as UnpkgManage
  const ulTarget = e.currentTarget as HTMLUListElement
  ulTarget.querySelector(".active")!.classList.toggle("active", false)
  target.classList.toggle("active", true)
  host.activeMenu = target.getAttribute("key")!
  switchResult(host)
}

function switchResult (host: UnpkgManage) {
  const { keywordInput, resultContent, activeMenu } = host
  Array.from(resultContent.children).forEach(chlid => chlid.remove())
  keywordInput.value = ""
  switch (activeMenu) {
    case "Installed":
    {
      renderPackageMetadata(host.installed, resultContent, host.activeMenu === "Installed")
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
    const titleName = `${next.name}${version ? "@" + version : ""}`
    const titlehref = `https://www.npmjs.com/package/${next.name}${version ? "/v/" + version : ""}`
    return prev.concat([
      // don't alert it, [function clickInstallPackage] use it.
      `<div class="item">`,
      `<a class="pkg-title" target="_blank" href="${titlehref}">${titleName}</a>`,
      `<div class="pkg-desc">${next.description}</div>`,
      `<div class="pkg-ctrl ${packageStatus}">`,
      `<select-box placeholder="pick package"></select-box>`,
      `<button key="${packageStatus}" name="${next.name}">${packageStatus}</button>`,
      `</div></div>`
    ])
  }, [] as string[]).join("\n")
}

async function keywordFileter (this: HTMLInputElement) {
  const host = getShadowHost(this) as UnpkgManage
  const keyword = host.keywordInput.value

  switch(host.activeMenu) {
    case "Packages":
    {
      const packagesMetadata = await resolveRecommendPackage(keyword)
      renderPackageMetadata(packagesMetadata, host.resultContent, false)
      break
    }
    case "Installed":
    {
      const match = new RegExp(`[${keyword}]{${keyword.length}}`)
      const packagesMetadata = host.installed.filter(pack => match.test(pack.name))
      renderPackageMetadata(packagesMetadata, host.resultContent, true)
      break
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
      const pkgData = await resolvePackageData(pkgName)
      const versionList = Object.keys(pkgData.versions)
      const select = target.previousElementSibling! as HTMLSelectElement
      select.innerHTML = versionList
        .splice(versionList.length - 13)
        .sort()
        .reverse()
        .map(version => `<option-box value="${version}">${version}</option-box>`)
        .join("")
      select.style.display = "inline-block"
      target.innerHTML = '<button key="confirm">confirm</button>  <button key="cancel">cancel</button>'
      break
    }
    case "uninstall":
    {
      const host = getShadowHost(target) as UnpkgManage
      const pkgName = target.getAttribute("name")!
      const idx = host.installed.findIndex(el => el.name === pkgName)
      if (idx !== -1) {
        const item = host.installed[idx]
        host.installed.splice(idx, 1)
        renderPackageMetadata(host.installed, host.resultContent, true)
        host.dispatchEvent(createUnpkgManageChangeEvent({
          item,
          list: host.installed,
          action: "delete"
        }))
      }
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
      const item = {
        name,
        version,
        description
      }
      host.installed.push(item)
      host.dispatchEvent(createUnpkgManageChangeEvent({
        list: host.installed,
        item,
        action: "add"
      }))
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
  private keywordFileter = debounce(keywordFileter)

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  // install package and request package data in skypack
  public async installPackage (options: Record<string, string>) {
    for (const name in options) {
      const version = options[name]
      const pkgData = await resolvePackageData(name)
      this.installed.push({
        version,
        name: name,
        description: pkgData.description
      })
    }
  }

  connectedCallback() {
    const { entry, menu, keywordInput, resultContent, iconClose } = this
    entry.addEventListener("click", showPanel)
    menu.addEventListener("click", switchMenu)
    keywordInput.addEventListener("input", this.keywordFileter)
    resultContent.addEventListener("click", clickInstallPackage)
    iconClose.addEventListener("click", showPanel)
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

  get iconClose (): HTMLElement {
    return this.shadowRoot!.querySelector(".icon-close")!
  }
}
