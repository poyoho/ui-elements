import CodePlayground from "./code-playground"

export function updatePackages (host: CodePlayground) {
  return async (e: Event) => {
    const packageList = (e as CustomEvent).detail
    const { editorManage, sandbox } = host
    const tsEditor = host.editorManage.get("ts")
    if (tsEditor) {
      const accessor = await tsEditor.editor.monacoAccessor
      sandbox
      // accessor.typescript.addDTS()
    }
  }
}
