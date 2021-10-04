import type { CompletionItem, HTMLDocument, Position,TextDocument } from 'vscode-html-languageservice'

import { Directives,Events } from './meta'

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

    if (
      text.match(/(<\w+\s*)[^>]*$/) !== null &&
      (!text.match(/\S+(?=\s*=\s*["']?[^"']*$)/) || text.match(/<\w+\s+$/))
    ) {
      return [
        ...Directives,
        ...Events,
      ]
    }

    return []
  },
}
