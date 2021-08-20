import { PACKAGE_CDN, createSinglePromise } from '@ui-elements/utils'
import type * as defaultCompiler from '@vue/compiler-sfc'

export interface SFCFile {
  filename: string
  content: string
  compiled: {
    js: string
    css: string
    ssr: string
  }
}

export type SFCCompiler = typeof defaultCompiler

// import in sandbox
export const importVuePackage = createSinglePromise(async () => {
  const compilerUrl = PACKAGE_CDN(`@vue/compiler-sfc@next/dist/compiler-sfc.esm-browser.js`)
  const runtimeUrl = PACKAGE_CDN(`@vue/runtime-dom@next/dist/runtime-dom.esm-browser.js`)
  const [compiler] = await Promise.all([
    import(compilerUrl),
    import(runtimeUrl),
  ])
  console.info(`Now using Vue version: next`)
  return { compiler: compiler as SFCCompiler }
})

export const COMP_IDENTIFIER = '__sfc__'
export const MAIN_FILE = 'App.vue'
export const modulesKey = '__modules__'
export const exportKey = '__export__'
export const dynamicImportKey = '__dynamic_import__'
export const moduleKey = '__module__'
