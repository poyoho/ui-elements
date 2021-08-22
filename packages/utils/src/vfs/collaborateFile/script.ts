import { CompiledFile, FileOptions } from "../baseFile"

export class ScriptFile extends CompiledFile {
  public type = 'script'

  constructor(options: FileOptions) {
    super(options)
  }

  public get compiled() {
    return {
      js: this.content,
      css: '',
      ssr: ''
    }
  }
}
