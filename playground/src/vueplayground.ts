import { install } from "../../packages/ui-elements"
import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"
import type { SandboxEvent, default as IframeSandbox } from "../../packages/iframe-sandbox/src/iframe-sandbox"
import type { default as DragWrap } from "../../packages/drag-wrap/src/drag-wrap"

import { resolvePackage } from "../../packages/unpkg"
import { FileSystem, CompiledFile } from "../../packages/vfs"
import { importCompiler } from "../../packages/compiler"
import { debounce } from "../../packages/utils"

const compile = await importCompiler("vue")
const fs = new FileSystem<CompiledFile>()

const sandbox = document.querySelector("#sandbox") as any as IframeSandbox
const editorWrap = document.querySelector("#editor") as any as DragWrap
const tabWrap = document.querySelector("#tab") as HTMLDivElement

const vuehtmlEditor = createMonacoEditor()
const tsEditor = createMonacoEditor()

function createMonacoEditor () {
  const elm = document.createElement("div")
  elm.setAttribute("slot", "item")
  const editor = document.createElement("monaco-editor")
  elm.appendChild(editor)
  editorWrap.appendChild(elm)
  return editor
}

function createFileTab (filename: string) {
  const filetab = document.createElement("button")
  filetab.innerHTML = filename
  tabWrap.appendChild(filetab)
}

async function execVueProject () {
  const vueProjectJS = await compile.getProjectRunableJS(fs)
  sandbox.eval(vueProjectJS)
}

async function tsEditorAddDTS() {
  const pkgs = await resolvePackage("vue", "3.2.4")
  await tsEditor.addDTS(pkgs.map(pkg => ({name: pkg.name, version: pkg.version, entry: pkg.types})).filter(el => el.entry))
}

async function createFile (filename: string) {
  const file = fs.writeFile(new CompiledFile({ name: filename }))

  if (file.filename.endsWith(".vue")) {
    const tsmodel = await tsEditor.createModel("ts", "test.vue.ts", `export default {}`)
    const htmlmodel = await vuehtmlEditor.createModel("vuehtml", "test.vue.vuehtml", `<div> hello world </div>`)
    const updateFile = async (cache: {js: string, html: string}) => {
      file.updateFile([
        `<template>`,
        `${cache.html}`,
        `</template>`,
        `<script>`,
        `${cache.js}`,
        `</script>`,
      ].join("\n"))
    }
    await tsEditor.setModel(tsmodel)
    await vuehtmlEditor.setModel(htmlmodel)
    tsmodel.onDidChangeContent(debounce(() => {

    }))

  } else if (file.filename.endsWith("ts")) {
    const tsmodel = await tsEditor.createModel("ts", "test.vue.ts", `export default {}`)
    const updateFile = () => {}
    await tsEditor.setModel(tsmodel)
  }



  // const cache = {js: tsmodel.getValue(), html: htmlmodel.getValue()}
  // tselm.addEventListener("code-change", async (e) => {
  //   cache.js = await tselm.getRunnableJS(tsmodel)
  //   updateFile(cache)
  // })
  // htmlelm.addEventListener("code-change", (e) => {
  //   cache.html = (e as MonacoEditorChangeEvent).value.content
  //   updateFile(cache)
  // })

  // updateFile(cache)
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
}

main()
