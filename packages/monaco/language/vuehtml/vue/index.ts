import { Events, Directives } from './meta'
import type { CompletionItem, TextDocument, HTMLDocument, Position } from 'vscode-html-languageservice'

export interface HTMLPluginCompletion {
  position: Position
  document: TextDocument
  html: HTMLDocument
}

export const vueHTMLPlugin = {
  completions({ document, position }: HTMLPluginCompletion): CompletionItem[] {
    const text = document.getText({
      start: { line: 0, character: 0 },
      end: position,
    })

    if (text.match(/(<\w+\s*)[^>]*$/) !== null) {
      if (!text.match(/\S+(?=\s*=\s*["']?[^"']*$)/) || text.match(/<\w+\s+$/)) {
        return [
          ...Directives,
          ...Events,
        ]
      }
    }

    return []
  },
}
