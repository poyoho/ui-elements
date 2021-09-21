import CodePlayground from "./code-playground"
import { resolvePackageTypes, UnpkgChangeEventDetail, SKYPACK_CDN } from "@ui-elements/unpkg"

export function updatePackages (host: CodePlayground) {
  return async (e: CustomEvent<UnpkgChangeEventDetail>) => {
    const { item, action } = e.detail
    const { editorManage, sandbox } = host
    const tsEditor = host.editorManage.get("ts")
    if (tsEditor) {
      const accessor = await tsEditor.editor.monacoAccessor
      if (action === "add") {
        const dts = await resolvePackageTypes(item.name, item.version)
        accessor.typescript.addDTS(dts)
        sandbox.setupDependency({
          [item.name]: SKYPACK_CDN(item.name, item.version)
        })
      } else if (action === "delete") {

      }
    }
  }
}
