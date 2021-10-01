import{a as d}from"./index.5a742324.js";import{S as p}from"./index.22f7e480.js";let g=1;class m{constructor(e,n){this.iframe=e,this.handlers=n,this.pending_cmds=new Map,this.handle_event=o=>this.handle_repl_message(o),window.addEventListener("message",this.handle_event,!1)}destroy(){window.removeEventListener("message",this.handle_event)}iframe_command(e,n){return new Promise((o,r)=>{const t=g++;this.pending_cmds.set(t,{resolve:o,reject:r}),this.iframe.contentWindow.postMessage({action:e,cmd_id:t,args:n},"*")})}handle_command_message(e){const n=e.action,o=e.cmd_id,r=this.pending_cmds.get(o);if(r){if(this.pending_cmds.delete(o),n==="cmd_error"){const{message:t,stack:s}=e,a=new Error(t);a.stack=s,r.reject(a)}n==="cmd_ok"&&r.resolve(e.args)}else console.error("command not found",o,e,[...this.pending_cmds.keys()])}handle_repl_message(e){if(e.source!==this.iframe.contentWindow)return;const{action:n,args:o}=e.data;switch(n){case"cmd_error":case"cmd_ok":return this.handle_command_message(e.data);case"fetch_progress":return this.handlers.on_fetch_progress&&this.handlers.on_fetch_progress(o.remaining);case"error":return this.handlers.on_error&&this.handlers.on_error(e.data);case"unhandledrejection":return this.handlers.on_unhandled_rejection&&this.handlers.on_unhandled_rejection(e.data);case"console":return this.handlers.on_console&&this.handlers.on_console(e.data);case"console_group":return this.handlers.on_console_group&&this.handlers.on_console_group(e.data);case"console_group_collapsed":return this.handlers.on_console_group_collapsed&&this.handlers.on_console_group_collapsed(e.data);case"console_group_end":return this.handlers.on_console_group_end&&this.handlers.on_console_group_end(e.data)}}eval(e){return this.iframe_command("eval",{script:e})}handle_links(){return this.iframe_command("catch_clicks",{})}}var u=`<!doctype html>
<html>
<head>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: #1e1e1e;
    color: #e1e1e1;
  }
</style>
<style id="__sfc-styles"></style>
<!-- env -->
<script>
if (window.indexedDB) delete window.indexedDB
if (window.mozIndexedDB) delete window.mozIndexedDB
if (window.webkitIndexedDB) delete window.webkitIndexedDB
if (window.msIndexedDB) delete window.msIndexedDB
// window.indexedDB = window.mozIndexedDB = window.webkitIndexedDB = window.msIndexedDB
window.process = { env: {} }
<\/script>
<!-- mock log -->
<script>
  let previous = { level: null, args: null }

;['clear', 'log', 'info', 'dir', 'warn', 'error', 'table'].forEach((level) => {
  const original = console[level]
  console[level] = (...args) => {
    const msg = String(args[0])
    if (
      msg.includes('You are running a development build of Vue')
      || msg.includes('You are running the esm-bundler build of Vue')
    ) {
      return
    }

    const stringifiedArgs = stringify(args)
    if (previous.level === level && previous.args && previous.args === stringifiedArgs) {
      parent.postMessage({ action: 'console', level, duplicate: true }, '*')
    }
    else {
      previous = { level, args: stringifiedArgs }

      try {
        parent.postMessage({ action: 'console', level, args }, '*')
      }
      catch (err) {
        parent.postMessage({
          action: 'console',
          level,
          args: args.map((a) => {
            return a instanceof Error ? a.message : String(a)
          }),
        }, '*')
      }
    }

    original(...args)
  }
});

[
  { method: 'group', action: 'console_group' },
  { method: 'groupEnd', action: 'console_group_end' },
  { method: 'groupCollapsed', action: 'console_group_collapsed' },
].forEach((group_action) => {
  const original = console[group_action.method]
  console[group_action.method] = (label) => {
    parent.postMessage({ action: group_action.action, label }, '*')

    original(label)
  }
})

const timers = new Map()
const original_time = console.time
const original_timelog = console.timeLog
const original_timeend = console.timeEnd

console.time = (label = 'default') => {
  original_time(label)
  timers.set(label, performance.now())
}
console.timeLog = (label = 'default') => {
  original_timelog(label)
  const now = performance.now()
  if (timers.has(label))
    parent.postMessage({ action: 'console', level: 'system-log', args: [\`\${label}: \${now - timers.get(label)}ms\`] }, '*')
  else
    parent.postMessage({ action: 'console', level: 'system-warn', args: [\`Timer '\${label}' does not exist\`] }, '*')
}
console.timeEnd = (label = 'default') => {
  original_timeend(label)
  const now = performance.now()
  if (timers.has(label))
    parent.postMessage({ action: 'console', level: 'system-log', args: [\`\${label}: \${now - timers.get(label)}ms\`] }, '*')
  else
    parent.postMessage({ action: 'console', level: 'system-warn', args: [\`Timer '\${label}' does not exist\`] }, '*')

  timers.delete(label)
}

const original_assert = console.assert
console.assert = (condition, ...args) => {
  if (condition) {
    const stack = new Error().stack // eslint-disable-line unicorn/error-message
    parent.postMessage({ action: 'console', level: 'assert', args, stack }, '*')
  }
  original_assert(condition, ...args)
}

const counter = new Map()
const original_count = console.count
const original_countreset = console.countReset

console.count = (label = 'default') => {
  counter.set(label, (counter.get(label) || 0) + 1)
  parent.postMessage({ action: 'console', level: 'system-log', args: \`\${label}: \${counter.get(label)}\` }, '*')
  original_count(label)
}

console.countReset = (label = 'default') => {
  if (counter.has(label))
    counter.set(label, 0)
  else
    parent.postMessage({ action: 'console', level: 'system-warn', args: \`Count for '\${label}' does not exist\` }, '*')

  original_countreset(label)
}

const original_trace = console.trace

console.trace = (...args) => {
  const stack = new Error().stack // eslint-disable-line unicorn/error-message
  parent.postMessage({ action: 'console', level: 'trace', args, stack }, '*')
  original_trace(...args)
}

function stringify(args) {
  try {
    return JSON.stringify(args)
  }
  catch (error) {
    return null
  }
}
<\/script>
<!-- bridge -->
<script>
const scriptEls = []
async function handle_message(ev) {
  const { action, cmd_id } = ev.data
  const send_message = payload => parent.postMessage({ ...payload }, ev.origin)
  const send_reply = payload => send_message({ ...payload, cmd_id })
  const send_ok = () => send_reply({ action: 'cmd_ok' })
  const send_error = (message, stack) => send_reply({ action: 'cmd_error', message, stack })

  if (action === 'eval') {
    try {
      if (scriptEls.length) {
        scriptEls.forEach((el) => {
          document.head.removeChild(el)
        })
        scriptEls.length = 0
      }

      let { script: scripts } = ev.data.args
      if (typeof scripts === 'string') scripts = [scripts]

      for (const script of scripts) {
        const scriptEl = document.createElement('script')
        scriptEl.setAttribute('type', 'module')
        // send ok in the module script to ensure sequential evaluation
        // of multiple proxy.eval() calls
        const done = new Promise((resolve) => {
          window.__next__ = resolve
        })
        scriptEl.innerHTML = \`\${script}\\nif(window.__next__){window.__next__()}\`
        document.head.appendChild(scriptEl)
        scriptEl.onrror = err => send_error(err.message, err.stack)
        scriptEls.push(scriptEl)
        await done
      }
      window.__next__ = undefined
      send_ok()
    }
    catch (e) {
      send_error(e.message, e.stack)
    }
  } else if (action === 'catch_clicks') {
    try {
      const top_origin = ev.origin
      document.body.addEventListener('click', (event) => {
        if (event.which !== 1) return
        if (event.metaKey || event.ctrlKey || event.shiftKey) return
        if (event.defaultPrevented) return

        // ensure target is a link
        let el = event.target
        while (el && el.nodeName !== 'A') el = el.parentNode
        if (!el || el.nodeName !== 'A') return

        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external' || el.target) return

        event.preventDefault()

        if (el.href.startsWith(top_origin)) {
          const url = new URL(el.href)
          if (url.hash[0] === '#') {
            window.location.hash = url.hash
            return
          }
        }

        window.open(el.href, '_blank')
      })
      send_ok()
    }
    catch (e) {
      send_error(e.message, e.stack)
    }
  }
}

window.addEventListener('message', handle_message, false)

window.onerror = function(msg, url, lineNo, columnNo, error) {
  if (msg.includes('module specifier "vue"')) {
    // firefox only error, ignore
    return false
  }
  try {
    parent.postMessage({ action: 'error', value: error }, '*')
  }
  catch (e) {
    parent.postMessage({ action: 'error', value: msg }, '*')
  }
}

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason.message.includes('Cross-origin')) {
    event.preventDefault()
    return
  }
  try {
    parent.postMessage({ action: 'unhandledrejection', value: event.reason }, '*')
  }
  catch (e) {
    parent.postMessage({ action: 'unhandledrejection', value: event.reason.message }, '*')
  }
})
<\/script>
<!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
<script async src="https://unpkg.com/es-module-shims@0.10.1/dist/es-module-shims.js"><\/script>
<script type="importmap"><!-- IMPORT_MAP --><\/script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`;const h="<!-- IMPORT_MAP -->";class l extends HTMLElement{constructor(){super(...arguments);this.importMaps={imports:{}},this.proxy=d()}get sandbox(){return this.shadowRoot.querySelector("iframe")}async connectedCallback(){const e=this.ownerDocument.createElement("iframe");e.style.width="inherit",e.style.height="inherit",e.style.border="0",e.style.outline="0",e.setAttribute("sandbox",["allow-forms","allow-modals","allow-pointer-lock","allow-popups","allow-same-origin","allow-scripts","allow-top-navigation-by-user-activation"].join(" "));const n=(s,a)=>{const i=this.ownerDocument.createEvent("Events");i.initEvent(s,!1,!1),i.data=a,this.dispatchEvent(i)},o=new m(e,{on_fetch_progress:s=>n("on_fetch_progress",s),on_error:s=>n("on_error",s),on_unhandled_rejection:s=>n("on_unhandled_rejection",s),on_console:s=>n("on_console",s),on_console_group:s=>n("on_console_group",s),on_console_group_collapsed:s=>n("on_console_group_collapsed",s),on_console_group_end:s=>n("on_console_group_end",s)});e.addEventListener("load",()=>{o.handle_links(),this.proxy.resolve(o),console.log("[iframe-sandbox] sandbox load")});const r=this.attachShadow({mode:"open"}),t=this.ownerDocument.createElement("div");t.style.width="inherit",t.style.height="inherit",t.appendChild(e),r.appendChild(t)}disconnectedCallback(){}setupDependency(e){const{sandbox:n}=this;for(const o in e)this.importMaps.imports[o]||(this.importMaps.imports[o]=p(o,e[o]));n.srcdoc=u.replace(h,JSON.stringify(this.importMaps))}eval(e){this.proxy.promise.then(n=>{n.eval(e)})}}function w(){window.customElements.get("iframe-sandbox")||(window.IframeSandbox=l,window.customElements.define("iframe-sandbox",l))}export{w as i};
