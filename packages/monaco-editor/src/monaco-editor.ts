import { setupMonaco, SupportLanguage, editor, getRunnableJS, setupTheme } from "@ui-elements/monaco"
import { debounce } from "@ui-elements/utils"
import { resolvePackageTypes } from "@ui-elements/unpkg"

export type MonacoEditorChangeEvent = Event & {
  value: {
    content: string
    // runnableJS: string
  }
}

export default class MonacoEditor extends HTMLElement {
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

    this.editor = monaco.editor.create(this.container, {
      tabSize: 2,
      insertSpaces: true,
      autoClosingQuotes: 'always',
      detectIndentation: false,
      folding: false,
      automaticLayout: true,
      theme: 'vscode-dark',
      minimap: {
        enabled: false,
      },
    })

    // send change event
    this.editor.onDidChangeModel(() => {
      const model = this.editor!.getModel()
      if (!model) {
        return
      }

      model.onDidChangeContent(debounce(async () => {
        const event = document.createEvent("events") as MonacoEditorChangeEvent
        event.initEvent("code-change", false, false)
        event.value = {
          content: this.editor!.getValue(),
          // runnableJS: await getRunnableJS(monaco, model)
        }
        this.dispatchEvent(event)
      }))
    })

    await setupTheme(monaco, this.editor)
    monaco.editor.setTheme("vscode-dark")
  }

  disconnectedCallback() {}

  async createModel (
    extension: keyof typeof SupportLanguage,
    filename: string,
    code?: string) {
    console.log("createModel")
    const { monacoInstance } = this
    const { monaco } = await monacoInstance

    return monaco.editor.createModel(
      code || "",
      SupportLanguage[extension],
      monaco.Uri.parse(`file://${filename}`)
    )
  }

  async setModel (model: editor.ITextModel) {
    console.log("setModel")
    const { monacoInstance } = this
    await monacoInstance
    this.editor!.setModel(model)
  }

  async addDTS (options: Array<{name: string, version: string, entry: string}>) {
    console.log("addDTS")
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
    console.log("deleteDTS")
    const { monacoInstance } = this
    const { deletePackage } = await monacoInstance
    deletePackage(names)
  }
}
