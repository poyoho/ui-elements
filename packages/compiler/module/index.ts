import { processFile } from "./module"
import { CompiledFile, FileSystem } from "./env"

export function parseFileModules (file: CompiledFile, filesystem: FileSystem) {
  return processFile(file, filesystem)
}

export * from "./parseDTS"
