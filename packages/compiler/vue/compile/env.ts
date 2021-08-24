import { PACKAGE_CDN, createSinglePromise } from '@ui-elements/utils'
import type * as VueCompiler from '@vue/compiler-sfc'
import type * as VueShared from '@vue/shared'

export interface SFCFile {
  filename: string
  content: string
  compiled: {
    js: string
    css: string
    ssr: string
  }
}

export type VueCompilerSFC = typeof VueCompiler
export type VueSharedPkg = typeof VueShared

// import in sandbox
export const importVuePackage = createSinglePromise(async () => {
  // @ts-ignore
  window.process = { env: {}}
  const compilerUrl = PACKAGE_CDN(`@vue/compiler-sfc@3.2.4/dist/compiler-sfc.esm-browser.js`)
  const sharedUrl = PACKAGE_CDN(`@vue/shared@3.2.4/dist/shared.esm-bundler.js`)
  const [compiler, shared] = await Promise.all([
    import(/* @vite-ignore */ compilerUrl),
    import(/* @vite-ignore */ sharedUrl),
  ])
  console.info(`Now using Vue version: 3.2.4`)
  return {
    compiler: compiler as VueCompilerSFC,
    shared: shared as VueSharedPkg
  }
})

export const COMP_IDENTIFIER = '__sfc__'
// use key in bootstrap
export const modulesKey = '__modules__'
export const exportKey = '__export__'
export const dynamicImportKey = '__dynamic_import__'
export const moduleKey = '__module__'
export const globalCSS = "window.__css__"
