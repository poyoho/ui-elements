import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import boostrap from "./bootstrap/main.js?raw"
import appvue from "./bootstrap/app.vue?raw"
import { parseFileModules, compileVueSFCFile } from "@ui-elements/compiler"

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
  const err = await compileVueSFCFile(file)
  if (err.length > 0) {
    throw err
  }
  return file
}

export async function getProjectRunableJS (filesystem: FileSystem<CompiledFile>) {
  const appEntry = getAppEntry(filesystem)
  await compileFile(appEntry)
  const modules = parseFileModules(appEntry, filesystem)
  console.log(modules);

  const scripts = [
    'window.__modules__ = {};window.__css__ = \'\'',
    ...modules.reverse(),
    boostrap,
  ]
  return scripts
}
