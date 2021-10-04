export { babelParserDefaultPlugins, walkIdentifiers } from "./babelParse"
export type { BlockStatement, ExportSpecifier,Function, Identifier, Node, ObjectProperty, Program } from "@babel/types"
export { default as MagicString } from 'magic-string'

export const modulesKey = '__modules__'
export const exportKey = '__export__'
export const dynamicImportKey = '__dynamic_import__'
export const moduleKey = '__module__'
export const globalCSS = "window.__css__"

// import as commonjs
import * as _babelParse from "@babel/parser"
export const babelParse = _babelParse.parse

// import as commonjs
import * as _babelTypes from '@babel/types'
export const isReferenced = _babelTypes.isReferenced

export type { ParserPlugin } from "@babel/parser"
export { walk } from 'estree-walker'

export interface CompiledFile {
  filename: string
  compiled: {
    js: string
    css: string
  }
}

export interface FileSystem {
  isExist: (filename: string) => boolean
  readFile: (filename: string) => CompiledFile | undefined
}
