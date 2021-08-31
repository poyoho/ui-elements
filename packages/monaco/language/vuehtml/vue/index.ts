import { CompletionItemKind } from 'vscode-html-languageservice'
import { Events } from './meta'
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
          {
            label: 'v-if',
            sortText: '0',
            kind: CompletionItemKind.Function,
            insertText: 'v-if=""',
          },
          ...Events.map(e => ({
            label: `@${e}`,
            insertText: `@${e}=""`,
            kind: CompletionItemKind.Event,
          })),
        ]
      }
    }

    return []
  },
}
