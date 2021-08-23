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

    this.proxy = new SandboxProxy(sandbox, {

    })

    sandbox.addEventListener('load', () => {
      this.proxy!.handle_links()
    })

    this.appendChild(sandbox)
  }

  disconnectedCallback() {}

  setupDependency (importMap: Record<string, string>) {
    const { sandbox } = this
    // replace importMaps
    Object.assign(this.importMaps.imports, importMap)
    sandbox.srcdoc = srcdoc.replace(IMPORT_MAP, JSON.stringify(this.importMaps))
  }

  eval (script: string | string[]) {
    this.proxy!.eval(script)
  }
}
