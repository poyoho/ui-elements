
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { VueHTMLWorker } from './vuehtmlWorker'

console.log("load VueHTMLWorker!!!")

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx, createData) => {
    console.log("init VueHTMLWorker!!!")
    return new VueHTMLWorker(ctx, createData)
  })
}
