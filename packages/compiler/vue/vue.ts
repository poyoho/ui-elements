import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import { PACKAGE_CDN } from "@ui-elements/unpkg"
import { parseFileModules } from "../module"
import boostrap from "./bootstrap/main.js?raw"
import appvue from "./bootstrap/app.vue?raw"
import { compileFile as compileSFCFile } from "./compile/sfc"

export function getRuntimeImportMap () {
  return {
    "vue": PACKAGE_CDN("@vue/runtime-dom@3.2.4/dist/runtime-dom.esm-browser.js")
  }
}

function getAppEntry (filesystem: FileSystem<CompiledFile>) {
  const file = filesystem.readFile("app.vue")
  if (!file) {
    return filesystem.writeFile(new CompiledFile({
      name: "app.vue",
      content: appvue
    }))
  }
  return file
}

export async function compileFile (file: CompiledFile) {
  const err = await compileSFCFile(file)
  if (err.length > 0) {
    throw err
  }
  return file
}

export async function getProjectRunableJS (filesystem: FileSystem<CompiledFile>) {
  const appEntry = getAppEntry(filesystem)
  await compileFile(appEntry)
  const modules = parseFileModules(appEntry, filesystem)
  const scripts = [
    'window.__modules__ = {};window.__css__ = \'\'',
    ...modules.reverse(),
    boostrap,
  ]
  return scripts
}

