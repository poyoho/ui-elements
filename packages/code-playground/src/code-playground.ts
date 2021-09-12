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

async function createFile (host: CodePlayground,  filename: string, keepalive?: boolean) {
  const { editorManage, tabWrap, fs, editorWrap, sandbox } = host
  const project = await host.project

  function createOrGetFile (filename: string, isNotExistFile: boolean) {
    let file: CompiledFile
    if (isNotExistFile) {
      file = fs.writeFile(new CompiledFile({ name: filename }))
    } else {
      file = fs.readFile(filename)!
    }
    return file
  }

  function createOrGetEditor (types: SupportEditorType[]) {
    editorManage.hideAll()
    const editors = types.map(type => editorManage.show(type))
    editorWrap.updateItems()
    return editors
  }

  async function createOrGetModel (editor: MonacoEditor, type: SupportEditorType, filename: string, isNotExistFile: boolean) {
    let model
    if (isNotExistFile) {
      model = await editor.createModel(type, filename)
    } else {
      model = (await editor.findModel(filename))!
    }
    return model
  }

  async function activeMonacoEditor () {
    const isNotExistFile = !fs.isExist(filename)

    const file = createOrGetFile(filename, isNotExistFile)

    if (filename.endsWith(".vue")) {
      const [vuehtmlEditor, tsEditor] = createOrGetEditor(["vuehtml", "ts"])

      const vuehtmlModel = await createOrGetModel(vuehtmlEditor.editor, "vuehtml", filename+".vuehtml", isNotExistFile)
      const tsModel = await createOrGetModel(tsEditor.editor, "ts", filename+".ts", isNotExistFile)
      vuehtmlEditor.editor.setModel(vuehtmlModel)
      tsEditor.editor.setModel(tsModel)

      if (isNotExistFile) {
        const cache = { html: vuehtmlModel.getValue(), ts: tsModel.getValue() }
        const updateVueFile = async () => {
          file.updateFile([
            "<template>",
            cache.html,
            "</template>",
            "<script>",
            cache.ts,
            "</script>"
          ].join("\n"))
          const scripts = await project.getProjectRunableJS(fs)
          sandbox.eval(scripts)
        }
        vuehtmlModel.onDidChangeContent(() => {
          cache.html = vuehtmlModel.getValue()
          updateVueFile()
        })
        tsModel.onDidChangeContent(async () => {
          cache.ts = await tsEditor.editor.getRunnableJS(tsModel)
          updateVueFile()
        })
      }
    } else if (filename.endsWith(".ts")) {
      const [tsEditor] = createOrGetEditor(["ts"])

      const tsModel = await createOrGetModel(tsEditor.editor, "ts", filename, isNotExistFile)
      tsEditor.editor.setModel(tsModel)

      if (isNotExistFile) {
        tsModel.onDidChangeContent(e => {
          file.updateFile(tsModel.getValue())
        })
      }
    } else {
      throw "don't support create ${filename}, only support create *.vue/*.ts."
    }
  }

  function clickActiveMonacoEditor (e: MouseEvent | HTMLElement) {
    const items = tabWrap.children
    for (let key in items) {
      items[key].tagName === "BUTTON" && items[key].removeAttribute("active")
    }
    if (e instanceof MouseEvent) {
      const target = e.target as HTMLElement
      target.setAttribute("active", "")
    } else {
      e.setAttribute("active", "")
    }
    return activeMonacoEditor()
  }

  function insertFileTab () {
    const filetab = document.createElement("button")
    filetab.innerHTML = filename
      + (keepalive ? '' : `<svg t="1631378872341" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1198" width="14" height="14"><path d="M466.773333 512l-254.72 254.72 45.226667 45.226667L512 557.226667l254.72 254.72 45.226667-45.226667L557.226667 512l254.72-254.72-45.226667-45.226667L512 466.773333 257.28 212.053333 212.053333 257.28 466.773333 512z" fill="#e1e1e1" p-id="1199"></path></svg>`)
    tabWrap.insertBefore(filetab, tabWrap.lastElementChild!)
    return filetab
  }

  function removeMonacoEditorModel () {
    const activeEditor = editorManage.getActive()
    activeEditor.forEach(async editorState => {
      await editorState.editor.removeModel()
    })
  }

  function removeFile(e: MouseEvent) {
    removeMonacoEditorModel()
    filetab.remove()
    ;(<HTMLButtonElement>tabWrap.children.item(tabWrap.children.length - 2)).click()
    e.stopPropagation()
  }

  const filetab = insertFileTab()
  filetab.addEventListener("click", clickActiveMonacoEditor)
  await clickActiveMonacoEditor(filetab)
  if (!keepalive) {
    const closeBtn = filetab.querySelector("svg")!
    closeBtn.addEventListener("click", removeFile, false)
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
  private editors: Record<string, MonacoEditorItem> = {}
  public fs = new FileSystem<CompiledFile>()
  public editorManage
  public project = createProjectManager("vue")

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
    await createFile(this, "app.vue", true)
    await createFile(this, "app.ts")
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
    const manager = {
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

      getActive: () => {
        const result = []
        for (let key in editors) {
          const editor = editors[key]
          if (editor.status) {
            result.push(editor)
          }
        }
        return result
      },

      hide: (type: SupportEditorType) => {
        const state = editors[type]
        if (state && state.status) {
          state.status = false
          state.wrap.style.display = "none"
          state.wrap.setAttribute("hidden", "")
        }
      },

      hideAll: () => {
        Object.keys(editors).forEach(editorType => manager.hide(editorType as any))
      },
    }
    return manager
  }
}
