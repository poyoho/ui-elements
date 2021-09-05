import { CompiledFile, FileSystem, processFile } from "./module"

export function parseFileModules (file: CompiledFile, filesystem: FileSystem) {
  return processFile(file, filesystem)
}
