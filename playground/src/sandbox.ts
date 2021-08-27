import IframeSandbox from "../../packages/iframe-sandbox/src/iframe-sandbox"

const sandbox = document.querySelector("iframe-sandbox") as any as IframeSandbox

sandbox.setup()

sandbox.addEventListener("on_fetch_progress", (e) => {
  const { value } = e as any
  console.log("on_fetch_progress", value)
})

sandbox.addEventListener("on_error", (e) => {
  const { value } = e as any
  console.log("on_error", value)
})

sandbox.addEventListener("on_unhandled_rejection", (e) => {
  const { value } = e as any
  console.log("on_unhandled_rejection", value)
})

sandbox.addEventListener("on_console", (e) => {
  const { value } = e as any
  console.log("on_console", value)
})

sandbox.addEventListener("on_console_group", (e) => {
  const { value } = e as any
  console.log("on_console_group", value)
})

sandbox.addEventListener("on_console_group_collapsed", (e) => {
  const { value } = e as any
  console.log("on_console_group_collapsed", value)
})

sandbox.addEventListener("on_console_group_end", (e) => {
  const { value } = e as any
  console.log("on_console_group_end", value)
})

sandbox.sandbox.addEventListener('load', () => {
  sandbox.eval([
    "console.log('asdasd')",
  ])
})
