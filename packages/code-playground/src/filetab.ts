import { activeMonacoEditor, removeMonacoEditorModel } from "./monacoEditor"
import CodePlayground from "./code-playground"
import { FileSystem, CompiledFile } from "@ui-elements/vfs"
import { getShadowHost } from "@ui-elements/utils"

function isCreateAble (filename: string, fs: FileSystem<CompiledFile>) {
  return [".vue", ".ts"].some(extend => filename.endsWith(extend))
    && !fs.isExist(filename)
}

function createFileTab (filename: string, keepalive?: boolean) {
  const filetab = document.createElement("button")
  !keepalive && filetab.setAttribute("closeable", "")
  filetab.innerHTML = filename
    + (keepalive ? '' : `<svg t="1631378872341" class="icon-close" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1198" width="14" height="14"><path d="M466.773333 512l-254.72 254.72 45.226667 45.226667L512 557.226667l254.72 254.72 45.226667-45.226667L557.226667 512l254.72-254.72-45.226667-45.226667L512 466.773333 257.28 212.053333 212.053333 257.28 466.773333 512z" fill="#e1e1e1" p-id="1199"></path></svg>`)
  return filetab
}

export async function createFileEditor (host: CodePlayground,  filename: string, code: Record<string, string>, keepalive?: boolean) {
  const { editorManage, tabWrap, fs } = host

  async function clickActiveFile (e: MouseEvent | HTMLElement) {
    const items = tabWrap.children
    for (let key in items) {
      items[key].tagName === "BUTTON" && items[key].removeAttribute("active")
    }
    if (e instanceof MouseEvent) {
      const target = e.target as HTMLElement
      target.setAttribute("active", "")
    } else {
      e.setAttribute("active", "")
    }
    await activeMonacoEditor(editorManage, fs, filename, code)
  }

  function removeFile(e: MouseEvent) {
    removeMonacoEditorModel(editorManage)
    if (filetab.hasAttribute("active")) {
      ;(filetab.previousElementSibling as HTMLButtonElement).click()
    }
    fs.removeFile(filetab.textContent!)
    filetab.remove()
    e.stopPropagation()
  }

  const filetab = createFileTab(filename, keepalive)
  tabWrap.insertBefore(filetab, tabWrap.lastElementChild!.previousElementSibling)
  filetab.addEventListener("click", clickActiveFile)
  // it must be an asynchronous event to prevent monaco model conflicts
  // caused by creating two files at the same time
  await clickActiveFile(filetab)
  if (!keepalive) {
    const closeBtn = filetab.querySelector("svg")!
    closeBtn.addEventListener("click", removeFile, false)
  }
}

export function clickshowInput (e: MouseEvent) {
  let target = e.currentTarget! as HTMLElement
  const input = target.previousElementSibling as HTMLInputElement
  input.classList.toggle("filename-input-show", true)
  input.focus()
}

export async function inputFilename (e: KeyboardEvent) {
  const target = e.target! as HTMLElement
  const host = getShadowHost(target) as CodePlayground
  if (e.key === "Enter") {
    const target = (e.target as HTMLInputElement)
    const filename = target.value
    if (isCreateAble(filename, host.fs)) {
      await createFileEditor(host, filename, {})
      target.value = ""
      target.classList.toggle("filename-input-show", false)
    } else {
      target.classList.toggle("filename-input-error", true)
      setTimeout(() => {
        target.classList.toggle("filename-input-error", false)
      }, 400)
    }
  }
}

export function fileInputBlur (e: FocusEvent) {
  (e.target as HTMLElement).classList.toggle("filename-input-show", false)
}
