import IframeSandbox from "../../packages/iframe-sandbox/src/iframe-sandbox"

const sandbox = document.querySelector("code-sandbox") as any as IframeSandbox

sandbox.eval([
  "console.log('asdasd')"
])
