export { parse as babelParse } from "@babel/parser"
export { babelParserDefaultPlugins, walkIdentifiers, walk } from "./babelParse"
export { default as MagicString } from 'magic-string'

export const modulesKey = '__modules__'
export const exportKey = '__export__'
export const dynamicImportKey = '__dynamic_import__'
export const moduleKey = '__module__'
export const globalCSS = "window.__css__"
