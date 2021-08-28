import { LanguageModeCache, getLanguageModeCache } from '../../languageModeCache'
import type { TextDocument, Position, LanguageMode, Settings } from "../../types"
import { VueDocumentRegions, CSS_STYLE_RULE } from '../../embed'
// import * as emmet from "./emmetHelper"
import { getCSSLanguageService, Stylesheet } from 'vscode-css-languageservice'

export enum Priority {
	Emmet,
	Platform
}

export function getCSSMode(documentRegions: LanguageModeCache<VueDocumentRegions>): LanguageMode {
  let cssLanguageService = getCSSLanguageService()
	let embeddedCSSDocuments = getLanguageModeCache<TextDocument>(10, 60, document => documentRegions.get(document).getEmbeddedDocument('css'))
	let cssStylesheets = getLanguageModeCache<Stylesheet>(10, 60, document => cssLanguageService.parseStylesheet(document))
	return {
		getId() {
			return 'css'
		},
		configure(options: any) {
			cssLanguageService.configure(options && options.css)
		},
		doValidation(document: TextDocument, settings?: Settings) {
			let embedded = embeddedCSSDocuments.get(document)
			return cssLanguageService.doValidation(embedded, cssStylesheets.get(embedded), settings && settings.css)
		},
		doComplete(document: TextDocument, position: Position) {
			// let embedded = embeddedCSSDocuments.get(document)
			// const emmetSyntax = embedded.languageId === 'postcss' ? 'css' : embedded.languageId
			// const emmetCompletions = emmet.doComplete(document, position, emmetSyntax, {
			// 	showExpandedAbbreviation: 'always',
			// 	showAbbreviationSuggestions: true,
			// 	syntaxProfiles: {},
			// 	variables: {},
			// 	preferences: {}
			// })
			// const emmetItems = emmetCompletions.items.map(i => {
			// 	return {
			// 	  ...i,
			// 	  sortText: Priority.Emmet + i.label
			// 	}
			// })

			// const lsCompletions = cssLanguageService.doComplete(embedded, position, cssStylesheets.get(embedded))

			// const lsItems = lsCompletions ? lsCompletions.items.map(i => {
			// 	return {
			// 	  ...i,
			// 	  sortText: Priority.Platform + i.label
			// 	}
			//   }) : []

			return {
				isIncomplete: true,
				items: [] // emmetItems.concat(lsItems)
			}
		},
		doHover(document: TextDocument, position: Position) {
			let embedded = embeddedCSSDocuments.get(document)
			return cssLanguageService.doHover(embedded, position, cssStylesheets.get(embedded))
		},
		findDocumentHighlight(document: TextDocument, position: Position) {
			let embedded = embeddedCSSDocuments.get(document)
			return cssLanguageService.findDocumentHighlights(embedded, position, cssStylesheets.get(embedded))
		},
		findDocumentSymbols(document: TextDocument) {
			let embedded = embeddedCSSDocuments.get(document)
			return cssLanguageService.findDocumentSymbols(embedded, cssStylesheets.get(embedded)).filter(s => s.name !== CSS_STYLE_RULE)
		},
		findDefinition(document: TextDocument, position: Position) {
			let embedded = embeddedCSSDocuments.get(document)
			return cssLanguageService.findDefinition(embedded, position, cssStylesheets.get(embedded))
		},
		findReferences(document: TextDocument, position: Position) {
			let embedded = embeddedCSSDocuments.get(document)
			return cssLanguageService.findReferences(embedded, position, cssStylesheets.get(embedded))
		},
		onDocumentRemoved(document: TextDocument) {
			embeddedCSSDocuments.onDocumentRemoved(document)
			cssStylesheets.onDocumentRemoved(document)
		},
		dispose() {
			embeddedCSSDocuments.dispose()
			cssStylesheets.dispose()
		}
	}
}
