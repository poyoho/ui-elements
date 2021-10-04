import { CompiledFile, FileSystem } from "./env"
import { processFile } from "./module"

export function parseFileModules (file: CompiledFile, filesystem: FileSystem, seen: Map<CompiledFile, string>) {
  return processFile(file, filesystem, seen)
}

export * from "./parseDTS"
