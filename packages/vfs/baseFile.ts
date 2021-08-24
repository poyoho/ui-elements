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
  private text = ""
  protected _onUpdate: ((filename: string) => void) | undefined

  constructor(options: FileOptions) {
    this.filename = options.name
    this.text = options.content || ""
  }

  public get content() {
    return this.text
  }

  public updateFile(valule: string) {
    this.text = valule
  }
}

export class CompiledFile extends BaseFile {
  public compiled: FileCompile = {
    js: '',
    ssr: '',
    css: ''
  }

}
