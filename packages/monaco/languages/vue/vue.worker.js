import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { VueWorker } from './vueWorker'

console.log("load vue work")
self.onmessage = () => {
  console.log("init vue work")
  // ignore the first message
  worker.initialize((ctx, createData) => {
    return new VueWorker(ctx, createData)
  })
}
