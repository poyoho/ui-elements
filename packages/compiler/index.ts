import { CompiledFile, FileSystem } from "@ui-elements/vfs"

interface Compiler {
  getRuntimeImportMap: () => Record<string, string>
  compileFile: (file: CompiledFile) => Promise<CompiledFile>
  getProjectRunableJS: (filesystem: FileSystem<CompiledFile>) => Promise<string[]>
}

type CompilerType = "vue"

export async function importCompiler (type: CompilerType): Promise<Compiler> {
  switch(type) {
    case "vue": return await import("./vue/vue")
  }
}
