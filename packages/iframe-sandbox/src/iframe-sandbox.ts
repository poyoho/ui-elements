import { SandboxProxy } from "./proxy"
import srcdoc from "./srcdoc.html?raw"

const IMPORT_MAP = "<!-- IMPORT_MAP -->"

export default class CodeSandbox extends HTMLElement {
  private importMaps = { imports: {} }
  private proxy: SandboxProxy | undefined

  get sandbox (): HTMLIFrameElement {
    return this.querySelector("iframe")!
  }

  async connectedCallback() {
    const sandbox = document.createElement("iframe")
    sandbox.className = "sandbox"
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

    const dispatchEvent = (type: string, data: any) => {
      console.log("dispatchEvent")
      const event = document.createEvent("Events")
      ;(event as any).value = data
      event.initEvent(type, false, false)
      this.dispatchEvent(event)
    }

    this.proxy = new SandboxProxy(sandbox, {
      on_fetch_progress: (data: any) => dispatchEvent("on_fetch_progress", data),
      on_error: (data: any) => dispatchEvent("on_error", data),
      on_unhandled_rejection: (data: any) => dispatchEvent("on_unhandled_rejection", data),
      on_console: (data: any) => dispatchEvent("on_console", data),
      on_console_group: (data: any) => dispatchEvent("on_console_group", data),
      on_console_group_collapsed: (data: any) => dispatchEvent("on_console_group_collapsed", data),
      on_console_group_end: (data: any) => dispatchEvent("on_console_group_end", data),
    })

    sandbox.addEventListener('load', () => {
      this.proxy!.handle_links()
    })

    this.appendChild(sandbox)
  }

  disconnectedCallback() {}

  setup (importMap?: Record<string, string>) {
    const { sandbox } = this
    // replace importMaps
    Object.assign(this.importMaps.imports, importMap || {})
    sandbox.srcdoc = srcdoc.replace(IMPORT_MAP, JSON.stringify(this.importMaps))
  }

  eval (script: string | string[]) {
    this.proxy!.eval(script)
  }
}
