import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"
// import { resolvePackage } from "../../packages/unpkg"

// const elm = document.querySelector(".editor") as any as MonacoEditor
// const pkgs = await resolvePackage("vue", "3.2.4")
// await elm.addDTS(pkgs.map(pkg => ({name: pkg.name, version: pkg.version, entry: pkg.types})).filter(el => el.entry))
// const model = await elm.createModel("ts", "test.vue.ts", `import { ref } from "vue"`)
// await elm.setModel(model)
// elm.addEventListener("code-change", (e) => {
//   const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
//   console.log("ts", runnableJS, content)
// })

const elm2 = document.querySelector(".editor2") as any as MonacoEditor
const model2 = await elm2.createModel("vuehtml", "model2.vuehtml", `<div> {{ aaa }} </div>`)
console.log(model2)
await elm2.setModel(model2)
elm2.addEventListener("code-change", (e) => {
  const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
  console.log("html", runnableJS, content)
})
