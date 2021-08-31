
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { VueHTMLWorker } from './vuehtmlWorker'

self.onmessage = () => {
  console.log("load vuehtml worker")
  // ignore the first message
  worker.initialize((ctx, createData) => {
    return new VueHTMLWorker(ctx, createData)
  })
}
