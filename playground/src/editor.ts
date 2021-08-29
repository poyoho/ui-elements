import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"

const elm = document.querySelector(".editor") as any as MonacoEditor
elm.addDTS([
  {
    name: '@vue/shared',
    version: "3.2.4",
    entry: "dist/shared.d.ts"
  },
  {
    name: '@vue/runtime-core',
    version: "3.2.4",
    entry: "dist/runtime-core.d.ts"
  },
  {
    name: '@vue/runtime-dom' ,
    version: "3.2.4",
    entry: "dist/runtime-dom.d.ts"
  },
  {
    name: '@vue/reactivity',
    version: "3.2.4",
    entry: "dist/reactivity.d.ts"
  },
  {
    name: 'vue',
    version: "3.2.4",
    entry: "dist/vue.d.ts"
  }
])
const model = await elm.createModel("ts", "test.ts", `import {} from "vue"`)
elm.setModel(model)
elm.addEventListener("code-change", (e) => {
  const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
  console.log("model", runnableJS, content)
})


