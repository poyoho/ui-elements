import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import boostrap from "./bootstrap/main.js?raw"

function getAppEntry (filesystem: FileSystem<CompiledFile>) {
  const file = filesystem.readFile("boostrap.js")
  if (!file) {
    return filesystem.writeFile(new CompiledFile("main.js"), boostrap)
  }
  return file
}

export async function compileFile (file: CompiledFile) {
}

export async function getProjectRunableJS (filesystem: FileSystem<CompiledFile>) {
  const appEntry = getAppEntry(filesystem)
  await compileFile(appEntry)
  // const modules = parseFileModules(appEntry, filesystem)

  const scripts = [
    'window.__modules__ = {};window.__css__ = \'\'',
    // ...modules.reverse(),
    boostrap,
  ]
  return scripts
}
