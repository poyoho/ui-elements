
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { VueHTMLWorker } from './vuehtmlWorker'

console.log("[vuehtml worker] load")

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx, createData) => {
    console.log("[vuehtml worker] init")
    return new VueHTMLWorker(ctx, createData)
  })
}
