import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'

import { loadWASM } from 'onigasm'

const onigasm = new URL("./token/onigasm.wasm", import.meta.url)

import type { editor } from 'monaco-editor'
export type monaco = typeof import("monaco-editor")

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
  if (theme.include) {
    console.log(theme.include)
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
  await loadWASM(onigasm.href) // See https://www.npmjs.com/package/onigasm#light-it-up
  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      return ({
        "source.ts": {
          format: 'json',
          content: (await import("./token/TypeScript.tmLanguage.json")).default
        },
        "source.js": {
          format: 'json',
          content: (await import("./token/JavaScript.tmLanguage.json")).default
        },
        "source.css": {
          format: 'json',
          content: (await import("./token/css.tmGrammar.json")).default
        },
        "source.vuehtml": {
          format: 'json',
          content: (await import("./token/vuehtml.tmLanguage.json")).default
        },
      })[scopeName] as any
    }
  })

  // map of monaco "language id's" to TextMate scopeNames
  const grammars = new Map()
  grammars.set('css', 'source.css')
  grammars.set('typescript', 'source.ts')
  grammars.set('javascript', 'source.js')
  grammars.set('vuehtml', 'source.vuehtml')

  console.log(registry)
  const grammar = await registry.loadGrammar(grammars.get("vuehtml"));
  console.log(grammar)

  monaco.editor.defineTheme("vscode-dark", convertTheme((await import("./theme/dark_vs.json")).default))
  // monaco.editor.defineTheme("light", convertTheme((await import("./theme/light_plus.json")).default))
  await wireTmGrammars(monaco, registry, grammars, editor)
}
