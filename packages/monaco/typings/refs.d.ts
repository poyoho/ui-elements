/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/// <reference path='../../../node_modules/monaco-editor/monaco.d.ts'/>

// rollup packing it use monaco-editor all css

declare module "*?virtualMonacoCSS" {
  const style: string
  export default style
}
