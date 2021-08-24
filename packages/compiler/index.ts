import { CompiledFile, FileSystem } from "@ui-elements/vfs"

interface Compiler {
  getAppEntry: (filesystem: FileSystem<CompiledFile>) => CompiledFile
  getBootstrap: () => string
  getRuntimeImportMap: () => Record<string, string>
  compileFile: (file: CompiledFile) => Promise<Error[]>
  parseFileModules: (file: CompiledFile, filesystem: FileSystem<CompiledFile>) => Promise<string[]>
}

interface CodeSandbox {
  setupDependency: (importMap: Record<string, string>) => void
  eval: (scrpt: string | string[]) => void
}

type CompilerType = "vue"

async function importCompiler (type: CompilerType): Promise<Compiler> {
  switch(type) {
    case "vue": return await import("./vue/vue")
  }
}

export async function setupSandboxRuntime (type: CompilerType, filesystem: FileSystem<CompiledFile>, sandbox: CodeSandbox) {
  const tool = await importCompiler(type)
  sandbox.setupDependency(tool.getRuntimeImportMap())
  // setup compiler
  const compiler = {
    // compile one file
    compileFile: async (file: CompiledFile) => {
      const err = await tool.compileFile(file)
      if (err.length > 0) {
        throw err
      }
      return file
    },
    // compile entry file and exec it
    execModules: async () => {
      const appEntry = tool.getAppEntry(filesystem)
      await compiler.compileFile(appEntry)
      const modules = await tool.parseFileModules(appEntry, filesystem)
      const scripts = [
        'window.__modules__ = {};window.__css__ = \'\'',
        ...modules.reverse(),
        tool.getBootstrap(),
      ]
      sandbox.eval(scripts)
    }
  }

  return compiler
}
