import { CompiledFile, FileOptions } from "../baseFile"

export class CssFile extends CompiledFile {
  public type = 'css'

  constructor(options: FileOptions) {
    super(options)
  }

  public get compiled() {
    return {
      js: '',
      css: this.toString(),
      ssr: ''
    }
  }
}
