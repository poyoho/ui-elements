import CodePlayground from "./src/code-playground"
import { install as IframeSandboxInstall } from "@ui-elements/iframe-sandbox"
import { install as DragWrapInstall } from "@ui-elements/drag-wrap"
import { install as MonacoEditorInstall } from "@ui-elements/monaco-editor"

declare global {
  interface Window {
    CodePlayground: typeof CodePlayground
  }
  interface HTMLElementTagNameMap {
    "code-playground": CodePlayground
  }
}

export function install() {
  if (!window.customElements.get("code-playground")) {
    IframeSandboxInstall()
    DragWrapInstall()
    MonacoEditorInstall()
    window.CodePlayground = CodePlayground
    window.customElements.define("code-playground", CodePlayground)
  }
}
