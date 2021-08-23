import { CompiledFile, FileSystem } from "../../packages/utils"
import testvue from "./test.vue?raw"
import CodeSandbox from "../../packages/code-sandbox/src/code-sandbox"

const fs = new FileSystem<CompiledFile>()
const fstestvue = fs.writeFile(new CompiledFile({
  name: "test.vue",
  content: testvue
}))

fs.writeFile(new CompiledFile({
  name: "app.vue",
  content: `
  <template>
    <div class="app">
      app.vue
      <Test />
    </div>
  </template>
  <script>
  import { defineComponent } from "vue"
  import Test from "./test.vue"
  export default defineComponent({
    components: {Test},
  })
  </script>
  `
}))

const sandbox = document.querySelector("code-sandbox") as any as CodeSandbox
const vueCompile = await sandbox.setupCompiler("vue", fs)
await vueCompile.compileFile(fstestvue) // 每个vue文件都要编译
await vueCompile.execModules()
