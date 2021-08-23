import { CompiledFile, FileSystem, PACKAGE_CDN } from "@ui-elements/utils"
import boostrap from "./bootstrap/main.js?raw"
import appvue from "./bootstrap/app.vue?raw"

export function getRuntimeImportMap () {
  return {
    "vue": PACKAGE_CDN("@vue/runtime-dom@3.2.4/dist/runtime-dom.esm-browser.js")
  }
}

export function getBootstrap () {
  return boostrap
}

export function getAppEntry (filesystem: FileSystem<CompiledFile>) {
  const file = filesystem.readFile("app.vue")
  if (!file) {
    return filesystem.writeFile(new CompiledFile({
      name: "app.vue",
      content: appvue
    }))
  }
  return file
}

export * from "./compile/sfc"
export * from "./compile/module"
