import { createDefer } from "@ui-elements/utils"
import { SandboxHandleData, SandboxProxy } from "./proxy"
import srcdoc from "./srcdoc.html?raw"

const IMPORT_MAP = "<!-- IMPORT_MAP -->"

export interface SandboxEvent extends Event {
  data: SandboxHandleData
}

export default class CodeSandbox extends HTMLElement {
  private importMaps = { imports: {} }
  private proxy = createDefer<SandboxProxy>()

  get sandbox (): HTMLIFrameElement {
    return this.querySelector("iframe")!
  }

  async connectedCallback() {
    const sandbox = document.createElement("iframe")
    sandbox.className = "sandbox"
    sandbox.style.width = "inherit"
    sandbox.style.height = "inherit"
    sandbox.style.border = "0"
    sandbox.setAttribute('sandbox', [
      'allow-forms',
      'allow-modals',
      'allow-pointer-lock',
      'allow-popups',
      // enableSameOrigin.value ? 'allow-same-origin' : null,\
      'allow-same-origin',
      'allow-scripts',
      'allow-top-navigation-by-user-activation',
    ].join(' '))

    const emit = (eventType: string, data: SandboxHandleData) => {
      const event = this.ownerDocument.createEvent("Events") as SandboxEvent
      event.initEvent(eventType, false, false)
      event.data = data
      this.dispatchEvent(event)
    }

    const sandboxProxy = new SandboxProxy(sandbox, {
      on_fetch_progress: (data: SandboxHandleData) => emit("on_fetch_progress", data),
      on_error: (data: SandboxHandleData) => emit("on_error", data),
      on_unhandled_rejection: (data: SandboxHandleData) => emit("on_unhandled_rejection", data),
      on_console: (data: SandboxHandleData) => emit("on_console", data),
      on_console_group: (data: SandboxHandleData) => emit("on_console_group", data),
      on_console_group_collapsed: (data: SandboxHandleData) => emit("on_console_group_collapsed", data),
      on_console_group_end: (data: SandboxHandleData) => emit("on_console_group_end", data),
    })

    sandbox.addEventListener('load', () => {
      sandboxProxy.handle_links()
      console.log("[iframe-sandbox] sandbox load")
      this.proxy.resolve(sandboxProxy)
    })
    this.appendChild(sandbox)
    this.setupDependency({})
  }

  disconnectedCallback() {}

  setupDependency (importMap: Record<string, string>) {
    const { sandbox } = this
    // replace importMaps
    Object.assign(this.importMaps.imports, importMap)
    sandbox.srcdoc = srcdoc.replace(IMPORT_MAP, JSON.stringify(this.importMaps))
  }

  eval (script: string | string[]) {
    this.proxy.promise.then((proxy) => {
      proxy.eval(script)
    })
  }
}
