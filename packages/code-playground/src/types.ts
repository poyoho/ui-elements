import MonacoEditor from "@ui-elements/monaco-editor/src/monaco-editor"

export interface MonacoEditorItem {
  wrap: HTMLDivElement
  editor: MonacoEditor
  status: boolean
}

export type SupportEditorType = "vuehtml" | "ts"
