
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

app.mount('#app')

config.enhanceApp(app)
