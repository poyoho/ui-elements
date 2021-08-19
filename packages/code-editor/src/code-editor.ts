import { setupMonaco, SupportLanguage, useMonacoImport } from "./monaco"
import { resolvePackageTypes } from "@ui-elements/utils"
import type { editor } from "monaco-editor"

export default class CodeEditor extends HTMLElement {
  public value = ""
  private monacoInstance = setupMonaco()
  private editor: editor.IStandaloneCodeEditor | undefined

  constructor() {
    super()
    const container = document.createElement("div")
    container.className = "editor"
    this.appendChild(container)
  }

  get container (): HTMLDivElement {
    return this.querySelector("div.editor")!
  }

  async connectedCallback() {
    const { monacoInstance } = this
    const { monaco } = await monacoInstance
    const editor = monaco.editor.create(this.container, {
      tabSize: 2,
      insertSpaces: true,
      autoClosingQuotes: 'always',
      detectIndentation: false,
      folding: false,
      automaticLayout: true,
      theme: 'dark',
      minimap: {
        enabled: false,
      },
    })

    // send change event
    editor.onDidChangeModel(() => {
      const model = editor.getModel()
      if (!model) {
        return
      }

      model.onDidChangeContent(() => {
        this.value = editor.getValue()
        const event = document.createEvent("events")
        event.initEvent("change", false, false)
        this.dispatchEvent(event)
      })
    })

    this.editor = editor
  }

  disconnectedCallback() {}

  async createModel (
    extension: keyof typeof SupportLanguage,
    filename: string,
    code?: string) {
    const { monacoInstance } = this
    const { monaco } = await monacoInstance
    return monaco.editor.createModel(
      code || "",
      SupportLanguage[extension],
      monaco.Uri.parse(`file://${filename}`)
    )
  }

  async setModel (model: editor.ITextModel) {
    const { monacoInstance } = this
    await monacoInstance
    this.editor!.setModel(model)
  }

  async addDTS (options: Array<{name: string, version: string, entry: string}>) {
    const { monacoInstance } = this
    const { addPackage } = await monacoInstance
    addPackage(
      await Promise.all(options.map(async option => ({
        name: option.name,
        types: await resolvePackageTypes(option.name, option.version, option.entry)
      })))
    )
  }

  async deleteDTS (names: string[]) {
    const { monacoInstance } = this
    const { deletePackage } = await monacoInstance
    deletePackage(names)
  }
}
