import { CompiledFile, FileSystem } from "@ui-elements/vfs"
export * from "./module"

export interface Compiler {
  getRuntimeImportMap: () => Record<string, string>
  compileFile: (file: CompiledFile) => Promise<CompiledFile>
  getProjectRunableJS: (filesystem: FileSystem<CompiledFile>) => Promise<string[]>
  setupLanguageServices: (monacoAccessor: any) => void
}

type CompilerType = "vue"

export async function createProjectManager (type: CompilerType): Promise<Omit<Compiler, "setupLanguageServices">> {
  switch (type) {
    case "vue": {
      const vue = await import("./vue/vue")
      // TODO setup vue language services
      vue.setupLanguageServices("")
      return vue
    }
  }
}
