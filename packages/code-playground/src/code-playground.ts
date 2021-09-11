import type { default as IframeSandbox, SandboxEvent } from "@ui-elements/iframe-sandbox/src/iframe-sandbox"
import type { default as DragWrap } from "@ui-elements/drag-wrap/src/drag-wrap"
import MonacoEditor from "@ui-elements/monaco-editor/src/monaco-editor"
import teamplateElement from "./code-playground-element"
import { FileSystem, CompiledFile } from "@ui-elements/vfs"
import { createProjectManager } from "@ui-elements/compiler"

interface MonacoEditorItem {
  wrap: HTMLDivElement
  editor: MonacoEditor
  status: boolean
}

type SupportEditorType = "vuehtml" | "ts"

async function createFile (host: CodePlayground,  filename: string) {
  const { editorManage, tabWrap, fs, editorWrap } = host

  async function activeMonacoEditor () {
    let isCreate = false
    let file: CompiledFile
    if (fs.isExist(filename)) {
      isCreate = false
      file = fs.readFile(filename)!
    } else {
      isCreate = true
      file = fs.writeFile(new CompiledFile({ name: filename }))
    }

    const setModel = async (editor: MonacoEditor, type: SupportEditorType, filename: string) => {
      let model
      if (isCreate) {
        model = await editor.createModel(type, filename)
      } else {
        model = (await editor.findModel(filename))!
      }
      await editor.setModel(model)
      return model
    }

    if (filename.endsWith(".vue")) {
      const vuehtmlEditor = editorManage.show("vuehtml")
      const tsEditor = editorManage.show("ts")
      editorWrap.updateItems()

      const vuehtmlModel = await setModel(vuehtmlEditor.editor, "vuehtml", filename+".vuehtml")
      const tsModel = await setModel(tsEditor.editor, "ts", filename+".ts")
      if (isCreate) {
        const cache = {html: "", ts: ""}
        vuehtmlModel.onDidChangeContent(e => {
          cache.html = vuehtmlModel.getValue()
          file.updateFile([
            "<teamplate>",
            cache.html,
            "</teamplate>",
            "<script>",
            cache.ts,
            "</script>"
          ].join("\n"))
        })
        tsModel.onDidChangeContent(async e => {
          cache.ts = await tsEditor.editor.getRunnableJS(tsModel)
          file.updateFile([
            "<teamplate>",
            cache.html,
            "</teamplate>",
            "<script>",
            cache.ts,
            "</script>"
          ].join("\n"))
          console.log(fs)
        })
      }
    } else if (filename.endsWith(".ts")) {
      editorManage.hide("vuehtml")
      const tsEditor = editorManage.show("ts")
      editorWrap.updateItems()

      const tsModel = await setModel(tsEditor.editor, "ts", filename)
      if (isCreate) {
        tsModel.onDidChangeContent(e => {
          file.updateFile(tsModel.getValue())
        })
      }
    } else {
      throw "don't support create ${filename}, only support create *.vue/*.ts."
    }
  }

  function insertFileTab () {
    const filetab = document.createElement("button")
    filetab.innerHTML = filename
    tabWrap.appendChild(filetab)
    return filetab
  }

  const tabBtn = insertFileTab()
  tabBtn.addEventListener("click", activeMonacoEditor)

  activeMonacoEditor()
  return {
    active() {
      activeMonacoEditor()
    },

    remove () {

    }
  }
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

  return sandbox
}

export default class CodePlayground extends HTMLElement {
  private project = createProjectManager("vue")
  private editors: Record<string, MonacoEditorItem> = {}
  public fs = new FileSystem<CompiledFile>()
  public editorManage

  constructor() {
    super()
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    this.appendChild(wrap)
    this.editorManage = this.createMonacoEditorManager()
  }

  async connectedCallback () {
    const project = await this.project

    const sandbox = setupIframesandbox(this)
    sandbox.setupDependency(project.getRuntimeImportMap())

    await createFile(this, "test.ts")
    await createFile(this, "test.vue")
  }

  disconnectedCallback () {
  }

  attributeChangedCallback () {
  }

  get sandbox (): IframeSandbox {
    return this.ownerDocument.querySelector("#sandbox")!
  }
  get editorWrap (): DragWrap {
    return this.ownerDocument.querySelector("#editor-wrap")!
  }
  get tabWrap (): HTMLDivElement {
    return this.ownerDocument.querySelector("#tab")!
  }

  private createMonacoEditorManager () {
    const { editors, editorWrap } = this
    return {
      show: (type: SupportEditorType): MonacoEditorItem => {
        let state = editors[type]
        if (!state) {
          const editor = new MonacoEditor()
          editor.style.width = "100%"
          editor.style.height = "100%"

          const wrap = this.ownerDocument.createElement("div")
          wrap.style.width = "100%"
          wrap.style.height = "100%"
          wrap.setAttribute("slot", "item")
          wrap.appendChild(editor)

          state = { wrap, editor, status: false }
          editors[type] = state
          editorWrap.appendChild(state.wrap)
        }
        if (!state.status) {
          state.status = true
          state.wrap.style.display = "block"
          state.wrap.removeAttribute("hidden")
        }
        return state
      },

      hide: (type: SupportEditorType) => {
        const state = editors[type]
        if (state && state.status) {
          state.status = false
          state.wrap.style.display = "none"
          state.wrap.setAttribute("hidden", "")
        }
      },
    }
  }
}
