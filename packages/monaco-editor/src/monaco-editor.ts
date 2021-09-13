import { setupMonaco, SupportLanguage, editor, setupTheme, getRunnableJS } from "@ui-elements/monaco"
import { createDefer, debounce } from "@ui-elements/utils"

export type MonacoEditorChangeEvent = Event & {
  value: {
    content: string
  }
}

export default class MonacoEditor extends HTMLElement {
  public monacoAccessor = setupMonaco()
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
    const { monaco } = await this.monacoAccessor

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
    code?: string
  ) {
    console.log("[monaco-editor] createModel")
    const { monaco } = await this.monacoAccessor
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
    const { monaco } = await this.monacoAccessor
    return monaco.editor.getModel(monaco.Uri.parse(`file://${filename}`))
  }

  removeModel () {
    this.editor.promise.then(editor => {
     editor.getModel()?.dispose()
    })
  }

  async getRunnableJS (model: editor.ITextModel) {
    console.log("[monaco-editor] getRunnableJS")
    const { monaco } = await this.monacoAccessor
    return getRunnableJS(monaco, model)
  }
}
