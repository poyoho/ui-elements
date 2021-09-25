import type IframeSandbox from "@ui-elements/iframe-sandbox/src/iframe-sandbox"
import type DragWrap from "@ui-elements/drag-wrap/src/drag-wrap"
import teamplateElement from "./code-playground-element"
import { FileSystem, CompiledFile } from "@ui-elements/vfs"
import { createMonacoEditorManager } from "./monacoEditor"
import { UnpkgManage } from "@ui-elements/unpkg"
import { createProjectManager, ProjectManager } from "@ui-elements/project-config"
import { setupIframesandboxEvent } from "./sandbox"
import { createFileEditor, clickshowInput, fileInputBlur, inputCreateFile } from "./filetab"
import { updatePackages } from "./packageManage"

export default class CodePlayground extends HTMLElement {
  public fs = new FileSystem<CompiledFile>()
  public project!: Promise<ProjectManager>
  public editorManage!: ReturnType<typeof createMonacoEditorManager>
  private createFileEvent = inputCreateFile(this)
  private updatePackages = updatePackages(this)

  async connectedCallback () {
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    wrap.style.display = "flex"
    shadowRoot.appendChild(wrap)

    this.editorManage = createMonacoEditorManager(this)

    const { addButton, addInput, fs, unpkgManage } = this
    setupIframesandboxEvent(this)
    addButton.addEventListener("click", clickshowInput)
    addInput.addEventListener("keydown", this.createFileEvent)
    addInput.addEventListener("blur", fileInputBlur)
    unpkgManage.addEventListener("unpkg-change", this.updatePackages)
    fs.subscribe("update", this.evalProject.bind(this))
    this.setupProjectManage()
  }

  disconnectedCallback () {
  }

  attributeChangedCallback () {
  }

  get sandbox (): IframeSandbox {
    return this.shadowRoot!.querySelector("#sandbox")!
  }
  get editorWrap (): DragWrap {
    return this.shadowRoot!.querySelector("#editor-wrap")!
  }
  get tabWrap (): HTMLDivElement {
    return this.shadowRoot!.querySelector("#tab")!
  }

  get addButton (): HTMLButtonElement {
    return this.shadowRoot!.querySelector("#tab .icon-add")!
  }

  get addInput (): HTMLButtonElement {
    return this.shadowRoot!.querySelector("#filename-input")!
  }

  get unpkgManage (): UnpkgManage {
    return this.shadowRoot!.querySelector("unpkg-manage")!
  }

  public async setupProjectManage () {
    this.project = createProjectManager("vue", this.fs)
    const { sandbox, editorManage, unpkgManage } = this
    const projectManage = await this.project

    sandbox.setupDependency(projectManage.importMap)
    unpkgManage.installPackage(projectManage.importMap)
    await createFileEditor(this, projectManage.entryFile, "", true)
    await createFileEditor(this, projectManage.configFile, projectManage.defaultConfigCode, true)
    ;(await editorManage.get("ts").editor.monacoAccessor).typescript.addDTS(projectManage.dts)
    await this.evalProject()
  }

  private async evalProject () {
    const { project, sandbox } = this
    const projectManage = await project
    const scripts = await projectManage.getProjectRunableJS()
    sandbox.eval(scripts)
  }
}
