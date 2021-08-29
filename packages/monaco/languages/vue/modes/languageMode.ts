import type { IWorkerContext, LanguageMode, LanguageModeRange, LanguageModes, Range, TextDocument, Position} from "./types"
import { getDocumentRegions, VueDocumentRegions } from './embed'
import { getLanguageModeCache, LanguageModeCache } from './languageModeCache'

import { getCSSMode } from './mode/cssMode'
import { getHTMLMode } from './mode/htmlMode'
// import { getJavascriptMode } from './mode/javascriptMode'
import { getJSMode } from './mode/typescriptMode'
// import { getVueHTMLMode } from './embed/mode/vueHTMLMode'
import { getVueMode } from './mode/vueMode'


export function getLanguageModes(_ctx: IWorkerContext): LanguageModes {
  let documentRegions = getLanguageModeCache<VueDocumentRegions>(10, 60, document => getDocumentRegions(document))

  let modelCaches: LanguageModeCache<any>[] = []
  modelCaches.push(documentRegions)

  // const jsMode = getJavascriptMode(documentRegions, _ctx)
  const jsMode = getJSMode(documentRegions, _ctx)
  let modes: {[k: string]: LanguageMode} = {
    vue: getVueMode(),
    html: getHTMLMode(),
    // 'vue-html': getVueHTMLMode(documentRegions, _ctx, jsMode),
    css: getCSSMode(documentRegions),
    javascript: jsMode,
    typescript: jsMode,
    tsx: jsMode,
  }

  return {
    getModeAtPosition(document: TextDocument, position: Position): LanguageMode {
      let languageId = documentRegions.get(document).getLanguageAtPosition(position)
      if (languageId) {
        return modes[languageId]
      }
      return null as any
    },
    getModesInRange(document: TextDocument, range: Range | undefined): LanguageModeRange[] {
      if (!range) {
        return []
      }
      return documentRegions.get(document).getLanguageRanges(range).map(r => {
          return {
            start: r.start,
            end: r.end,
            mode: modes[r.languageId],
            attributeValue: r.attributeValue
          }
      })
    },
    getAllModesInDocument(document: TextDocument): LanguageMode[] {
      let result = []
      for (let languageId of documentRegions.get(document).getLanguagesInDocument()) {
        let mode = modes[languageId]
        if (mode) {
          result.push(mode)
        }
      }
      return result
    },
    getAllModes(): LanguageMode[] {
      let result = []
      for (let languageId in modes) {
        let mode = modes[languageId]
        if (mode) {
          result.push(mode)
        }
      }
      return result
    },
    getMode(languageId: string): LanguageMode {
      return modes[languageId]
    },
    onDocumentRemoved(document: TextDocument) {
      modelCaches.forEach(mc => mc.onDocumentRemoved(document))
      for (let mode in modes) {
        modes[mode].onDocumentRemoved(document)
      }
    },
    dispose(): void {
      modelCaches.forEach(mc => mc.dispose())
      modelCaches = []
      for (let mode in modes) {
        modes[mode].dispose()
      }
      modes = {}
    }
  }
}
