import { install } from "../../packages/ui-elements"
import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"
import IframeSandbox, { SandboxEvent } from "../../packages/iframe-sandbox/src/iframe-sandbox"
import { resolvePackage } from "../../packages/unpkg"

async function setupVueTypescriptMonaco () {
  const elm = document.querySelector("#vuets") as any as MonacoEditor
  const pkgs = await resolvePackage("vue", "3.2.4")
  await elm.addDTS(pkgs.map(pkg => ({name: pkg.name, version: pkg.version, entry: pkg.types})).filter(el => el.entry))
  const model = await elm.createModel("ts", "test.vue.ts", `import { ref } from "vue"`)
  await elm.setModel(model)
  elm.addEventListener("code-change", (e) => {
    const { content } = (e as MonacoEditorChangeEvent).value
    console.log("[vueplayground] ts", content)
  })
}

async function setupVueHTMLMonaco () {
  const elm = document.querySelector("#vuehtml") as any as MonacoEditor
  const model = await elm.createModel("vuehtml", "model2.vuehtml", `<div> {{ aaa }} </div>`)
  await elm.setModel(model)
  elm.addEventListener("code-change", (e) => {
    const {content} = (e as MonacoEditorChangeEvent).value
    console.log("[vueplayground] html", content)
  })
}

function setupIframesandbox () {
  const sandbox = document.querySelector("#sandbox") as any as IframeSandbox

  sandbox.addEventListener("on_fetch_progress", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_fetch_progress", event.data)
  })
  sandbox.addEventListener("on_error", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_error", event.data)
  })
  sandbox.addEventListener("on_unhandled_rejection", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_unhandled_rejection", event.data)
  })
  sandbox.addEventListener("on_console", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_console", event.data)
  })
  sandbox.addEventListener("on_console_group", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_console_group", event.data)
  })
  sandbox.addEventListener("on_console_group_collapsed", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_console_group_collapsed", event.data)
  })
  sandbox.addEventListener("on_console_group_end", (e) => {
    const event = e as SandboxEvent
    console.log("[vueplayground] on_console_group_end", event.data)
  })

  sandbox.eval([
    "console.log('test sandbox')"
  ])

}

function main () {
  install()
  setupVueTypescriptMonaco()
  setupVueHTMLMonaco()
  setupIframesandbox()
}

main()
