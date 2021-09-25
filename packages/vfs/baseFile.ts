export interface FileOptions {
  name: string
}

export interface FileCompile {
  js: string
  css: string
  ssr: string
}

export class BaseFile {
  public type = "base"
  public content = ""
  public change = true // set it to false after external processing
  constructor(public filename: string) {}
}

export class CompiledFile extends BaseFile {
  public compiled: FileCompile = {
    js: '',
    ssr: '',
    css: '',
  }
}
