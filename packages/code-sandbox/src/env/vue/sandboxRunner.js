
import { createApp as _createApp } from "vue"

window.__modules__ = {};
window.__css__ = ""

if (window.__app__) {
  window.__app__.unmount()
  document.getElementById('app').innerHTML = ''
}
document.getElementById('__sfc-styles').innerHTML = window.__css__


const app = window.__app__ = _createApp(__modules__["${MAIN_FILE}"].default)
app.config.errorHandler = e => console.error(e)

// App enhancements
const mainFile = __modules__['main.js']

if (mainFile && mainFile.default) {
  if (mainFile.default.enhanceApp) {
    mainFile.default.enhanceApp(app)
  }
}

// if (__APP_ENHANCE__ && __APP_ENHANCE__.enhanceApp) {
//   __APP_ENHANCE__.enhanceApp(app)
// }

app.mount('#app')
