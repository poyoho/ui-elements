import * as mode from './vuehtmlMode'
import { Emitter, languages } from "monaco-editor"

import vuehtml = monaco.languages.vuehtml

export interface LanguageServiceDefaults {
  readonly languageId: string
  readonly modeConfiguration: monaco.languages.vuehtml.ModeConfiguration
  readonly onDidChange: monaco.IEvent<LanguageServiceDefaults>
  readonly options: monaco.languages.vuehtml.Options
  setOptions(options: vuehtml.Options): void
}

// --- HTML configuration and defaults ---------

export class LanguageServiceDefaultsImpl implements LanguageServiceDefaults {
  private _onDidChange = new Emitter<LanguageServiceDefaults>()
  private _options: vuehtml.Options | undefined
  private _modeConfiguration: vuehtml.ModeConfiguration | undefined
  private _languageId: string

  constructor(languageId: string, options: vuehtml.Options, modeConfiguration: vuehtml.ModeConfiguration) {
    this._languageId = languageId
    this.setOptions(options)
    this.setModeConfiguration(modeConfiguration)
  }

  get onDidChange(): monaco.IEvent<LanguageServiceDefaults> {
    return this._onDidChange.event
  }

  get languageId(): string {
    return this._languageId
  }

  get options() {
    return this._options!
  }

  get modeConfiguration() {
    return this._modeConfiguration!
  }

  setOptions(options: vuehtml.Options): void {
    this._options = options || Object.create(null)
    this._onDidChange.fire(this)
  }

  setModeConfiguration(modeConfiguration: vuehtml.ModeConfiguration): void {
    this._modeConfiguration = modeConfiguration || Object.create(null)
    this._onDidChange.fire(this)
  }
}

const formatDefaults: Required<vuehtml.HTMLFormatConfiguration> = {
  tabSize: 2,
  insertSpaces: false,
  wrapLineLength: 120,
  unformatted: 'default": "a, abbr, acronym, b, bdo, big, br, button, cite, code, dfn, em, i, img, input, kbd, label, map, object, q, samp, select, small, span, strong, sub, sup, textarea, tt, var',
  contentUnformatted: 'pre',
  indentInnerHtml: false,
  preserveNewLines: true,
  maxPreserveNewLines: 1,
  indentHandlebars: false,
  endWithNewline: false,
  extraLiners: 'head, body, /html',
  wrapAttributes: 'auto',
}

const htmlOptionsDefault: Required<vuehtml.Options> = {
  format: formatDefaults,
  suggest: { html5: true },
}

function getConfigurationDefault(languageId: string): Required<vuehtml.ModeConfiguration> {
  return {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    links: true,
    documentHighlights: true,
    rename: true,
    colors: true,
    foldingRanges: true,
    selectionRanges: true,
    diagnostics: languageId === vuehtmlLanguageId, // turned off for Razor and Handlebar
    documentFormattingEdits: languageId === vuehtmlLanguageId, // turned off for Razor and Handlebar
    documentRangeFormattingEdits: languageId === vuehtmlLanguageId, // turned off for Razor and Handlebar
  }
}

const vuehtmlLanguageId = 'vuehtml'

export const vuehtmlDefaults = new LanguageServiceDefaultsImpl(
  vuehtmlLanguageId,
  htmlOptionsDefault,
  getConfigurationDefault(vuehtmlLanguageId),
)

// export to the global based API
function createAPI() {
	return {
		vuehtmlDefaults
	}
}

;(languages as any).vuehtml = createAPI()

// --- Registration to monaco editor ---

function getMode(): Promise<typeof mode> {
  return import('./vuehtmlMode')
}

languages.register({
	id: vuehtmlLanguageId,
	extensions: ['.vuehtml'],
  aliases: ["vuehtml", "vue-html"],
})

languages.onLanguage(vuehtmlLanguageId, () => {
  console.log("[setupMode]", vuehtmlLanguageId)
  getMode().then(mode => mode.setupMode(vuehtmlDefaults))
})
