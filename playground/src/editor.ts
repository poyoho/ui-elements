import CodeEditor, { CodeEditorChangeEvent } from "../../packages/code-editor/src/code-editor"
const elm = document.querySelector(".editor") as any as CodeEditor

const model = await elm.createModel("ts", "test.ts", "")
elm.setModel(model)
elm.addEventListener("code-change", (e) => {
  const {runnableJS, content} = (e as CodeEditorChangeEvent).value
  console.log(runnableJS, content)
})
