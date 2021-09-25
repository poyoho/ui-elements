import boostrap from "./bootstrap/main.js?raw"
import indexDTS from "./bootstrap/index.d.ts?raw"
import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import { parseFileModules } from "@ui-elements/compile-module"
import { resolvePackageTypes } from "@ui-elements/unpkg"

export async function createVueProject(filesystem: FileSystem<CompiledFile>) {
  const dts = await resolvePackageTypes("vue", "3.2.6")
  const modules = new Map<CompiledFile, string>()
  const genScripts = () => [
    'window.__modules__ = {};window.__css__ = \'\'',
    ...Array.from(modules.values()),
    boostrap,
  ]

  const result = {
    entryFile: "app.vue",
    configFile: "config.ts",
    defaultConfigCode: [
      `const config: AppUserConfig = {`,
      `  // init vue app`,
      `  enhanceApp (app) {}`,
      `}`,
      `export default config`
    ].join("\n"),
    importMap: {
      vue: "3.2.6"
    },
    dts: dts.concat([{
      filePath: "index.d.ts",
      content: indexDTS
    }]),

    reload () {
      const appConfig = filesystem.readFile(result.configFile)!
      const appEntry = filesystem.readFile(result.entryFile)!
      modules.clear()
      parseFileModules(appConfig, filesystem, modules)
      parseFileModules(appEntry, filesystem, modules)
      return genScripts()
    },

    update (file: CompiledFile) {
      if (!modules.size) {
        return result.reload()
      }
      modules.delete(file)
      parseFileModules(file, filesystem, modules)
      return genScripts()
    }
  }

  return result
}
