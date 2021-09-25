interface AppUserConfig {
  enhanceApp: (app: import("vue").App) => void
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
