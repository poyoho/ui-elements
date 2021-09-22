import { CompiledFile, FileSystem } from "@ui-elements/vfs"
export interface Compiler {
  entryFile: string
  configFile: string
  defaultConfigCode: string
  compileFile: (file: CompiledFile) => Promise<CompiledFile>
  getProjectRunableJS: () => Promise<string[]>
  resolveProjectDependencies: () => Promise<{
    dts: {filePath: string, content: string }[]
    importMap: Record<string, string>
  }>
}

type CompilerType = "vue"

export async function createProjectManager (type: CompilerType, filesystem: FileSystem<CompiledFile>): Promise<Omit<Compiler, "setupLanguageServices">> {
  switch (type) {
    case "vue": {
      return (await import("./src/vue/vue")).createVueProject(filesystem)
    }
  }
}
