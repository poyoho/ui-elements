
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { VueHTMLWorker } from './vuehtmlWorker'

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx, createData) => {
    console.log("VueHTMLWorker")
    return new VueHTMLWorker(ctx, createData)
  })
}
