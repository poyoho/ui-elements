import type { DragWrap } from "@ui-elements/drag-wrap"
import type { IframeSandbox } from "@ui-elements/iframe-sandbox"
import { UnpkgManage } from "@ui-elements/unpkg"
import { CompiledFile,FileSystem } from "@ui-elements/vfs"

import teamplateElement from "./code-playground-element"
import { clickshowInput, createFileEditor, fileInputBlur, inputFilename } from "./filetab"
import { createMonacoEditorManager } from "./monacoEditor"
import { updatePackages } from "./packageManage"
import { compileFile,createProjectManager } from "./project-config"
import { setupIframesandboxEvent } from "./sandbox"

export default class CodePlayground extends HTMLElement {
  public fs = new FileSystem<CompiledFile>()
  public editorManage = createMonacoEditorManager(this)

  constructor () {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const wrap = this.ownerDocument.createElement("div")
    wrap.innerHTML = teamplateElement
    wrap.style.width = "inherit"
    wrap.style.height = "inherit"
    wrap.style.display = "flex"
    shadowRoot.appendChild(wrap)
  }

  connectedCallback () {
    const { addButton, addInput, unpkgManage } = this
    setupIframesandboxEvent(this)
    addButton.addEventListener("click", clickshowInput)
    addInput.addEventListener("keydown", inputFilename)
    addInput.addEventListener("blur", fileInputBlur)
    unpkgManage.addEventListener("unpkg-change", updatePackages)
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
    const { sandbox, editorManage, unpkgManage, fs } = this
    const projectManage = await createProjectManager("vue", this.fs)
    let isReady = false
    async function updateProjectOutput (file: CompiledFile) {
      const cacheStatus = isReady
      await compileFile(file)
      cacheStatus && sandbox.eval(projectManage.update(file))
    }

    fs.clear()
    fs.subscribe("update", updateProjectOutput)
    sandbox.setupDependency(projectManage.importMap)
    unpkgManage.installPackage(projectManage.importMap)
    await createFileEditor(this, projectManage.entryFile, {
      vuehtml: "<template>vue template</template>",
      ts: "export default {}"
    }, true)
    isReady = true
    await createFileEditor(this, projectManage.configFile, {
      ts: projectManage.defaultConfigCode
    }, true)
    ;(await editorManage.get("ts").editor.monacoAccessor).typescript.addDTS(projectManage.dts)
  }
}
