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
    // const shadowRoot = this.attachShadow({ mode: "open" })
    const container = this.ownerDocument.createElement("div")
    container.innerHTML = `<div id="editor-container" style="width:inherit;height:inherit;"></div>`
    // const node = container.content.cloneNode(true)
    // shadowRoot.appendChild(node)
    this.appendChild(container)
  }

  get container (): HTMLDivElement {
    return this!.querySelector("#editor-container")!
  }

  async connectedCallback() {
    const { monaco } = await this.monacoAccessor
    const { container } = this
    console.log(document.getElementsByTagName("link"));

		// move all CSS inside the shadow root, pick only link tags relevant to the editor
    // TODO make monaco editor import with requirejs
		const documentLinks = Array.prototype.slice.call(document.getElementsByTagName('link'), 0).filter((documentLink) => {
			if (/vs\/(base|editor|platform)/.test(documentLink.getAttribute('href'))) {
				return true;
			}
			console.log(`Not moving: `, documentLink);
			return true;
		});
		documentLinks.forEach(documentLink => this.shadowRoot!.appendChild(documentLink));

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
      useShadowDOM: true
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
      monaco.Uri.file(`file://${filename}`)
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
    return monaco.editor.getModel(monaco.Uri.file(`file://${filename}`))
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
