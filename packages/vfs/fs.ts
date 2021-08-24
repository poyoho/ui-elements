import { BaseFile } from "./baseFile"

export class FileSystem<FileType extends BaseFile> {
  private files: Record<string, FileType> = {}

  isExist(filename: string) {
    return this.files[filename] !== undefined
  }

  readFile(filename: string): FileType | undefined {
    return this.files[filename]
  }

  writeFile<T extends FileType> (file: T): T {
    this.files[file.filename] = file
    return file
  }

  rm(filename: string) {
    delete this.files[filename]
  }
}
