import { createSinglePromise } from '@ui-elements/utils'
import { UNPKG_CDN } from '@ui-elements/unpkg'
import type * as VueCompiler from '@vue/compiler-sfc'

export interface SFCFile {
  filename: string
  content: string
  change: boolean
  compiled: {
    js: string
    css: string
    ssr: string
  }
}

export type VueCompilerSFC = typeof VueCompiler

// import in sandbox
export const importVuePackage = createSinglePromise(async () => {
  // @ts-ignore
  window.process = { env: {}}
  const compilerUrl = UNPKG_CDN(`@vue/compiler-sfc@3.2.4/dist/compiler-sfc.esm-browser.js`)
  const [compiler] = await Promise.all([
    import(/* @vite-ignore */ compilerUrl),
  ])
  console.info(`Now using Vue version: 3.2.4`)
  return {
    compiler: compiler as VueCompilerSFC,
  }
})

export const COMP_IDENTIFIER = '__sfc__'
