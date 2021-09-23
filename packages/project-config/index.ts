import { CompiledFile, FileSystem } from "@ui-elements/vfs"
export interface ProjectManager {
  entryFile: string
  configFile: string
  defaultConfigCode: string
  importMap: Record<string, string>
  dts: { filePath: string; content: string; }[]
  compileFile: (file: CompiledFile) => Promise<CompiledFile>
  getProjectRunableJS: () => Promise<string[]>
}

type CompilerType = "vue"

export async function createProjectManager (type: CompilerType, filesystem: FileSystem<CompiledFile>): Promise<ProjectManager> {
  switch (type) {
    case "vue": {
      return (await import("./src/vue/vue")).createVueProject(filesystem)
    }
  }
}
