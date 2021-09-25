import CodePlayground from "./code-playground"
import { resolvePackageTypes, UnpkgChangeEventDetail, SKYPACK_CDN } from "@ui-elements/unpkg"
import { getShadowHost } from "@ui-elements/utils"

export async function updatePackages (e: CustomEvent<UnpkgChangeEventDetail>) {
  const { item, action } = e.detail
  const target = e.target as HTMLElement
  const host = getShadowHost(target) as CodePlayground
  const { sandbox } = host
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
