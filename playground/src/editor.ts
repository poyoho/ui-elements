import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"

// const elm = document.querySelector(".editor") as any as MonacoEditor
// const model = await elm.createModel("ts", "test.ts", "")
// elm.addDTS([{
//   name: "vue",
//   version: "3.2.4",
//   entry: "dist/vue.d.ts"
// }])
// elm.setModel(model)
// elm.addEventListener("code-change", (e) => {
//   const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
//   console.log("model", runnableJS, content)
// })

const elm2 = document.querySelector(".editor2") as any as MonacoEditor
const { monaco } = await elm2.monacoInstance
console.log(monaco.languages.getLanguages())
const model2 = await elm2.createModel("vue", "test.vue", `
<script lang="ts">
console.log("asda")
export default {

}
</script>
`)
console.log("creat monaco vue mode")
elm2.setModel(model2)
elm2.addEventListener("code-change", (e) => {
  const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
  console.log("model2", runnableJS, content)
})
