import { CompiledFile, FileOptions } from "../baseFile"

export class JSONFile extends CompiledFile {
  public type = 'json'

  constructor(options: FileOptions) {
    super(options)
  }

  public get compiled() {
    return {
      js: `export default ${JSON.parse(JSON.stringify(this.content))}`,
      css: '',
      ssr: ''
    }
  }
}
