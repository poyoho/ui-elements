import CodePlayground from "./code-playground"
import MonacoEditor from "@ui-elements/monaco-editor/src/monaco-editor"
import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import { MonacoEditorItem, SupportEditorType } from "./types"
import { resolvePackageTypes } from "@ui-elements/unpkg"

type EditorManage = ReturnType<typeof createMonacoEditorManager>

export function createMonacoEditorManager (host: CodePlayground) {
  const { editorWrap } = host
  const editors: Record<string, MonacoEditorItem> = {}
  const manager = {
    active: (type: SupportEditorType): MonacoEditorItem => {
      let state = editors[type]
      // create it
      if (!state) {
        const editor = new MonacoEditor()
        editor.style.width = "100%"
        editor.style.height = "100%"

        const wrap = host.ownerDocument.createElement("div")
        wrap.style.width = "100%"
        wrap.style.height = "100%"
        wrap.setAttribute("slot", "item")
        wrap.setAttribute("type", type)
        wrap.appendChild(editor)

        state = { wrap, editor, status: false }
        editors[type] = state
        editorWrap.appendChild(state.wrap)
      }
      // show it
      if (!state.status) {
        state.status = true
        state.wrap.style.display = "block"
        state.wrap.removeAttribute("hidden")
      }
      return state
    },

    getActive: () => {
      const result = []
      for (let key in editors) {
        const editor = editors[key]
        if (editor.status) {
          result.push(editor)
        }
      }
      return result
    },

    hide: (type: SupportEditorType) => {
      const state = editors[type]
      if (state && state.status) {
        state.status = false
        state.wrap.style.display = "none"
        state.wrap.setAttribute("hidden", "")
      }
    },

    hideAll: () => {
      editorWrap.items.forEach(item => {
        const type = item.getAttribute("type")
        if (type) {
          manager.hide(type as any)
        }
      })
    },
  }
  return manager
}

function createOrGetEditor (editorManage: EditorManage, types: SupportEditorType[]) {
  editorManage.hideAll()
  const editors = types.map(type => editorManage.active(type))
  return editors
}

async function createOrGetModel (editor: MonacoEditor, type: SupportEditorType, filename: string, code: string, isNotExistFile: boolean) {
  let model
  if (isNotExistFile) {
    model = await editor.createModel(type, filename, code)
  } else {
    model = (await editor.findModel(filename))!
  }
  return model
}

function createOrGetFile (fs: FileSystem<CompiledFile>, filename: string, isNotExistFile: boolean) {
  let file: CompiledFile
  if (isNotExistFile) {
    file = fs.writeFile(new CompiledFile({ name: filename }))
  } else {
    file = fs.readFile(filename)!
  }
  return file
}

export async function activeMonacoEditor (
  editorManage: EditorManage,
  fs: FileSystem<CompiledFile>,
  filename: string
) {
  const isNotExistFile = !fs.isExist(filename)

  const file = createOrGetFile(fs, filename, isNotExistFile)

  if (filename.endsWith(".vue")) {
    const [vuehtmlEditor, tsEditor] = createOrGetEditor(editorManage, ["vuehtml", "ts"])

    const vuehtmlModel = await createOrGetModel(vuehtmlEditor.editor, "vuehtml", filename+".vuehtml", "<template></template>", isNotExistFile)
    const tsModel = await createOrGetModel(tsEditor.editor, "ts", filename+".ts", "export default {}", isNotExistFile)
    vuehtmlEditor.editor.setModel(vuehtmlModel)
    tsEditor.editor.setModel(tsModel)

    if (isNotExistFile) {
      const cache = { html: vuehtmlModel.getValue(), ts: tsModel.getValue() }
      const updateVueFile = async () => {
        file.updateContent([
          cache.html,
          "<script>",
          cache.ts,
          "</script>"
        ].join("\n"))
      }
      vuehtmlModel.onDidChangeContent(() => {
        cache.html = vuehtmlModel.getValue()
        updateVueFile()
      })
      tsModel.onDidChangeContent(async () => {
        cache.ts = await tsEditor.editor.getRunnableJS(tsModel)
        updateVueFile()
      })
    }
  } else if (filename.endsWith(".ts")) {
    const [tsEditor] = createOrGetEditor(editorManage, ["ts"])

    const tsModel = await createOrGetModel(tsEditor.editor, "ts", filename, "", isNotExistFile)
    tsEditor.editor.setModel(tsModel)

    if (isNotExistFile) {
      tsModel.onDidChangeContent(async () => {
        file.updateContent(await tsEditor.editor.getRunnableJS(tsModel))
      })
    }
  } else {
    throw "don't support create ${filename}, only support create *.vue/*.ts."
  }
}

export function removeMonacoEditorModel (editorManage: EditorManage) {
  const activeEditor = editorManage.getActive()
  activeEditor.forEach(async editorState => {
    editorState.editor.removeModel()
  })
}
