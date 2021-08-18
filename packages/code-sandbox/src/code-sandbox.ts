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
    this.appendChild(sandbox)
  }

  get sandbox (): HTMLIFrameElement {
    return this.querySelector(".sandbox")!
  }

  connectedCallback() {}

  disconnectedCallback() {}
}
