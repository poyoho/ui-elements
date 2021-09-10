import type { default as IframeSandbox, SandboxEvent } from "@ui-elements/iframe-sandbox/src/iframe-sandbox"
import type { default as DragWrap } from "@ui-elements/drag-wrap/src/drag-wrap"
import type { default as MonacoEditor } from "@ui-elements/monaco-editor/src/monaco-editor"
import teamplateElement from "./code-playground-element"
import { FileSystem, CompiledFile } from "@ui-elements/vfs"
import { createProjectManager } from "@ui-elements/compiler"

interface MonacoEditorItem {
  wrap: HTMLDivElement
  editor: MonacoEditor
}

function setupMonacoEditor (host: CodePlayground, needSize: number) {
  const { editorWrap, editors } = host
  if (needSize > editors.length) {
    for (let i = 0; i < needSize - editors.length; i++) {
      const editor = document.createElement("monaco-editor")
      const wrap = document.createElement("div")
      // wrap.setAttribute("slot", "item")
      // wrap.append(editor)
      // editorWrap.append(wrap)
      console.log(editor)
      editors.push({
        wrap,
        editor
      })
    }
  } else {
    for (let i = needSize; i < editors.length; i++) {
      const node = editors[i]
      node.wrap.remove()
      editors.splice(i, 1)
    }
  }
  console.log(editors, needSize, editors.length)
  return editors
}

function insertFileTab (host: CodePlayground, filename: string) {
  const { tabWrap } = host

  const filetab = document.createElement("button")
  filetab.innerHTML = filename
  tabWrap.appendChild(filetab)
  return filetab
}

function setupIframesandbox (host: CodePlayground) {
  const { sandbox } = host

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
}

async function createFile (host: CodePlayground, filename: string) {
  const { fs } = host
  if (filename.endsWith(".vue")) {
    fs.writeFile(new CompiledFile({ name: filename }))
    insertFileTab(host, filename)
    const [vuehtmlEditor, tsEditor] = setupMonacoEditor(host, 2)
    const tsModel = await tsEditor.editor.createModel("ts", filename)
    await tsEditor.editor.setModel(tsModel)
    tsModel.onDidChangeContent(e => {
      console.log(e);
    })

    const vuehtmlModel = await vuehtmlEditor.editor.createModel("ts", filename)
    await vuehtmlEditor.editor.setModel(vuehtmlModel)
    vuehtmlModel.onDidChangeContent(e => {
      console.log(e);
    })
  } else if (filename.endsWith(".ts")) {
    insertFileTab(host, filename)
    fs.writeFile(new CompiledFile({ name: filename }))
    const [tsEditor] = setupMonacoEditor(host, 1)
    const tsmodel = await tsEditor.editor.createModel("ts", filename)
    await tsEditor.editor.setModel(tsmodel)
    tsmodel.onDidChangeContent(e => {
      console.log(e);
    })
  } else {
    throw "don't support create ${filename}, only support create *.vue/*.ts."
  }
}

export default class CodePlayground extends HTMLElement {
  public fs = new FileSystem ()
  public editors: MonacoEditorItem[] = []
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    shadowRoot.appendChild(wrap)
  }

  connectedCallback () {
    setupIframesandbox(this)
    createFile(this, "test.vue")
  }

  disconnectedCallback () {
  }

  attributeChangedCallback () {
  }

  get sandbox (): IframeSandbox {
    return this.shadowRoot!.querySelector("#sandbox")!
  }
  get editorWrap (): DragWrap {
    return this.shadowRoot!.querySelector("#editor")!
  }
  get tabWrap (): HTMLDivElement {
    return this.shadowRoot!.querySelector("#tab")!
  }
}
