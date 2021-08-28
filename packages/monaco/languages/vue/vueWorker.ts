import * as lt from 'vscode-html-languageservice'
import type { worker } from 'monaco-editor-core'
import type { Options } from './monaco.contribution'
import { LanguageModes } from './modes/types'
import { getLanguageModes } from './modes/languageMode'

export interface ICreateData {
  languageId: string
  languageSettings: Options
}

export class VueWorker {
  private _ctx: worker.IWorkerContext
  private _languageService: lt.LanguageService
  private _languageSettings: Options
  private _languageId: string
  private languageModes: LanguageModes;

  constructor(ctx: worker.IWorkerContext, createData: ICreateData) {
    this._ctx = ctx
    this._languageSettings = createData.languageSettings
    this._languageId = createData.languageId
    this._languageService = lt.getLanguageService()

    this.languageModes = getLanguageModes(this._ctx);
  }

  async doValidation(code: string): Promise<lt.Diagnostic[]> {
    // not yet suported
    return Promise.resolve([])
  }

  async doComplete(
    uri: string,
    position: lt.Position,
  ): Promise<lt.CompletionList> {
    const document = this._getTextDocument(uri)
    let mode = this.languageModes.getModeAtPosition(document, position);
    const modeResult = mode && mode.doComplete && mode.doComplete(document, position, {css: true,javascript:true})
    if (modeResult) {
      return Promise.resolve(modeResult)
    }
    return Promise.resolve({
      isIncomplete: true,
      items: [],
    })
  }

  async format(
    uri: string,
    range: lt.Range | undefined,
    options: lt.FormattingOptions,
  ): Promise<lt.TextEdit[]> {
    const document = this._getTextDocument(uri)
    const formattingOptions = { ...this._languageSettings.format, ...options }
    const textEdits = this._languageService.format(document, range, formattingOptions)
    return Promise.resolve(textEdits)
  }

  async doHover(uri: string, position: lt.Position): Promise<lt.Hover> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const hover = this._languageService.doHover(document, position, htmlDocument)
    return Promise.resolve(hover!)
  }

  async findDocumentHighlights(
    uri: string,
    position: lt.Position,
  ): Promise<lt.DocumentHighlight[]> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const highlights = this._languageService.findDocumentHighlights(document, position, htmlDocument)
    return Promise.resolve(highlights)
  }

  async findDocumentLinks(uri: string): Promise<lt.DocumentLink[]> {
    const document = this._getTextDocument(uri)
    const links = this._languageService.findDocumentLinks(document, null!)
    return Promise.resolve(links)
  }

  async findDocumentSymbols(uri: string): Promise<lt.SymbolInformation[]> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const symbols = this._languageService.findDocumentSymbols(document, htmlDocument)
    return Promise.resolve(symbols)
  }

  async getFoldingRanges(
    uri: string,
    context?: { rangeLimit?: number },
  ): Promise<lt.FoldingRange[]> {
    const document = this._getTextDocument(uri)
    const ranges = this._languageService.getFoldingRanges(document, context)
    return Promise.resolve(ranges)
  }

  async getSelectionRanges(
    uri: string,
    positions: lt.Position[],
  ): Promise<lt.SelectionRange[]> {
    const document = this._getTextDocument(uri)
    const ranges = this._languageService.getSelectionRanges(document, positions)
    return Promise.resolve(ranges)
  }

  async doRename(
    uri: string,
    position: lt.Position,
    newName: string,
  ): Promise<lt.WorkspaceEdit> {
    const document = this._getTextDocument(uri)
    const htmlDocument = this._languageService.parseHTMLDocument(document)
    const renames = this._languageService.doRename(document, position, newName, htmlDocument)
    return Promise.resolve(renames!)
  }

  private _getTextDocument(uri: string): lt.TextDocument {
    const models = this._ctx.getMirrorModels()
    for (const model of models) {
      if (model.uri.toString() === uri) {
        return lt.TextDocument.create(
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

export function create(ctx: worker.IWorkerContext, createData: ICreateData): VueWorker {
  return new VueWorker(ctx, createData)
}
