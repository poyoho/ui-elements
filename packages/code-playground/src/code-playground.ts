import type IframeSandbox from "@ui-elements/iframe-sandbox/src/iframe-sandbox"
import type DragWrap from "@ui-elements/drag-wrap/src/drag-wrap"
import teamplateElement from "./code-playground-element"
import { FileSystem, CompiledFile } from "@ui-elements/vfs"
import { createProjectManager } from "@ui-elements/compiler"
import { createMonacoEditorManager } from "./monacoEditor"
import { setupIframesandbox } from "./sandbox"
import { createFile, clickshowInput, fileInputBlur, inputCreateFile } from "./filetab"

export default class CodePlayground extends HTMLElement {
  public fs = new FileSystem<CompiledFile>()
  public project = createProjectManager("vue")
  public editorManage!: ReturnType<typeof createMonacoEditorManager>
  private createFileEvent = inputCreateFile(this)

  async connectedCallback () {
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    this.appendChild(wrap)
    this.editorManage = createMonacoEditorManager(this)

    const { project, addButton, addInput, fs } = this
    const projectManage = await project
    const sandbox = setupIframesandbox(this)
    sandbox.setupDependency(projectManage.getRuntimeImportMap())
    addButton.addEventListener("click", clickshowInput)
    addInput.addEventListener("keydown", this.createFileEvent)
    addInput.addEventListener("blur", fileInputBlur)
    fs.subscribe("update", async (file) => {
      if (file.filename.endsWith(".vue")) {
        const scripts = await projectManage.getProjectRunableJS(fs)
        sandbox.eval(scripts)
      } else if (file.filename.endsWith(".ts")) {

      }
    })

    await createFile(this, "app.vue", true)
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

  get addButton (): HTMLButtonElement {
    return this.ownerDocument.querySelector("#tab .icon-add")!
  }

  get addInput (): HTMLButtonElement {
    return this.ownerDocument.querySelector("#filename-input")!
  }
}