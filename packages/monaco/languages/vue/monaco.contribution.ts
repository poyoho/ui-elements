import * as mode from './vueMode'
import type * as lt from 'vscode-html-languageservice'
import * as monaco from "monaco-editor"
import { language, conf } from './vueLanguage'

export interface LanguageServiceDefaults {
  readonly onDidChange: monaco.IEvent<LanguageServiceDefaults>;
  readonly options: Options;
  setOptions(options: Options): void;
}

export interface CompletionConfiguration {
  [provider: string]: boolean;
}

export interface Options {
  /**
   * A list of known schemas and/or associations of schemas to file names.
   */
  readonly suggest?: CompletionConfiguration;
  readonly format?: lt.HTMLFormatConfiguration
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
	private _onDidChange = new monaco.Emitter<LanguageServiceDefaults>();
	private _options!: Options;
  private _modeConfiguration!: ModeConfiguration
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


const vueOptionsDefault: Options = {
	suggest: { html5: true }
}

const vueLanguageId = 'vue'

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
    diagnostics: languageId === vueLanguageId, // turned off for Razor and Handlebar
    documentFormattingEdits: languageId === vueLanguageId, // turned off for Razor and Handlebar
    documentRangeFormattingEdits: languageId === vueLanguageId, // turned off for Razor and Handlebar
  }
}


export const vueDefaults = new LanguageServiceDefaultsImpl(
  vueLanguageId,
  vueOptionsDefault,
  getConfigurationDefault(vueLanguageId),
)

// export to the global based API
function createAPI() {
	return {
		vueDefaults: vueDefaults
	}
}
(monaco.languages as any).vue = createAPI();

// --- Registration to monaco editor ---

function getMode(): Promise<typeof mode> {
  return import('./vueMode')
}

monaco.languages.register({
	id: 'vue',
	extensions: ['.vue'],
	aliases: ['Vue', 'vuejs']
});

monaco.languages.setMonarchTokensProvider('vue', language);
monaco.languages.setLanguageConfiguration('vue', conf);

monaco.languages.onLanguage(vueLanguageId, () => {
  getMode().then(mode => mode.setupMode(vueDefaults))
})
