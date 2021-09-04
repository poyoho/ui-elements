import * as ls from 'vscode-html-languageservice'
import type { worker } from "monaco-editor"
import type { Options } from './monaco.contribution'
import { vueHTMLPlugin } from './vue'

export interface ICreateData {
  languageId: string
  languageSettings: Options
}

export class VueHTMLWorker {
  private _ctx: worker.IWorkerContext
  private _languageService: ls.LanguageService
  private _languageSettings: Options
  private _languageId: string

  constructor(ctx: worker.IWorkerContext, createData: ICreateData) {
    console.log("[vuehtml worker] create vuehtml worker")
    this._ctx = ctx
    this._languageSettings = createData.languageSettings
    this._languageId = createData.languageId
    this._languageService = ls.getLanguageService()
  }

  async doValidation(code: string): Promise<ls.Diagnostic[]> {
    // not yet suported
    return Promise.resolve([])
  }

  async doComplete(
    uri: string,
    position: ls.Position,
  ): Promise<ls.CompletionList> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const items = vueHTMLPlugin.completions({ document, html: htmlDocument, position }).flat()
    const completions = this._languageService.doComplete(
      document,
      position,
      htmlDocument,
      this._languageSettings && this._languageSettings.suggest,
    )

    return Promise.resolve({
      isIncomplete: true,
      items: [
        ...completions.items,
        ...items,
      ],
    })
  }

  async format(
    uri: string,
    range: ls.Range | undefined,
    options: ls.FormattingOptions,
  ): Promise<ls.TextEdit[]> {
    const document = this._getTextDocument(uri)
    const formattingOptions = { ...this._languageSettings.format, ...options }
    const textEdits = this._languageService.format(document, range, formattingOptions)
    return Promise.resolve(textEdits)
  }

  async doHover(uri: string, position: ls.Position): Promise<ls.Hover> {
    console.log("doHover")
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const hover = this._languageService.doHover(document, position, htmlDocument)
    return Promise.resolve(hover!)
  }

  async findDocumentHighlights(
    uri: string,
    position: ls.Position,
  ): Promise<ls.DocumentHighlight[]> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const highlights = this._languageService.findDocumentHighlights(document, position, htmlDocument)
    return Promise.resolve(highlights)
  }

  async findDocumentLinks(uri: string): Promise<ls.DocumentLink[]> {
    const document = this._getTextDocument(uri)
    const links = this._languageService.findDocumentLinks(document, null!)
    return Promise.resolve(links)
  }

  async findDocumentSymbols(uri: string): Promise<ls.SymbolInformation[]> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const symbols = this._languageService.findDocumentSymbols(document, htmlDocument)
    return Promise.resolve(symbols)
  }

  async getFoldingRanges(
    uri: string,
    context?: { rangeLimit?: number },
  ): Promise<ls.FoldingRange[]> {
    const document = this._getTextDocument(uri)
    const ranges = this._languageService.getFoldingRanges(document, context)
    return Promise.resolve(ranges)
  }

  async getSelectionRanges(
    uri: string,
    positions: ls.Position[],
  ): Promise<ls.SelectionRange[]> {
    const document = this._getTextDocument(uri)
    const ranges = this._languageService.getSelectionRanges(document, positions)
    return Promise.resolve(ranges)
  }

  async doRename(
    uri: string,
    position: ls.Position,
    newName: string,
  ): Promise<ls.WorkspaceEdit> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const renames = this._languageService.doRename(document, position, newName, htmlDocument)
    return Promise.resolve(renames!)
  }

  private _getTextDocument(uri: string): ls.TextDocument {
    const models = this._ctx.getMirrorModels()
    for (const model of models) {
      if (model.uri.toString() === uri) {
        return ls.TextDocument.create(
          uri,
          this._languageId,
          model.version,
          model.getValue(),
        )
      }
    }
    return null!
  }
}

export function create (ctx: worker.IWorkerContext, createData: ICreateData): VueHTMLWorker {
  console.log("create vuehtml worker")
  return new VueHTMLWorker(ctx, createData)
}
