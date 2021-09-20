import { CompiledFile, FileSystem } from "@ui-elements/vfs"
export * from "./module"

export interface Compiler {
  compileFile: (file: CompiledFile) => Promise<CompiledFile>
  getProjectRunableJS: (filesystem: FileSystem<CompiledFile>) => Promise<string[]>
}

type CompilerType = "vue"

export async function createProjectManager (type: CompilerType): Promise<Omit<Compiler, "setupLanguageServices">> {
  switch (type) {
    case "vue": {
      return await import("./vue/vue")
    }
  }
}
