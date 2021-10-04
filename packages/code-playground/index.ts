import { install as DragWrapInstall } from "@ui-elements/drag-wrap"
import { install as IframeSandboxInstall } from "@ui-elements/iframe-sandbox"
import { install as MonacoEditorInstall } from "@ui-elements/monaco-editor"
import { install as UnpkgInstall } from "@ui-elements/unpkg"

import CodePlayground from "./src/code-playground"

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
    UnpkgInstall()
    window.CodePlayground = CodePlayground
    window.customElements.define("code-playground", CodePlayground)
  }
}
