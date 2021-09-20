import CodePlayground from "./code-playground"
import { resolvePackageTypes, UnpkgChangeEventDetail } from "@ui-elements/unpkg"

export function updatePackages (host: CodePlayground) {
  return async (e: CustomEvent<UnpkgChangeEventDetail>) => {
    const { item, action } = e.detail
    const { editorManage, sandbox } = host
    const tsEditor = host.editorManage.get("ts")
    if (tsEditor) {
      const accessor = await tsEditor.editor.monacoAccessor
      if (action === "add") {
        // console.log(dts)
      } else if (action === "delete") {

      }
      // sandbox.setupDependency()
      // accessor.typescript.addDTS()
    }
  }
}
