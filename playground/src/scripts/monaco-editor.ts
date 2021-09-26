import type { MonacoEditorChangeEvent, MonacoEditor } from "@ui-elements/monaco-editor"
import { install } from "@ui-elements/monaco-editor"

install()

;(async function () {
  const elm = document.querySelector(".editor") as any as MonacoEditor
  const model = await elm.createModel("ts", "test.vue.ts", `console.log("hello world :)")`)
  await elm.setModel(model)
  elm.addEventListener("code-change", (e) => {
    const {content} = (e as MonacoEditorChangeEvent).value
    console.log("ts", content)
  })

  const elm2 = document.querySelector(".editor2") as any as MonacoEditor
  const model2 = await elm2.createModel("vuehtml", "model2.vuehtml", `<div> {{ aaa }} </div>`)
  await elm2.setModel(model2)
  elm2.addEventListener("code-change", (e) => {
    const {content} = (e as MonacoEditorChangeEvent).value
    console.log("html", content)
  })
})()
