import { CompiledFile, FileSystem } from "@ui-elements/vfs"
export * from "./compiler"

export interface ProjectManager {
  // project entry file name
  entryFile: string
  // config file name
  configFile: string
  // default config code
  defaultConfigCode: string
  // packageName: packageVersion
  importMap: Record<string, string>
  // project init dts
  dts: { filePath: string; content: string; }[]
  reload: () => string[]
  update: (file: CompiledFile) => string[]
}

type CompilerType = "vue"

export async function createProjectManager (type: CompilerType, filesystem: FileSystem<CompiledFile>): Promise<ProjectManager> {
  switch (type) {
    case "vue": {
      return (await import("./lib/vue/vue")).createVueProject(filesystem)
    }
  }
}
