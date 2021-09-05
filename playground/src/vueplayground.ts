import { install } from "../../packages/ui-elements"
import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"
import type { SandboxEvent, default as IframeSandbox } from "../../packages/iframe-sandbox/src/iframe-sandbox"

import { resolvePackage } from "../../packages/unpkg"
import { FileSystem, CompiledFile } from "../../packages/vfs"
import { importCompiler } from "../../packages/compiler"

const sandbox = document.querySelector("#sandbox") as any as IframeSandbox
const compile = await importCompiler("vue")
const vuefs = new FileSystem<CompiledFile>()
const vuefile = vuefs.writeFile(new CompiledFile({
  name: "test.vue"
}))
const updateFile = async (cache: {js: string, html: string}) => {
  vuefile.updateFile([
    `<template>`,
    `${cache.html}`,
    `</template>`,
    `<script>`,
    `${cache.js}`,
    `</script>`,
  ].join("\n"))
  // console.log(await compile.compileFile(vuefile))
  const vueProjectJS = await compile.getProjectRunableJS(vuefs)
  console.log(vueProjectJS.join("\n"))
  sandbox.eval(vueProjectJS)
}

async function setupVueMonaco () {
  const tselm = document.querySelector("#vuets") as any as MonacoEditor
  const pkgs = await resolvePackage("vue", "3.2.4")
  await tselm.addDTS(pkgs.map(pkg => ({name: pkg.name, version: pkg.version, entry: pkg.types})).filter(el => el.entry))
  const tsmodel = await tselm.createModel("ts", "test.vue.ts", `export default {}`)
  await tselm.setModel(tsmodel)
  const elmhtml = document.querySelector("#vuehtml") as any as MonacoEditor
  const htmlmodel = await elmhtml.createModel("vuehtml", "test.vue.vuehtml", `<div> hello world </div>`)
  await elmhtml.setModel(htmlmodel)
  const cache = {js: tsmodel.getValue(), html: htmlmodel.getValue()}
  updateFile(cache)
  tselm.addEventListener("code-change", async (e) => {
    cache.js = await tselm.getRunnableJS(tsmodel)
    updateFile(cache)
  })
  elmhtml.addEventListener("code-change", (e) => {
    cache.html = (e as MonacoEditorChangeEvent).value.content
    updateFile(cache)
  })
}

function setupIframesandbox () {
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
  sandbox.setupDependency(compile.getRuntimeImportMap())
}

function main () {
  install()
  setupIframesandbox()
  setupVueMonaco()
}

main()
