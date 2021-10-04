/// <reference path='../../../node_modules/monaco-editor/monaco.d.ts'/>

// rollup packing it use monaco-editor all css
declare module "*?virtualMonacoCSS" {
  const style: string
  export default style
}
