import * as mode from './vuehtmlMode'
import { language, conf } from './vuehtmlLanguage'
import * as monaco from "monaco-editor"

export interface HTMLFormatConfiguration {
  readonly tabSize: number
  readonly insertSpaces: boolean
  readonly wrapLineLength: number
  readonly unformatted: string
  readonly contentUnformatted: string
  readonly indentInnerHtml: boolean
  readonly preserveNewLines: boolean
  readonly maxPreserveNewLines: number
  readonly indentHandlebars: boolean
  readonly endWithNewline: boolean
  readonly extraLiners: string
  readonly wrapAttributes: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline'
}

export interface CompletionConfiguration {
  [provider: string]: boolean
}

export interface Options {
/**
 * If set, comments are tolerated. If set to false, syntax errors will be emitted for comments.
 */
  readonly format?: HTMLFormatConfiguration
  /**
 * A list of known schemas and/or associations of schemas to file names.
 */
  readonly suggest?: CompletionConfiguration
}

export interface ModeConfiguration {
/**
 * Defines whether the built-in completionItemProvider is enabled.
 */
  readonly completionItems?: boolean

  /**
 * Defines whether the built-in hoverProvider is enabled.
 */
  readonly hovers?: boolean

  /**
 * Defines whether the built-in documentSymbolProvider is enabled.
 */
  readonly documentSymbols?: boolean

  /**
 * Defines whether the built-in definitions provider is enabled.
 */
  readonly links?: boolean

  /**
 * Defines whether the built-in references provider is enabled.
 */
  readonly documentHighlights?: boolean

  /**
 * Defines whether the built-in rename provider is enabled.
 */
  readonly rename?: boolean

  /**
 * Defines whether the built-in color provider is enabled.
 */
  readonly colors?: boolean

  /**
 * Defines whether the built-in foldingRange provider is enabled.
 */
  readonly foldingRanges?: boolean

  /**
 * Defines whether the built-in diagnostic provider is enabled.
 */
  readonly diagnostics?: boolean

  /**
 * Defines whether the built-in selection range provider is enabled.
 */
  readonly selectionRanges?: boolean

  /**
 * Defines whether the built-in documentFormattingEdit provider is enabled.
 */
  readonly documentFormattingEdits?: boolean

  /**
 * Defines whether the built-in documentRangeFormattingEdit provider is enabled.
 */
  readonly documentRangeFormattingEdits?: boolean
}

export interface LanguageServiceDefaults {
  readonly languageId: string
  readonly modeConfiguration: ModeConfiguration
  readonly onDidChange: monaco.IEvent<LanguageServiceDefaults>
  readonly options: Options
  setOptions(options: Options): void
}

// --- HTML configuration and defaults ---------

export class LanguageServiceDefaultsImpl implements LanguageServiceDefaults {
  private _onDidChange = new monaco.Emitter<LanguageServiceDefaults>()
  private _options: Options | undefined
  private _modeConfiguration: ModeConfiguration | undefined
  private _languageId: string

  constructor(languageId: string, options: Options, modeConfiguration: ModeConfiguration) {
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

  setOptions(options: Options): void {
    this._options = options || Object.create(null)
    this._onDidChange.fire(this)
  }

  setModeConfiguration(modeConfiguration: ModeConfiguration): void {
    this._modeConfiguration = modeConfiguration || Object.create(null)
    this._onDidChange.fire(this)
  }
}

const formatDefaults: Required<HTMLFormatConfiguration> = {
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

const htmlOptionsDefault: Required<Options> = {
  format: formatDefaults,
  suggest: { html5: true },
}

function getConfigurationDefault(languageId: string): Required<ModeConfiguration> {
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

export const vuehtmlDefaults: LanguageServiceDefaults = new LanguageServiceDefaultsImpl(
  vuehtmlLanguageId,
  htmlOptionsDefault,
  getConfigurationDefault(vuehtmlLanguageId),
)

// export to the global based API
;(<any>monaco.languages).vuehtml = { vuehtmlDefaults }

// --- Registration to monaco editor ---

function getMode(): Promise<typeof mode> {
  return import('./vuehtmlMode')
}

monaco.languages.register({
	id: vuehtmlLanguageId,
	extensions: ['.vuehtml'],
  aliases: ["vuehtml", "vue-html"],
})

monaco.languages.setMonarchTokensProvider(vuehtmlLanguageId, language)
monaco.languages.setLanguageConfiguration(vuehtmlLanguageId, conf)
monaco.languages.onLanguage(vuehtmlLanguageId, () => {
  getMode().then(mode => mode.setupMode(vuehtmlDefaults))
})
