import type { IWorkerContext, LanguageMode, LanguageModeRange, LanguageModes } from "./embed/types"
import type { TextDocument } from "vscode-html-languageservice"
import type { Position } from "vscode-languageserver-types"

import { getDocumentRegions, VueDocumentRegions } from './embed/embed'
import { getLanguageModeCache, LanguageModelCache } from './embed/languageModeCache';

import { getCSSMode } from './embed/cssMode';
import { getJavascriptMode } from './embed/javascriptMode';
import { getHTMLMode } from './embed/htmlMode';

import { getVueHTMLMode } from './embed/vueHTMLMode';
import { getVueMode } from './embed/vueMode';


export function getLanguageModes(_ctx: IWorkerContext, supportedLanguages: { [languageId: string]: boolean; }): LanguageModes {
        let documentRegions = getLanguageModeCache<VueDocumentRegions>(10, 60, document => getDocumentRegions(document));

        let modelCaches: LanguageModelCache<any>[] = [];
        modelCaches.push(documentRegions);

		const jsMode = getJavascriptMode(documentRegions, _ctx);
		let modes: {[k: string]: LanguageMode} = {
		  vue: getVueMode(),
		  'vue-html': getVueHTMLMode(documentRegions, _ctx, jsMode),
		  css: getCSSMode(documentRegions),
		//   postcss: getPostCSSMode(documentRegions),
		//   scss: getSCSSMode(documentRegions),
		//   less: getLESSMode(documentRegions),
		//   stylus: getStylusMode(documentRegions),
		  javascript: jsMode,
		  tsx: jsMode,
		  typescript: jsMode
		};

        return {
            getModeAtPosition(document: TextDocument, position: Position): LanguageMode {
                let languageId = documentRegions.get(document).getLanguageAtPosition(position);
                if (languageId) {
                    return modes[languageId];
                }
                return null
            },
            getModesInRange(document: TextDocument, range: Range): LanguageModeRange[] {
                return documentRegions.get(document).getLanguageRanges(range).map(r => {
                    return {
                        start: r.start,
                        end: r.end,
                        mode: modes[r.languageId],
                        attributeValue: r.attributeValue
                    };
                });
            },
            getAllModesInDocument(document: TextDocument): LanguageMode[] {
                let result = [];
                for (let languageId of documentRegions.get(document).getLanguagesInDocument()) {
                    let mode = modes[languageId];
                    if (mode) {
                        result.push(mode);
                    }
                }
                return result;
            },
            getAllModes(): LanguageMode[] {
                let result = [];
                for (let languageId in modes) {
                    let mode = modes[languageId];
                    if (mode) {
                        result.push(mode);
                    }
                }
                return result;
            },
            getMode(languageId: string): LanguageMode {
                return modes[languageId];
            },
            onDocumentRemoved(document: TextDocument) {
                modelCaches.forEach(mc => mc.onDocumentRemoved(document));
                for (let mode in modes) {
                    modes[mode].onDocumentRemoved(document);
                }
            },
            dispose(): void {
                modelCaches.forEach(mc => mc.dispose());
                modelCaches = [];
                for (let mode in modes) {
                    modes[mode].dispose();
                }
                modes = {};
            }
        };
    }
