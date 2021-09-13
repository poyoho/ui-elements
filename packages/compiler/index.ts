import { CompiledFile, FileSystem } from "@ui-elements/vfs"
export * from "./module"

export interface Compiler {
  getRuntimeImportMap: () => Record<string, string>
  compileFile: (file: CompiledFile) => Promise<CompiledFile>
  getProjectRunableJS: (filesystem: FileSystem<CompiledFile>) => Promise<string[]>
  setupLanguageServices: () => void
}

type CompilerType = "vue"

export async function createProjectManager (type: CompilerType): Promise<Compiler> {
  switch(type) {
    case "vue": return await import("./vue/vue")
  }
}
