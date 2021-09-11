export interface FileOptions {
  name: string
  content?: string
}

export interface FileCompile {
  js: string
  css: string
  ssr: string
}

export class BaseFile {
  public type = "base"
  public filename: string
  public content = ""
  public change = false

  protected _onUpdate: ((filename: string) => void) | undefined

  constructor(options: FileOptions) {
    this.filename = options.name
    this.content = options.content || ""
  }

  public updateFile(valule: string) {
    this.content = valule
    // set it to false after external processing
    this.change = true
  }
}

export class CompiledFile extends BaseFile {
  public compiled: FileCompile = {
    js: '',
    ssr: '',
    css: '',
  }

}
