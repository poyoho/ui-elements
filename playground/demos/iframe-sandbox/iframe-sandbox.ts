import { IframeSandbox, install } from "@ui-elements/iframe-sandbox"

install()

const sandbox = document.querySelector("iframe-sandbox") as any as IframeSandbox

sandbox.eval([
  "console.log('asdasd')"
])

sandbox.setupDependency({})
