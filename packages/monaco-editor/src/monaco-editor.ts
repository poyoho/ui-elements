import { setupMonaco, setupTheme,SupportLanguage } from "@ui-elements/monaco"
import { createDefer, debounce, tryPromise } from "@ui-elements/utils"

export type MonacoEditorChangeEvent = Event & {
  value: {
    content: string
  }
}

export default class MonacoEditor extends HTMLElement {
  public monacoAccessor = setupMonaco()
  private editor = createDefer<monaco.editor.IStandaloneCodeEditor>()

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })
    const container = this.ownerDocument.createElement("div")
    container.style.width = "inherit"
    container.style.height = "inherit"
    container.innerHTML = `<div id="editor-container" style="width:inherit;height:inherit;"></div>`
    shadowRoot.appendChild(container)
  }

  get container (): HTMLDivElement {
    return this.shadowRoot!.querySelector("#editor-container")!
  }

  async connectedCallback() {

    const { monaco, style } = await this.monacoAccessor
    const { container } = this

    // move all CSS inside the shadow root, pick only link tags relevant to the editor
    this.shadowRoot!.appendChild(style.cloneNode(true))

    const editor = monaco.editor.create(container, {
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
      useShadowDOM: false,
    })

    // send change event
    editor.onDidChangeModel(() => {
      const model = editor.getModel()
      if (!model) {
        return
      }
      console.log("[monaco-editor] change model")
      model.onDidChangeContent(debounce(() => {
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
      monaco.Uri.file(`file://${filename}`)
    )
  }

  setModel (model: monaco.editor.ITextModel) {
    console.log("[monaco-editor] setModel")
    this.editor.promise.then(editor => {
      editor.setModel(model)
    })
  }

  async findModel (filename: string) {
    const { monaco } = await this.monacoAccessor
    return monaco.editor.getModel(monaco.Uri.file(`file://${filename}`))
  }

  removeModel () {
    this.editor.promise.then(editor => {
      editor.getModel()?.dispose()
    })
  }
}

export async function getRunnableJS (filename: string) {
  const { monaco } = await setupMonaco()
  const uri = monaco.Uri.file(`file://${filename}`)
  // sometimes typescript worker is not loaded
  const worker = await tryPromise(() => monaco.languages.typescript.getTypeScriptWorker(), 3, 100)
  const client = await worker(uri)
  const result = await client.getEmitOutput(uri.toString())
  const firstJS = result.outputFiles.find((o: any) => o.name.endsWith(".js"))
  return (firstJS && firstJS.text) || ""
}
