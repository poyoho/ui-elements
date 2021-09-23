import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import boostrap from "./bootstrap/main.js?raw"
import { parseFileModules } from "@ui-elements/compile-module"

function getAppEntry (filesystem: FileSystem<CompiledFile>) {
  const file = filesystem.readFile("boostrap.js")
  if (!file) {
    return filesystem.writeFile(new CompiledFile({
      name: "main.js",
      content: boostrap
    }))
  }
  return file
}

export async function compileFile (file: CompiledFile) {
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
