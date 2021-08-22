import { CompiledFile, FileOptions } from "../baseFile"

export class SFCFile extends CompiledFile {
  public type = 'sfc'

  constructor(options: FileOptions) {
    super(options)
  }

  public get compiled() {
    return {
      js: '',
      css: '',
      ssr: ''
    }
  }
}
