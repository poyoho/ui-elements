import{r as c,p as t}from"./index.22f7e480.js";import"./index.5a742324.js";import"./vendor.91e6cab1.js";import"./index.c880ee52.js";var d=`
import { createApp as _createApp } from "vue"

const App = __modules__["app.vue"].default
const config = __modules__["config.ts"].default

if (window.__app__) {
  window.__app__.unmount()
  document.getElementById('app').innerHTML = ''
}
document.getElementById('__sfc-styles').innerHTML = window.__css__

const app = window.__app__ = _createApp(App)
app.config.errorHandler = e => console.error(e)

await config.enhanceApp(app)

app.mount('#app')

`,s=`interface AppUserConfig {
  enhanceApp: (app: import("vue").App) => void
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
`;async function m(e){const r=await c("vue","3.2.6"),n=new Map,a=()=>["window.__modules__ = {};window.__css__ = ''",...Array.from(n.values()),d],o={entryFile:"app.vue",configFile:"config.ts",defaultConfigCode:["const config: AppUserConfig = {","  // init vue app","  enhanceApp (app) {}","}","export default config"].join(`
`),importMap:{vue:"3.2.6"},dts:r.concat([{filePath:"index.d.ts",content:s}]),reload(){const p=e.readFile(o.configFile),i=e.readFile(o.entryFile);return n.clear(),t(p,e,n),t(i,e,n),a()},update(p){return n.size?(n.delete(p),t(p,e,n),a()):o.reload()}};return o}export{m as createVueProject};
