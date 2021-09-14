import { BaseFile } from "./baseFile"
import { EventListen } from "@ui-elements/utils"

type FileSystemEventMap<FileType> = {
  update: (file: FileType) => void;
  delete: (filename: string) => void;
}

export class FileSystem<FileType extends BaseFile> extends EventListen<FileSystemEventMap<FileType>> {
  private files: Record<string, FileType> = {}

  isExist(filename: string) {
    return this.files[filename] !== undefined
  }

  readFile(filename: string): FileType | undefined {
    return this.files[filename]
  }

  writeFile<T extends FileType> (file: T): T {
    const _cache = file.updateContent
    if (!(file.updateContent as any).__MOCK__) {
      file.updateContent = (...args: Parameters<typeof _cache>) => {
        _cache.apply(file, args)
        this.emit("update", file)
      }
      (file.updateContent as any).__MOCK__ = true
    }

    this.files[file.filename] = file
    return file
  }

  removeFile(filename: string) {
    delete this.files[filename]
    this.emit("delete", filename)
  }
}
