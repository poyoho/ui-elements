import type { MonacoEditorChangeEvent, default as MonacoEditor } from "../../packages/monaco-editor/src/monaco-editor"
import { resolvePackage } from "../../packages/unpkg"

const elm = document.querySelector(".editor") as any as MonacoEditor
const pkgs = await resolvePackage("vue", "3.2.4")
await elm.addDTS(pkgs.map(pkg => ({name: pkg.name, version: pkg.version, entry: pkg.types})).filter(el => el.entry))
const model = await elm.createModel("ts", "test.ts", `import { ref } from "vue"`)
await elm.setModel(model)
elm.addEventListener("code-change", (e) => {
  const {runnableJS, content} = (e as MonacoEditorChangeEvent).value
  console.log(runnableJS, content)
})
