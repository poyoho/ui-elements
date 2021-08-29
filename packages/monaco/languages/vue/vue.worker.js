import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { VueWorker } from './vueWorker'

console.log("load vue work")
self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx, createData) => {
    console.log("init vue work", ctx, createData)
    const useOtherWorker = {
      // tsWorker:
    }
    return new VueWorker(ctx, createData)
  })
}
