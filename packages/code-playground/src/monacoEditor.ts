import { MonacoEditor } from "@ui-elements/monaco-editor"
import { debounce } from "@ui-elements/utils"
import { CompiledFile, FileSystem } from "@ui-elements/vfs"

import CodePlayground from "./code-playground"
import { MonacoEditorItem, SupportEditorType } from "./types"

type EditorManage = ReturnType<typeof createMonacoEditorManager>

export function createMonacoEditorManager (host: CodePlayground) {
  const editors: Record<string, MonacoEditorItem> = {}
  const manager = {
    get: (type: SupportEditorType): MonacoEditorItem => {
      return editors[type]
    },
    active: (types: SupportEditorType[]): MonacoEditorItem[] => {
      const { editorWrap } = host
      manager.hideAll()
      const result = types.map(type => {
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
      })
      editorWrap.updateItems()
      return result
    },

    getActive: () => {
      const result = []
      for (const key in editors) {
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
      const { editorWrap } = host
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

async function createOrGetModel (
  editor: MonacoEditor,
  type: SupportEditorType,
  filename: string,
  code: string,
  isNotExistFile: boolean
) {
  let model
  if (isNotExistFile) {
    model = await editor.createModel(type, filename, code)
  } else {
    model = (await editor.findModel(filename))!
  }
  return model
}

function createOrGetFile (fs: FileSystem<CompiledFile>, filename: string, content: string, isNotExistFile: boolean) {
  let file: CompiledFile
  if (isNotExistFile) {
    file = fs.writeFile(new CompiledFile(filename), content)
  } else {
    file = fs.readFile(filename)!
  }
  return file
}

export async function activeMonacoEditor (
  editorManage: EditorManage,
  fs: FileSystem<CompiledFile>,
  filename: string,
  code: Record<string, string>
) {
  const isNotExistFile = !fs.isExist(filename)

  if (filename.endsWith(".vue")) {
    const [vuehtmlEditor, tsEditor] = editorManage.active(["vuehtml", "ts"])

    const vuehtmlModel = await createOrGetModel(
      vuehtmlEditor.editor,
      "vuehtml",
      filename+".vuehtml",
      code.vuehtml || "",
      isNotExistFile
    )
    vuehtmlEditor.editor.setModel(vuehtmlModel)
    const tsModel = await createOrGetModel(tsEditor.editor, "ts", filename+".ts", code.ts || "", isNotExistFile)
    tsEditor.editor.setModel(tsModel)

    if (isNotExistFile) {
      const cache = { html: vuehtmlModel.getValue(), ts: tsModel.getValue() }
      const getContent = () => [
        cache.html,
        "<script>",
        cache.ts,
        "</script>"
      ].join("\n")
      const file = createOrGetFile(fs, filename, getContent(), isNotExistFile)
      vuehtmlModel.onDidChangeContent(debounce(() => {
        cache.html = vuehtmlModel.getValue()
        fs.writeFile(file, getContent())
      }))
      tsModel.onDidChangeContent(debounce(() => {
        cache.ts = tsModel.getValue()
        fs.writeFile(file, getContent())
      }))
    }
  } else if (filename.endsWith(".ts")) {
    const [tsEditor] = editorManage.active(["ts"])

    const tsModel = await createOrGetModel(tsEditor.editor, "ts", filename, code.ts || "", isNotExistFile)
    tsEditor.editor.setModel(tsModel)

    if (isNotExistFile) {
      const file = createOrGetFile(fs, filename, code.ts || "", isNotExistFile)
      tsModel.onDidChangeContent(debounce(() => {
        fs.writeFile(file, tsModel.getValue())
      }))
    }
  } else {
    throw `don't support create ${filename}, only support create *.vue/*.ts.`
  }
}

export function removeMonacoEditorModel (editorManage: EditorManage) {
  const activeEditor = editorManage.getActive()
  activeEditor.forEach(editorState => {
    editorState.editor.removeModel()
  })
}
