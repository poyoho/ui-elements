import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'

import { loadWASM } from 'onigasm'
import onigasm from "./token/onigasm.wasm?url"
import cssToken from "./token/css.tmGrammar.json?url"
import jsToken from "./token/JavaScript.tmLanguage.json?url"
import tsToken from "./token/TypeScript.tmLanguage.json?url"
import darkTheme from "./theme/dark_plus.json"
import lightTheme from "./theme/light_plus.json"

import type { editor } from 'monaco-editor'
export type monaco = typeof import("monaco-editor")

const loadOnigasm = loadWASM(onigasm) // See https://www.npmjs.com/package/onigasm#light-it-up

// anyscript fork from https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter/blob/master/lib/cjs/index.js
function convertTheme(theme: any): any {
  let monacoThemeRule: any[] = []
  let returnTheme = {
    inherit: true,
    base: 'vs-dark',
    colors: theme.colors,
    rules: monacoThemeRule,
    encodedTokensColors: []
  }
  theme.tokenColors.map(function (color: any) {
    if (typeof color.scope == 'string') {
      let split = color.scope.split(',')
      if (split.length > 1) {
        color.scope = split
        evalAsArray()
        return
      }
      monacoThemeRule.push(Object.assign({}, color.settings, {
        token: color.scope
      }))
      return
    }
    evalAsArray()
    function evalAsArray() {
      if (color.scope) {
        color.scope.map(function (scope: any) {
            monacoThemeRule.push(Object.assign({}, color.settings, {
              token: scope
            }))
        })
      }
    }
  })
  return returnTheme
}

// any editor need setup
export async function setupTheme (monaco: monaco, editor: editor.ICodeEditor) {
  await loadOnigasm
  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      console.log(scopeName)
      return ({
        "source.ts": {
          format: 'json',
          content: await (await fetch(tsToken)).text()
        },
        "source.js": {
          format: 'json',
          content: await (await fetch(jsToken)).text()
        },
        "source.css": {
          format: 'json',
          content: await (await fetch(cssToken)).text()
        },
      })[scopeName] as any
    }
  })

  // map of monaco "language id's" to TextMate scopeNames
  const grammars = new Map()
  grammars.set('css', 'source.css')
  grammars.set('typescript', 'source.ts')
  grammars.set('javascript', 'source.js')

  monaco.languages.register({id: 'css'})
  monaco.languages.register({id: 'typescript'})
  monaco.languages.register({id: 'javascript'})
  monaco.editor.defineTheme("dark", convertTheme(darkTheme))
  monaco.editor.defineTheme("light", convertTheme(lightTheme))
  await wireTmGrammars(monaco, registry, grammars, editor)
}
