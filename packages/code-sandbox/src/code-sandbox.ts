import srcdoc from "./sandboxRuntime/srcdoc.html?raw"
import { SandboxProxy } from "./sandboxRuntime/proxy"

export default class CodeSandbox extends HTMLElement {
  constructor() {
    super()
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
    sandbox.srcdoc = srcdoc
    const proxy = new SandboxProxy(sandbox, {

    })
    this.appendChild(sandbox)
  }

  get sandbox (): HTMLIFrameElement {
    return this.querySelector(".sandbox")!
  }

  connectedCallback() {}

  disconnectedCallback() {}
}
