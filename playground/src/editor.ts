import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../lib/monaco-editor/src/monaco-editor"
const elm = document.querySelector(".editor") as any as MonacoEditor
const model = await elm.createModel("ts", "test.ts", "")
elm.setModel(model)
elm.addEventListener("code-change", (e) => {
  const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
  console.log(runnableJS, content)
})
