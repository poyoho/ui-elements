import { WorkerManager } from './workerManager'
import type { VueWorker } from './vueWorker'
import type { LanguageServiceDefaultsImpl } from './monaco.contribution'
import * as languageFeatures from './languageFeatures'
import { Uri, IDisposable, languages } from 'monaco-editor'

export function setupMode(defaults: LanguageServiceDefaultsImpl): IDisposable {
  const disposables: IDisposable[] = []
  const providers: IDisposable[] = []

  const client = new WorkerManager(defaults)
  disposables.push(client)

  const worker: languageFeatures.WorkerAccessor = (...uris: Uri[]): Promise<VueWorker> => {
    return client.getLanguageServiceWorker(...uris)
  }

  function registerProviders(): void {
    const { languageId, modeConfiguration } = defaults

    disposeAll(providers)

    if (modeConfiguration.completionItems) {
      providers.push(
        languages.registerCompletionItemProvider(
          languageId,
          new languageFeatures.CompletionAdapter(worker),
        ),
      )
    }
    if (modeConfiguration.hovers) {
      providers.push(
        languages.registerHoverProvider(languageId, new languageFeatures.HoverAdapter(worker)),
      )
    }
    if (modeConfiguration.documentHighlights) {
      providers.push(
        languages.registerDocumentHighlightProvider(
          languageId,
          new languageFeatures.DocumentHighlightAdapter(worker),
        ),
      )
    }
    if (modeConfiguration.links) {
      providers.push(
        languages.registerLinkProvider(languageId, new languageFeatures.DocumentLinkAdapter(worker)),
      )
    }
    if (modeConfiguration.documentSymbols) {
      providers.push(
        languages.registerDocumentSymbolProvider(
          languageId,
          new languageFeatures.DocumentSymbolAdapter(worker),
        ),
      )
    }
    if (modeConfiguration.rename) {
      providers.push(
        languages.registerRenameProvider(languageId, new languageFeatures.RenameAdapter(worker)),
      )
    }
    if (modeConfiguration.foldingRanges) {
      providers.push(
        languages.registerFoldingRangeProvider(
          languageId,
          new languageFeatures.FoldingRangeAdapter(worker),
        ),
      )
    }
    if (modeConfiguration.selectionRanges) {
      providers.push(
        languages.registerSelectionRangeProvider(
          languageId,
          new languageFeatures.SelectionRangeAdapter(worker),
        ),
      )
    }
    if (modeConfiguration.documentFormattingEdits) {
      providers.push(
        languages.registerDocumentFormattingEditProvider(
          languageId,
          new languageFeatures.DocumentFormattingEditProvider(worker),
        ),
      )
    }
    if (modeConfiguration.documentRangeFormattingEdits) {
      providers.push(
        languages.registerDocumentRangeFormattingEditProvider(
          languageId,
          new languageFeatures.DocumentRangeFormattingEditProvider(worker),
        ),
      )
    }
    if (modeConfiguration.diagnostics)
      providers.push(new languageFeatures.DiagnosticsAdapter(languageId, worker, defaults))
  }

  registerProviders()

  disposables.push(asDisposable(providers))

  return asDisposable(disposables)
}

function asDisposable(disposables: IDisposable[]): IDisposable {
  return { dispose: () => disposeAll(disposables) }
}

function disposeAll(disposables: IDisposable[]) {
  disposables.forEach(disposable => disposable.dispose())
}
