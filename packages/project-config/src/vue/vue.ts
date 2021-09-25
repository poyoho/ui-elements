import boostrap from "./bootstrap/main.js?raw"
import configDTS from "./bootstrap/config.d.ts?raw"
import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import { parseFileModules } from "@ui-elements/compile-module"
import { compileVueSFCFile } from "@ui-elements/compile-vue"
import { resolvePackageTypes } from "@ui-elements/unpkg"

export async function createVueProject(filesystem: FileSystem<CompiledFile>) {
  const dts = await resolvePackageTypes("vue", "3.2.6")

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
      filePath: "config",
      content: configDTS
    }]),

    async compileFile (file: CompiledFile) {
      const err = await compileVueSFCFile(file)
      if (err.length > 0) {
        throw err
      }
      return file
    },

    async getProjectRunableJS () {
      const appEntry = filesystem.readFile(result.entryFile)!
      const appConfig = filesystem.readFile(result.configFile)!

      await result.compileFile(appEntry)

      const modules = parseFileModules(appEntry, filesystem)
      const configModules = parseFileModules(appConfig, filesystem)

      const scripts = [
        'window.__modules__ = {};window.__css__ = \'\'',
        ...configModules,
        ...modules.reverse(),
        boostrap,
      ]

      return scripts
    }
  }

  return result
}
