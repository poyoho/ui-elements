import { processFile } from "./module"
import { CompiledFile, FileSystem } from "./env"

export function parseFileModules (file: CompiledFile, filesystem: FileSystem, seen: Map<CompiledFile, string>) {
  return processFile(file, filesystem, seen)
}

export * from "./parseDTS"
