import { SandboxProxy, srcdoc } from "./sandbox"
import { CompiledFile, FileSystem } from "@ui-elements/utils"

interface Compiler {
  getAppEntry: (filesystem: FileSystem<CompiledFile>) => CompiledFile
  getBootstrap: () => string
  getRuntimeImportMap: () => Record<string, string>
  compileFile: (file: CompiledFile) => Promise<Error[]>
  parseFileModules: (file: CompiledFile, filesystem: FileSystem<CompiledFile>) => Promise<string[]>
}

type CompilerType = "vue"

const IMPORT_MAP = "<!-- IMPORT_MAP -->"

async function importCompiler (type: CompilerType): Promise<Compiler> {
  switch(type) {
    case "vue": return await import("./compiler/vue")
  }
}

export default class CodeSandbox extends HTMLElement {
  private importMaps = { imports: {} }
  private proxy: SandboxProxy | undefined

  get sandbox (): HTMLIFrameElement {
    return this.querySelector("iframe")!
  }

  async connectedCallback() {
    const sandbox = document.createElement("iframe")
    sandbox.className = "sandbox"
    sandbox.setAttribute('sandbox', [
      'allow-forms',
      'allow-modals',
      'allow-pointer-lock',
      'allow-popups',
      // enableSameOrigin.value ? 'allow-same-origin' : null,\
      'allow-same-origin',
      'allow-scripts',
      'allow-top-navigation-by-user-activation',
    ].join(' '))

    this.proxy = new SandboxProxy(sandbox, {

    })

    sandbox.addEventListener('load', () => {
      this.proxy!.handle_links()
    })

    this.appendChild(sandbox)
  }

  disconnectedCallback() {}

  async setupCompiler (type: CompilerType, filesystem: FileSystem<CompiledFile>) {
    const { sandbox, proxy } = this
    const tool = await importCompiler(type)
    // replace importMaps
    Object.assign(this.importMaps.imports, tool.getRuntimeImportMap())
    sandbox.srcdoc = srcdoc.replace(IMPORT_MAP, JSON.stringify(this.importMaps))
    // setup app entry
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
        proxy!.eval(scripts)
      }
    }

    return compiler
  }
}
