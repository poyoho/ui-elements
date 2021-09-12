import { setupMonaco, SupportLanguage, editor, setupTheme, getRunnableJS } from "@ui-elements/monaco"
import { createDefer, debounce } from "@ui-elements/utils"
import { resolvePackageTypes } from "@ui-elements/unpkg"

export type MonacoEditorChangeEvent = Event & {
  value: {
    content: string
  }
}
export default class MonacoEditor extends HTMLElement {
  private monacoInstance = setupMonaco()
  private editor = createDefer<editor.IStandaloneCodeEditor>()

  constructor() {
    super()
    const container = document.createElement("div")
    container.className = "editor"
    container.style.width = "inherit"
    container.style.height = "inherit"
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
      theme: 'vscode-dark',
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
      console.log("[monaco-editor] change model")
      model.onDidChangeContent(debounce(async () => {
        // model.uri.path
        const event = document.createEvent("events") as MonacoEditorChangeEvent
        event.initEvent("code-change", false, false)
        event.value = {
          content: editor.getValue(),
        }
        this.dispatchEvent(event)
      }))
    })
    this.editor.resolve(editor)
    await setupTheme(monaco, editor)
    monaco.editor.setTheme("vscode-dark")
  }

  disconnectedCallback() {}

  async createModel (
    extension: keyof typeof SupportLanguage,
    filename: string,
    code?: string) {
    console.log("[monaco-editor] createModel")
    const { monacoInstance } = this
    const { monaco } = await monacoInstance
    return monaco.editor.createModel(
      code || "",
      SupportLanguage[extension],
      monaco.Uri.parse(`file://${filename}`)
    )
  }

  setModel (model: editor.ITextModel) {
    console.log("[monaco-editor] setModel")
    this.editor.promise.then(editor => {
      editor.setModel(model)
    })
  }

  async findModel (filename: string) {
    const { monacoInstance } = this
    const { monaco } = await monacoInstance
    return monaco.editor.getModel(monaco.Uri.parse(`file://${filename}`))
  }

  removeModel () {
    this.editor.promise.then(editor => {
     editor.getModel()?.dispose()
    })
  }

  async addDTS (options: Array<{name: string, version: string, entry: string}>) {
    console.log("[monaco-editor] addDTS")
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
    console.log("[monaco-editor] deleteDTS")
    const { monacoInstance } = this
    const { deletePackage } = await monacoInstance
    deletePackage(names)
  }

  async getRunnableJS (model: editor.ITextModel) {
    console.log("[monaco-editor] getRunnableJS")
    const { monacoInstance } = this
    const { monaco } = await monacoInstance
    return getRunnableJS(monaco, model)
  }
}
