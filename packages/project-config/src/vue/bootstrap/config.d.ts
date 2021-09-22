declare module "config.ts" {
  import { App } from "vue"
  interface Config {
    enhanceApp: (app: App) => void
  }
  export default Config
}
