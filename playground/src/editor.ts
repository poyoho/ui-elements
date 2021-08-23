import CodeEditor from "../../packages/code-editor/src/code-editor"
const elm = document.querySelector(".editor") as any as CodeEditor

const model = await elm.createModel("ts", "test.ts", "")
elm.setModel(model)
elm.addEventListener("change", (e) => {
  console.log(elm.value)
})
