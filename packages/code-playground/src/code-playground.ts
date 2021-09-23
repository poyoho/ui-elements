import type IframeSandbox from "@ui-elements/iframe-sandbox/src/iframe-sandbox"
import type DragWrap from "@ui-elements/drag-wrap/src/drag-wrap"
import teamplateElement from "./code-playground-element"
import { FileSystem, CompiledFile } from "@ui-elements/vfs"
import { createMonacoEditorManager } from "./monacoEditor"
import { UnpkgManage } from "@ui-elements/unpkg"
import { createProjectManager } from "@ui-elements/project-config"
import { setupIframesandbox } from "./sandbox"
import { createFileEditor, clickshowInput, fileInputBlur, inputCreateFile } from "./filetab"
import { updatePackages } from "./packageManage"

export default class CodePlayground extends HTMLElement {
  public fs = new FileSystem<CompiledFile>()
  public project = createProjectManager("vue", this.fs)
  public editorManage!: ReturnType<typeof createMonacoEditorManager>
  private createFileEvent = inputCreateFile(this)
  private updatePackages = updatePackages(this)

  async connectedCallback () {
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    wrap.style.display = "flex"
    this.appendChild(wrap)
    this.editorManage = createMonacoEditorManager(this)

    const { project, addButton, addInput, fs, unpkgManage, editorManage } = this
    const projectManage = await project
    const sandbox = setupIframesandbox(this)
    addButton.addEventListener("click", clickshowInput)
    addInput.addEventListener("keydown", this.createFileEvent)
    addInput.addEventListener("blur", fileInputBlur)
    unpkgManage.addEventListener("unpkg-change", this.updatePackages)
    fs.subscribe("update", this.evalProject.bind(this))

    sandbox.setupDependency(projectManage.importMap)
    await createFileEditor(this, projectManage.entryFile, "", true)
    await createFileEditor(this, projectManage.configFile, projectManage.defaultConfigCode, true)
    ;(await editorManage.get("ts").editor.monacoAccessor).typescript.addDTS(projectManage.dts)
    await this.evalProject()
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

  get unpkgManage (): UnpkgManage {
    return this.ownerDocument.querySelector("unpkg-manage")!
  }

  private async evalProject () {
    const { project, sandbox } = this
    const projectManage = await project
    const scripts = await projectManage.getProjectRunableJS()
    sandbox.eval(scripts)
  }
}
