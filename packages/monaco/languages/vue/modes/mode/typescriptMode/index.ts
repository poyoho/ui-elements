import { LanguageModeCache, getLanguageModeCache } from '../../languageModeCache'
import { VueDocumentRegions } from '../../embed'
import {
  LanguageMode, Settings,
  IWorkerContext, DocumentContext, DocumentLink,
  SymbolInformation, CompletionItem, Location, SignatureHelp,
  Definition, TextEdit, TextDocument, Diagnostic, Range,
  Hover, DocumentHighlight, CompletionList, Position, FormattingOptions
} from '../../types'

export function getJSMode (documentRegions: LanguageModeCache<VueDocumentRegions>, ctx?: IWorkerContext): LanguageMode {
	let jsDocuments = getLanguageModeCache<TextDocument>(10, 60, document => documentRegions.get(document).getEmbeddedDocument('typescript'))
  // const model = editor.createModel("", "typescript", Uri.parse("file://vue.ts"))
  // const tsWorker = languages.typescript.getTypeScriptWorker() // .then(constructor => constructor(model.uri))
  // const fileName = tsWorker // .then(worker => model.uri.toString())

  const updateCurrentTextDocument = (doc: TextDocument) => {
  }

  return {
    getId: () => "javascript",
    configure: (options: Settings): void => {

    },
    doValidation: (document: TextDocument, settings?: Settings): null | Diagnostic[] => {
      return null
    },
    doComplete: (document: TextDocument, position: Position, settings?: Settings): null | CompletionList => {
      updateCurrentTextDocument(document)
			// const offset = currentTextDocument.offsetAt(position)
      // tsWorker.getCompletionsAtPosition(fileName, offset)
      return null
    },
    doResolve: (document: TextDocument, item: CompletionItem): null | CompletionItem => {
      return null
    },
    doHover: (document: TextDocument, position: Position): null | Hover => {
      return null
    },
    doSignatureHelp: (document: TextDocument, position: Position): null | SignatureHelp => {
      return null
    },
    findDocumentHighlight: (document: TextDocument, position: Position): null | DocumentHighlight[] => {
      return null
    },
    findDocumentSymbols: (document: TextDocument): null | SymbolInformation[] => {
      return null
    },
    findDocumentLinks: (document: TextDocument, documentContext: DocumentContext): null | DocumentLink[] => {
      return null
    },
    findDefinition: (document: TextDocument, position: Position): null | Definition => {
      return null
    },
    findReferences: (document: TextDocument, position: Position): null | Location[] => {
      return null
    },
    format: (document: TextDocument, range: Range, options: FormattingOptions, settings: Settings): null | TextEdit[] => {
      return null
    },
    doAutoClose: (document: TextDocument, position: Position): null | string => {
      return null
    },
    onDocumentRemoved: (document: TextDocument): void => {
    },
    dispose: (): void => {
    },
  }
}
