import * as DemoBlock from "@ui-elements/demo-block"
import * as MonacoEditor from "@ui-elements/monaco-editor"
import * as CodeComment from "@ui-elements/code-comment"
import * as IframeSandbox from "@ui-elements/iframe-sandbox"
import * as DragWrap from "@ui-elements/drag-wrap"
import * as TabContainer from "@ui-elements/tab-container"
import * as UnpkgManage from "@ui-elements/unpkg"

export function install () {
  DemoBlock.install()
  MonacoEditor.install()
  CodeComment.install()
  IframeSandbox.install()
  DragWrap.install()
  TabContainer.install()
  UnpkgManage.install()
}
