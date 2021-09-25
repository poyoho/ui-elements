import type { LanguageServiceDefaultsImpl } from './monaco.contribution'
import type { VueHTMLWorker } from './vuehtmlWorker'
type Uri = monaco.Uri
type IDisposable = monaco.IDisposable

const STOP_WHEN_IDLE_FOR = 2 * 60 * 1000 // 2min

export class WorkerManager {
  private _defaults: LanguageServiceDefaultsImpl
  private _idleCheckInterval: number
  private _lastUsedTime: number
  private _configChangeListener: IDisposable

  private _worker: monaco.editor.MonacoWebWorker<VueHTMLWorker> | null
  private _client: Promise<VueHTMLWorker> | undefined

  constructor(defaults: LanguageServiceDefaultsImpl) {
    this._defaults = defaults
    this._worker = null
    this._idleCheckInterval = window.setInterval(() => this._checkIfIdle(), 30 * 1000)
    this._lastUsedTime = 0
    this._configChangeListener = this._defaults.onDidChange(() => this._stopWorker())
  }

  private _stopWorker(): void {
    if (this._worker) {
      this._worker.dispose()
      this._worker = null
    }
    this._client = undefined
  }

  dispose(): void {
    clearInterval(this._idleCheckInterval)
    this._configChangeListener.dispose()
    this._stopWorker()
  }

  private _checkIfIdle(): void {
    if (!this._worker)
      return

    const timePassedSinceLastUsed = Date.now() - this._lastUsedTime
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR)
      this._stopWorker()
  }

  private _getClient(): Promise<VueHTMLWorker> {
    this._lastUsedTime = Date.now()

    if (!this._client) {
      this._worker = monaco.editor.createWebWorker<VueHTMLWorker>({
        moduleId: '', // never use it
        // passed in to the create() method
        createData: {
          languageSettings: this._defaults.options,
          languageId: this._defaults.languageId,
        },

        label: this._defaults.languageId,
      })
      this._client = <Promise<VueHTMLWorker>> this._worker.getProxy()
    }
    return this._client
  }

  getLanguageServiceWorker(...resources: Uri[]): Promise<VueHTMLWorker> {
    let _client: VueHTMLWorker
    return this._getClient()
      .then((client) => {
        _client = client
      })
      .then((_) => {
        return this._worker!.withSyncedResources(resources)
      })
      .then(_ => _client)
  }
}
