
import { createApp as _createApp } from "vue"

if (window.__app__) {
  window.__app__.unmount()
  document.getElementById('app').innerHTML = ''
}
document.getElementById('__sfc-styles').innerHTML = window.__css__


const app = window.__app__ = _createApp(__modules__["app.vue"].default)
app.config.errorHandler = e => console.error(e)

// App enhancements
const mainFile = __modules__['main.js']

if (mainFile && mainFile.default) {
  if (mainFile.default.enhanceApp) {
    mainFile.default.enhanceApp(app)
  }
}

app.mount('#app')
