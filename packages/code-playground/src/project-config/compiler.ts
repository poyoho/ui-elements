import { createSinglePromise } from "@ui-elements/utils"
import { CompiledFile } from "@ui-elements/vfs"

const vueCompiler = createSinglePromise(() => import("@ui-elements/compile-vue"))
const jsCompiler = createSinglePromise(() => import("@ui-elements/monaco-editor"))

export async function compileFile (file: CompiledFile) {
  if (!file.change) {
    return
  }
  file.change = false
  if (file.filename.endsWith(".vue")) {
    await (await vueCompiler()).compileVueSFCFile(file)
  } else if (file.filename.endsWith(".ts")) {
    const js = await (await jsCompiler()).getRunnableJS(file.filename)
    file.compiled.js = js
  }
}
