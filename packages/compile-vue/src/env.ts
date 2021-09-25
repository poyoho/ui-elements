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

export const COMP_IDENTIFIER = '__sfc__'
