import type {
  CompletionItem, Location, SignatureHelp, Definition, Diagnostic, DocumentLink,
	Hover, DocumentHighlight, CompletionList, FormattingOptions, SymbolInformation,
  SignatureInformation, ParameterInformation,
} from 'vscode-languageserver-types'
import {
  DiagnosticSeverity, TextEdit, MarkedString, DocumentHighlightKind, Range, Position, CompletionItemKind, SymbolKind, InsertTextFormat
} from 'vscode-languageserver-types'
import type { DocumentContext } from "vscode-html-languageservice"
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { worker } from "monaco-editor"

export {
  CompletionItem, Location, SignatureHelp, Definition, TextEdit, Diagnostic, DocumentLink, Range, InsertTextFormat,
	Hover, DocumentHighlight, CompletionList, Position, FormattingOptions, SymbolInformation, TextDocument,
  DocumentContext, SignatureInformation, ParameterInformation, DiagnosticSeverity, CompletionItemKind,
  MarkedString, DocumentHighlightKind, SymbolKind
}

export type IWorkerContext = worker.IWorkerContext

export interface Settings {
	css?: any;
	html?: any;
	javascript?: any;
}

export interface LanguageMode {
	getId: () => null | string;
	configure?: (options: Settings) => void;
	doValidation?: (document: TextDocument, settings?: Settings) => null | Diagnostic[];
	doComplete?: (document: TextDocument, position: Position, settings?: Settings) => null | CompletionList;
	doResolve?: (document: TextDocument, item: CompletionItem) => null | CompletionItem;
	doHover?: (document: TextDocument, position: Position) => null | Hover;
	doSignatureHelp?: (document: TextDocument, position: Position) => null | SignatureHelp;
	findDocumentHighlight?: (document: TextDocument, position: Position) => null | DocumentHighlight[];
	findDocumentSymbols?: (document: TextDocument) => null | SymbolInformation[];
	findDocumentLinks?: (document: TextDocument, documentContext: DocumentContext) => null | DocumentLink[];
	findDefinition?: (document: TextDocument, position: Position) => null | Definition;
	findReferences?: (document: TextDocument, position: Position) => null | Location[];
	format?: (document: TextDocument, range: Range, options: FormattingOptions, settings: Settings) => null | TextEdit[];
	// findDocumentColors?: (document: TextDocument) => null | ColorInformation[];
	doAutoClose?: (document: TextDocument, position: Position) => null | string;
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

export interface LanguageModes {
	getModeAtPosition(document: TextDocument, position: Position): LanguageMode;
	getModesInRange(document: TextDocument, range: Range): LanguageModeRange[];
	getAllModes(): LanguageMode[];
	getAllModesInDocument(document: TextDocument): LanguageMode[];
	getMode(languageId: string): LanguageMode;
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

export interface LanguageModeRange extends Range {
	mode: LanguageMode;
	attributeValue?: boolean;
}
