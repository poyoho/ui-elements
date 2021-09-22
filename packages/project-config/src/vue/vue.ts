import boostrap from "./bootstrap/main.js?raw"
import configDTS from "./bootstrap/config.d.ts?raw"
import { CompiledFile, FileSystem } from "@ui-elements/vfs"
import { parseFileModules, compileVueSFCFile } from "@ui-elements/compiler"
import { resolvePackageTypes, SKYPACK_CDN } from "@ui-elements/unpkg"

export function createVueProject(filesystem: FileSystem<CompiledFile>) {
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

    async resolveProjectDependencies () {
      const dts = await resolvePackageTypes("vue", "3.2.6")
      dts.push({
        filePath: "config",
        content: configDTS
      })
      return {
        dts,
        importMap: {
          vue: SKYPACK_CDN("vue", "3.2.6")
        }
      }
    },

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

      await Promise.all([
        result.compileFile(appEntry),
        result.compileFile(appConfig)
      ])

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
