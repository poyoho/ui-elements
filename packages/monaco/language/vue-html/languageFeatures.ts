import * as ls from 'vscode-html-languageservice'
import { DiagnosticSeverity } from "vscode-languageserver-types"
import { languages as Languages } from "monaco-editor"
import { InsertReplaceEdit } from 'vscode-html-languageservice'
import { LanguageServiceDefaults } from './monaco.contribution'
import type { HTMLWorker } from './htmlWorker'
import {
  languages,
  editor,
  Uri,
  Position,
  Range,
  CancellationToken,
  IDisposable,
  MarkerSeverity,
  IMarkdownString,
} from './fillers/monaco-editor-core'

type MonacoTextEdit = Languages.TextEdit

export type WorkerAccessor = (...uris: Uri[]) => Promise<HTMLWorker>
// --- diagnostics --- ---

export class DiagnosticsAdapter {
  private _disposables: IDisposable[] = []
  private _listener: { [uri: string]: IDisposable } = Object.create(null)

  constructor(
    private _languageId: string,
    private _worker: WorkerAccessor,
    defaults: LanguageServiceDefaults,
  ) {
    const onModelAdd = (model: editor.IModel): void => {
      const modeId = model.getModeId()
      if (modeId !== this._languageId)
        return

      let handle: number
      this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
        clearTimeout(handle)
        handle = window.setTimeout(() => this._doValidate(model.uri, modeId), 500)
      })

      this._doValidate(model.uri, modeId)
    }

    const onModelRemoved = (model: editor.IModel): void => {
      editor.setModelMarkers(model, this._languageId, [])
      const uriStr = model.uri.toString()
      const listener = this._listener[uriStr]
      if (listener) {
        listener.dispose()
        delete this._listener[uriStr]
      }
    }

    this._disposables.push(editor.onDidCreateModel(onModelAdd))
    this._disposables.push(
      editor.onWillDisposeModel((model) => {
        onModelRemoved(model)
      }),
    )
    this._disposables.push(
      editor.onDidChangeModelLanguage((event) => {
        onModelRemoved(event.model)
        onModelAdd(event.model)
      }),
    )

    this._disposables.push(
      defaults.onDidChange((_) => {
        editor.getModels().forEach((model) => {
          if (model.getModeId() === this._languageId) {
            onModelRemoved(model)
            onModelAdd(model)
          }
        })
      }),
    )

    this._disposables.push({
      dispose: () => {
        for (const key in this._listener)
          this._listener[key].dispose()
      },
    })

    editor.getModels().forEach(onModelAdd)
  }

  public dispose(): void {
    this._disposables.forEach(d => d && d.dispose())
    this._disposables = []
  }

  private _doValidate(resource: Uri, languageId: string): void {
    this._worker(resource)
      .then((worker) => {
        return worker.doValidation(resource.toString()).then((diagnostics) => {
          const markers = diagnostics.map(d => toDiagnostics(resource, d))
          const model = editor.getModel(resource)
          if (model && model.getModeId() === languageId)
            editor.setModelMarkers(model, languageId, markers)
        })
      })
      .then(undefined, (err) => {
        console.error(err)
      })
  }
}

function isInsertReplaceEdit(edit: ls.TextEdit | InsertReplaceEdit): edit is InsertReplaceEdit {
  return (
    typeof (<InsertReplaceEdit>edit).insert !== 'undefined'
  && typeof (<InsertReplaceEdit>edit).replace !== 'undefined'
  )
}

function toSeverity(lsSeverity?: number): MarkerSeverity {
  switch (lsSeverity) {
    case DiagnosticSeverity.Error:
      return MarkerSeverity.Error
    case DiagnosticSeverity.Warning:
      return MarkerSeverity.Warning
    case DiagnosticSeverity.Information:
      return MarkerSeverity.Info
    case DiagnosticSeverity.Hint:
      return MarkerSeverity.Hint
    default:
      return MarkerSeverity.Info
  }
}

function toDiagnostics(resource: Uri, diag: ls.Diagnostic): editor.IMarkerData {
  const code = typeof diag.code === 'number' ? String(diag.code) : <string>diag.code

  return {
    severity: toSeverity(diag.severity),
    startLineNumber: diag.range.start.line + 1,
    startColumn: diag.range.start.character + 1,
    endLineNumber: diag.range.end.line + 1,
    endColumn: diag.range.end.character + 1,
    message: diag.message,
    code,
    source: diag.source,
  }
}

// --- completion ------

function fromPosition(position: Position): ls.Position {
  return { character: position.column - 1, line: position.lineNumber - 1 }
}

function fromRange(range: Range): ls.Range {
  return {
    start: fromPosition(range.getStartPosition()),
    end: fromPosition(range.getEndPosition()),
  }
}

function toRange(range: ls.Range): Range {
  return new Range(
    range.start.line + 1,
    range.start.character + 1,
    range.end.line + 1,
    range.end.character + 1,
  )
}

function toTextEdit(textEdit: ls.TextEdit): MonacoTextEdit {
  return {
    range: toRange(textEdit.range),
    text: textEdit.newText,
  }
}

function toCompletionItemKind(kind?: number): languages.CompletionItemKind {
  const mItemKind = languages.CompletionItemKind

  switch (kind) {
    case ls.CompletionItemKind.Text:
      return mItemKind.Text
    case ls.CompletionItemKind.Method:
      return mItemKind.Method
    case ls.CompletionItemKind.Function:
      return mItemKind.Function
    case ls.CompletionItemKind.Constructor:
      return mItemKind.Constructor
    case ls.CompletionItemKind.Field:
      return mItemKind.Field
    case ls.CompletionItemKind.Variable:
      return mItemKind.Variable
    case ls.CompletionItemKind.Class:
      return mItemKind.Class
    case ls.CompletionItemKind.Interface:
      return mItemKind.Interface
    case ls.CompletionItemKind.Module:
      return mItemKind.Module
    case ls.CompletionItemKind.Property:
      return mItemKind.Property
    case ls.CompletionItemKind.Unit:
      return mItemKind.Unit
    case ls.CompletionItemKind.Value:
      return mItemKind.Value
    case ls.CompletionItemKind.Enum:
      return mItemKind.Enum
    case ls.CompletionItemKind.Keyword:
      return mItemKind.Keyword
    case ls.CompletionItemKind.Snippet:
      return mItemKind.Snippet
    case ls.CompletionItemKind.Color:
      return mItemKind.Color
    case ls.CompletionItemKind.File:
      return mItemKind.File
    case ls.CompletionItemKind.Reference:
      return mItemKind.Reference
  }
  return mItemKind.Property
}

function fromCompletionItemKind(
  kind: languages.CompletionItemKind,
): ls.CompletionItemKind {
  const mItemKind = languages.CompletionItemKind

  switch (kind) {
    case mItemKind.Text:
      return ls.CompletionItemKind.Text
    case mItemKind.Method:
      return ls.CompletionItemKind.Method
    case mItemKind.Function:
      return ls.CompletionItemKind.Function
    case mItemKind.Constructor:
      return ls.CompletionItemKind.Constructor
    case mItemKind.Field:
      return ls.CompletionItemKind.Field
    case mItemKind.Variable:
      return ls.CompletionItemKind.Variable
    case mItemKind.Class:
      return ls.CompletionItemKind.Class
    case mItemKind.Interface:
      return ls.CompletionItemKind.Interface
    case mItemKind.Module:
      return ls.CompletionItemKind.Module
    case mItemKind.Property:
      return ls.CompletionItemKind.Property
    case mItemKind.Unit:
      return ls.CompletionItemKind.Unit
    case mItemKind.Value:
      return ls.CompletionItemKind.Value
    case mItemKind.Enum:
      return ls.CompletionItemKind.Enum
    case mItemKind.Keyword:
      return ls.CompletionItemKind.Keyword
    case mItemKind.Snippet:
      return ls.CompletionItemKind.Snippet
    case mItemKind.Color:
      return ls.CompletionItemKind.Color
    case mItemKind.File:
      return ls.CompletionItemKind.File
    case mItemKind.Reference:
      return ls.CompletionItemKind.Reference
  }
  return ls.CompletionItemKind.Property
}

export class CompletionAdapter implements languages.CompletionItemProvider {
  constructor(private _worker: WorkerAccessor) {}

  public get triggerCharacters(): string[] {
    return ['.', ':', '<', '"', '=', '/', '@']
  }

  async provideCompletionItems(
    model: editor.IReadOnlyModel,
    position: Position,
    context: languages.CompletionContext,
    token: CancellationToken,
  ): Promise<languages.CompletionList> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const info = await worker.doComplete(resource.toString(), fromPosition(position))
    if (!info) {
      return { suggestions: [] }
    }
    const wordInfo = model.getWordUntilPosition(position)
    const wordRange = new Range(
      position.lineNumber,
      wordInfo.startColumn,
      position.lineNumber,
      wordInfo.endColumn
    )
    const items: languages.CompletionItem[] = info.items.map((entry) => {
      const item: languages.CompletionItem = {
        label: entry.label,
        insertText: entry.insertText || entry.label,
        sortText: entry.sortText,
        filterText: entry.filterText,
        documentation: entry.documentation,
        detail: entry.detail,
        range: wordRange,
        kind: toCompletionItemKind(entry.kind),
      }
      if (entry.textEdit) {
        if (isInsertReplaceEdit(entry.textEdit)) {
          item.range = {
            insert: toRange(entry.textEdit.insert),
            replace: toRange(entry.textEdit.replace),
          }
        }
        else {
          item.range = toRange(entry.textEdit.range)
        }
        item.insertText = entry.textEdit.newText
      }
      if (entry.additionalTextEdits)
        item.additionalTextEdits = entry.additionalTextEdits.map(toTextEdit)

      if (entry.insertTextFormat === ls.InsertTextFormat.Snippet)
        item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet

      return item
    })
    return {
      incomplete: info.isIncomplete,
      suggestions: items,
    }
  }
}

// --- hover ------

function isMarkupContent(thing: any): thing is ls.MarkupContent {
  return (
    thing
  && typeof thing === 'object'
  && typeof (<ls.MarkupContent>thing).kind === 'string'
  )
}

function toMarkdownString(
  entry: ls.MarkupContent | ls.MarkedString,
): IMarkdownString {
  if (typeof entry === 'string') {
    return {
      value: entry,
    }
  }
  if (isMarkupContent(entry)) {
    if (entry.kind === 'plaintext') {
      return {
        value: entry.value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&'),
      }
    }
    return {
      value: entry.value,
    }
  }

  return { value: `\`\`\`${entry.language}\n${entry.value}\n\`\`\`\n` }
}

function toMarkedStringArray(
  contents: ls.MarkupContent | ls.MarkedString | ls.MarkedString[],
): IMarkdownString[] {
  if (!contents) {
    return []
  }
  if (Array.isArray(contents))
    return contents.map(toMarkdownString)

  return [toMarkdownString(contents)]
}

export class HoverAdapter implements languages.HoverProvider {
  constructor(private _worker: WorkerAccessor) {}

  async provideHover(
    model: editor.IReadOnlyModel,
    position: Position,
    token: CancellationToken,
  ): Promise<languages.Hover> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const info = await worker.doHover(resource.toString(), fromPosition(position))
    if (!info) {
      return { contents: [] }
    }
    return <languages.Hover>{
      range: toRange(info.range!),
      contents: toMarkedStringArray(info.contents),
    }
  }
}

// --- document highlights ------

function toHighlighKind(kind?: ls.DocumentHighlightKind): languages.DocumentHighlightKind {
  const mKind = languages.DocumentHighlightKind

  switch (kind) {
    case ls.DocumentHighlightKind.Read:
      return mKind.Read
    case ls.DocumentHighlightKind.Write:
      return mKind.Write
    case ls.DocumentHighlightKind.Text:
      return mKind.Text
    default:
      return mKind.Text
  }
}

export class DocumentHighlightAdapter implements languages.DocumentHighlightProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideDocumentHighlights(
    model: editor.IReadOnlyModel,
    position: Position,
    token: CancellationToken,
  ): Promise<languages.DocumentHighlight[]> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const items = await worker.findDocumentHighlights(resource.toString(), fromPosition(position))
    if (!items) {
      return []
    }
    return items.map(item => ({
      range: toRange(item.range),
      kind: toHighlighKind(item.kind),
    }))
  }
}

// --- document symbols ------

function toSymbolKind(kind: ls.SymbolKind): languages.SymbolKind {
  const mKind = languages.SymbolKind

  switch (kind) {
    case ls.SymbolKind.File:
      return mKind.Array
    case ls.SymbolKind.Module:
      return mKind.Module
    case ls.SymbolKind.Namespace:
      return mKind.Namespace
    case ls.SymbolKind.Package:
      return mKind.Package
    case ls.SymbolKind.Class:
      return mKind.Class
    case ls.SymbolKind.Method:
      return mKind.Method
    case ls.SymbolKind.Property:
      return mKind.Property
    case ls.SymbolKind.Field:
      return mKind.Field
    case ls.SymbolKind.Constructor:
      return mKind.Constructor
    case ls.SymbolKind.Enum:
      return mKind.Enum
    case ls.SymbolKind.Interface:
      return mKind.Interface
    case ls.SymbolKind.Function:
      return mKind.Function
    case ls.SymbolKind.Variable:
      return mKind.Variable
    case ls.SymbolKind.Constant:
      return mKind.Constant
    case ls.SymbolKind.String:
      return mKind.String
    case ls.SymbolKind.Number:
      return mKind.Number
    case ls.SymbolKind.Boolean:
      return mKind.Boolean
    case ls.SymbolKind.Array:
      return mKind.Array
  }
  return mKind.Function
}

export class DocumentSymbolAdapter implements languages.DocumentSymbolProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideDocumentSymbols(
    model: editor.IReadOnlyModel,
    token: CancellationToken,
  ): Promise<languages.DocumentSymbol[]> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const items = await worker.findDocumentSymbols(resource.toString())
    if (!items) {
      return []
    }
    return items.map(item => ({
      name: item.name,
      detail: '',
      containerName: item.containerName,
      kind: toSymbolKind(item.kind),
      tags: [],
      range: toRange(item.location.range),
      selectionRange: toRange(item.location.range),
    }))
  }
}

export class DocumentLinkAdapter implements languages.LinkProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideLinks(
    model: editor.IReadOnlyModel,
    token: CancellationToken,
  ): Promise<languages.ILinksList> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const items = await worker.findDocumentLinks(resource.toString())
    if (!items) {
      return { links: [] }
    }
    return {
      links: items.map(item => ({
        range: toRange(item.range),
        url: item.target,
      })),
    }
  }
}

function fromFormattingOptions(
  options: languages.FormattingOptions,
): ls.FormattingOptions {
  return {
    tabSize: options.tabSize,
    insertSpaces: options.insertSpaces,
  }
}

export class DocumentFormattingEditProvider implements languages.DocumentFormattingEditProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideDocumentFormattingEdits(
    model: editor.IReadOnlyModel,
    options: languages.FormattingOptions,
    token: CancellationToken,
  ): Promise<MonacoTextEdit[]> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const edits = await worker.format(resource.toString(), undefined, fromFormattingOptions(options))
    if (!edits || edits.length === 0) {
      return []
    }
    return edits.map(toTextEdit)
  }
}

export class DocumentRangeFormattingEditProvider
implements languages.DocumentRangeFormattingEditProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideDocumentRangeFormattingEdits(
    model: editor.IReadOnlyModel,
    range: Range,
    options: languages.FormattingOptions,
    token: CancellationToken,
  ): Promise<MonacoTextEdit[]> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const edits = await worker
      .format(resource.toString(), fromRange(range), fromFormattingOptions(options))
    if (!edits || edits.length === 0) {
      return []
    }
    return edits.map(toTextEdit)
  }
}

export class RenameAdapter implements languages.RenameProvider {
  constructor(private _worker: WorkerAccessor) {}

  async provideRenameEdits(
    model: editor.IReadOnlyModel,
    position: Position,
    newName: string,
    token: CancellationToken,
  ): Promise<languages.WorkspaceEdit> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const edit = await worker.doRename(resource.toString(), fromPosition(position), newName)
    return toWorkspaceEdit(edit)
  }
}

function toWorkspaceEdit(edit: ls.WorkspaceEdit): languages.WorkspaceEdit {
  if (!edit || !edit.changes) {
    return { edits: [] }
  }

  const resourceEdits: languages.WorkspaceTextEdit[] = []
  for (const uri in edit.changes) {
    const _uri = Uri.parse(uri)
    for (const e of edit.changes[uri]) {
      resourceEdits.push({
        resource: _uri,
        edit: {
          range: toRange(e.range),
          text: e.newText,
        },
      })
    }
  }
  return {
    edits: resourceEdits,
  }
}

export class FoldingRangeAdapter implements languages.FoldingRangeProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideFoldingRanges(
    model: editor.IReadOnlyModel,
    context: languages.FoldingContext,
    token: CancellationToken,
  ): Promise<languages.FoldingRange[]> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const ranges = await worker.getFoldingRanges(resource.toString(), context)
    if (!ranges) {
      return []
    }
    return ranges.map((range) => {
      const result: languages.FoldingRange = {
        start: range.startLine + 1,
        end: range.endLine + 1,
      }
      if (typeof range.kind !== 'undefined')
        result.kind = toFoldingRangeKind(<ls.FoldingRangeKind>range.kind)

      return result
    })
  }
}

function toFoldingRangeKind(kind: ls.FoldingRangeKind): languages.FoldingRangeKind {
  switch (kind) {
    case ls.FoldingRangeKind.Comment:
      return languages.FoldingRangeKind.Comment
    case ls.FoldingRangeKind.Imports:
      return languages.FoldingRangeKind.Imports
    case ls.FoldingRangeKind.Region:
      return languages.FoldingRangeKind.Region
  }
}

export class SelectionRangeAdapter implements languages.SelectionRangeProvider {
  constructor(private _worker: WorkerAccessor) {}

  public async provideSelectionRanges(
    model: editor.IReadOnlyModel,
    positions: Position[],
    token: CancellationToken,
  ): Promise<languages.SelectionRange[][]> {
    const resource = model.uri

    const worker = await this._worker(resource)
    const selectionRanges = await worker.getSelectionRanges(resource.toString(), positions.map(fromPosition))
    if (!selectionRanges) {
      return []
    }
    return selectionRanges.map((selectionRange) => {
      const result: languages.SelectionRange[] = []
      while (selectionRange) {
        result.push({ range: toRange(selectionRange.range) })
        selectionRange = selectionRange.parent!
      }
      return result
    })
  }
}
