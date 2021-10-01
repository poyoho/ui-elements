import"./modulepreload-polyfill.b7f2da20.js";import{_ as g}from"./preload-helper.42c689d6.js";import{E,g as f,d as h,c as w}from"./index.5a742324.js";import{install as x,MonacoEditor as _}from"./index.bd12afac.js";import{i as M,r as k,S as L}from"./index.22f7e480.js";import{i as C}from"./index.c34d6cb1.js";import{i as j}from"./index.95e73ed5.js";import"./vendor.91e6cab1.js";import"./index.c880ee52.js";class F extends E{constructor(){super(...arguments);this.files={}}isExist(t){return this.files[t]!==void 0}readFile(t){return this.files[t]}writeFile(t,e){return t.content=e,t.change=!0,this.files[t.filename]=t,this.emit("update",t),t}removeFile(t){delete this.files[t],this.emit("delete",t)}clear(){this.files={}}}class A{constructor(t){this.filename=t,this.type="base",this.content="",this.change=!0}}class S extends A{constructor(){super(...arguments);this.compiled={js:"",ssr:"",css:""}}}var P=`
<div class="control-bar">
  <unpkg-manage></unpkg-manage>
</div>
<drag-wrap direction="row" id="editor">
  <div slot="item">
    <div id="tab">

      <input type="text" id="filename-input" />
      <svg t="1631454598719" class="icon-add" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2150" width="14" height="14"><path d="M512 170.666667a42.666667 42.666667 0 0 1 42.666667 42.666666v256h256a42.666667 42.666667 0 1 1 0 85.333334h-256v256a42.666667 42.666667 0 1 1-85.333334 0v-256H213.333333a42.666667 42.666667 0 1 1 0-85.333334h256V213.333333a42.666667 42.666667 0 0 1 42.666667-42.666666z" fill="#e1e1e1" p-id="2151"></path></svg>
    </div>
    <drag-wrap direction="column" id="editor-wrap">
      <div slot="item" id="spacehold" hidden></div>
      <slot name="editor">

      </slot>
    </drag-wrap>
  </div>

  <div slot="item">
    <iframe-sandbox id="sandbox"/>
  </div>
</drag-wrap>
<style>
  .control-bar {
    width: 36px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
  #editor {
    flex: 1;
    height: 100%;
    margin: auto 0;
  }
  #sandbox {
    width: 100%;
    height: 100%;
  }
  #editor [slot="item"] {
    height: 100%;
  }
  #editor-wrap {
    width: 100%;
    height: calc(100% - 25px);
    background: #1e1e1e;
  }
  @keyframes input-error {
    to {
      transform: scale(.92);
    }
  }
  .filename-input-error {
    animation: input-error .1s linear 4 alternate;
  }
  .filename-input-show {
    margin-left: 5px;
    width: 80px !important;
    opacity: 1 !important;
    transition: width .1s;
  }
  #filename-input {
    opacity: 0;
    width: 0px;
    color: #e1e1e1;
    background: #1e1e1e;
    outline: 0;
    border: 1px solid #333;
    transition: width .1s;
  }
  #tab button {
    font-size: 13px;
    border: 0;
    outline: 0;
    border-radius: 0;
    background: #666;
    color: #e1e1e1;
    padding: 5px;
    padding-right: 8px;
  }
  #tab button[closeable] {
    padding-right: 20px;
  }
  #spacehold {
    background: #1e1e1e;
  }
  #tab {
    background: #1e1e1e;
  }
  #tab button .icon-close {
    position: absolute;
    transform: translate(3px, 1px);
  }
  #tab button[active] {
    color: #e1e1e1;
    background: #333;
  }
  #tab .icon-add {
    transform: translateY(3px)
  }
</style>
`;function T(n){const t={},e={get:o=>t[o],active:o=>{const{editorWrap:i}=n;e.hideAll();const s=o.map(d=>{let a=t[d];if(!a){const c=new _;c.style.width="100%",c.style.height="100%";const r=n.ownerDocument.createElement("div");r.style.width="100%",r.style.height="100%",r.setAttribute("slot","item"),r.setAttribute("type",d),r.appendChild(c),a={wrap:r,editor:c,status:!1},t[d]=a,i.appendChild(a.wrap)}return a.status||(a.status=!0,a.wrap.style.display="block",a.wrap.removeAttribute("hidden")),a});return i.updateItems(),s},getActive:()=>{const o=[];for(let i in t){const s=t[i];s.status&&o.push(s)}return o},hide:o=>{const i=t[o];i&&i.status&&(i.status=!1,i.wrap.style.display="none",i.wrap.setAttribute("hidden",""))},hideAll:()=>{const{editorWrap:o}=n;o.items.forEach(i=>{const s=i.getAttribute("type");s&&e.hide(s)})}};return e}async function m(n,t,e,o,i){let s;return i?s=await n.createModel(t,e,o):s=await n.findModel(e),s}function b(n,t,e,o){let i;return o?i=n.writeFile(new S(t),e):i=n.readFile(t),i}async function D(n,t,e,o){const i=!t.isExist(e);if(e.endsWith(".vue")){const[s,d]=n.active(["vuehtml","ts"]),a=await m(s.editor,"vuehtml",e+".vuehtml",o.vuehtml||"",i);s.editor.setModel(a);const c=await m(d.editor,"ts",e+".ts",o.ts||"",i);if(d.editor.setModel(c),i){const r={html:a.getValue(),ts:c.getValue()},l=()=>[r.html,"<script>",r.ts,"<\/script>"].join(`
`),u=b(t,e,l(),i);a.onDidChangeContent(h(()=>{r.html=a.getValue(),t.writeFile(u,l())})),c.onDidChangeContent(h(async()=>{r.ts=c.getValue(),t.writeFile(u,l())}))}}else if(e.endsWith(".ts")){const[s]=n.active(["ts"]),d=await m(s.editor,"ts",e,o.ts||"",i);if(s.editor.setModel(d),i){const a=b(t,e,o.ts||"",i);d.onDidChangeContent(h(async()=>{t.writeFile(a,d.getValue())}))}}else throw`don't support create ${e}, only support create *.vue/*.ts.`}function R(n){n.getActive().forEach(async e=>{e.editor.removeModel()})}const V=w(()=>g(()=>import("./index.e9c7f188.js"),[])),B=w(()=>g(()=>import("./index.bd12afac.js"),["assets/index.bd12afac.js","assets/preload-helper.42c689d6.js","assets/index.5a742324.js","assets/vendor.91e6cab1.js","assets/vendor.0e80a834.css"]));async function W(n){if(!!n.change){if(n.change=!1,n.filename.endsWith(".vue"))await(await V()).compileVueSFCFile(n);else if(n.filename.endsWith(".ts")){const t=await(await B()).getRunnableJS(n.filename);n.compiled.js=t}}}async function I(n,t){switch(n){case"vue":return(await g(()=>import("./vue-5be6dee0.9338f506.js"),["assets/vue-5be6dee0.9338f506.js","assets/index.22f7e480.js","assets/index.5a742324.js","assets/vendor.91e6cab1.js","assets/vendor.0e80a834.css","assets/index.c880ee52.js"])).createVueProject(t)}}function q(n){const{sandbox:t}=n;t.addEventListener("on_fetch_progress",e=>{console.log("[vueplayground] on_fetch_progress",e.data)}),t.addEventListener("on_error",e=>{console.log("[vueplayground] on_error",e.data)}),t.addEventListener("on_unhandled_rejection",e=>{console.log("[vueplayground] on_unhandled_rejection",e.data)}),t.addEventListener("on_console",e=>{console.log("[vueplayground] on_console",e.data)}),t.addEventListener("on_console_group",e=>{console.log("[vueplayground] on_console_group",e.data)}),t.addEventListener("on_console_group_collapsed",e=>{console.log("[vueplayground] on_console_group_collapsed",e.data)}),t.addEventListener("on_console_group_end",e=>{console.log("[vueplayground] on_console_group_end",e.data)})}function O(n,t){return[".vue",".ts"].some(e=>n.endsWith(e))&&!t.isExist(n)}function H(n,t){const e=document.createElement("button");return!t&&e.setAttribute("closeable",""),e.innerHTML=n+(t?"":'<svg t="1631378872341" class="icon-close" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1198" width="14" height="14"><path d="M466.773333 512l-254.72 254.72 45.226667 45.226667L512 557.226667l254.72 254.72 45.226667-45.226667L557.226667 512l254.72-254.72-45.226667-45.226667L512 466.773333 257.28 212.053333 212.053333 257.28 466.773333 512z" fill="#e1e1e1" p-id="1199"></path></svg>'),e}async function v(n,t,e,o){const{editorManage:i,tabWrap:s,fs:d}=n;async function a(l){const u=s.children;for(let p in u)u[p].tagName==="BUTTON"&&u[p].removeAttribute("active");l instanceof MouseEvent?l.target.setAttribute("active",""):l.setAttribute("active",""),await D(i,d,t,e)}function c(l){R(i),r.hasAttribute("active")&&r.previousElementSibling.click(),d.removeFile(r.textContent),r.remove(),l.stopPropagation()}const r=H(t,o);s.insertBefore(r,s.lastElementChild.previousElementSibling),r.addEventListener("click",a),await a(r),o||r.querySelector("svg").addEventListener("click",c,!1)}function $(n){const e=n.currentTarget.previousElementSibling;e.classList.toggle("filename-input-show",!0),e.focus()}async function N(n){const t=n.target,e=f(t);if(n.key==="Enter"){const o=n.target,i=o.value;O(i,e.fs)?(await v(e,i,{}),o.value="",o.classList.toggle("filename-input-show",!1)):(o.classList.toggle("filename-input-error",!0),setTimeout(()=>{o.classList.toggle("filename-input-error",!1)},400))}}function z(n){n.target.classList.toggle("filename-input-show",!1)}async function G(n){const{item:t,action:e}=n.detail,o=n.target,i=f(o),{sandbox:s}=i,d=i.editorManage.get("ts");if(d){const a=await d.editor.monacoAccessor;if(e==="add"){const c=await k(t.name,t.version);a.typescript.addDTS(c),s.setupDependency({[t.name]:L(t.name,t.version)})}}}class y extends HTMLElement{constructor(){super();this.fs=new F,this.editorManage=T(this);const t=this.attachShadow({mode:"open"}),e=this.ownerDocument.createElement("div");e.innerHTML=P,e.style.width="inherit",e.style.height="inherit",e.style.display="flex",t.appendChild(e)}async connectedCallback(){const{addButton:t,addInput:e,unpkgManage:o}=this;q(this),t.addEventListener("click",$),e.addEventListener("keydown",N),e.addEventListener("blur",z),o.addEventListener("unpkg-change",G),this.setupProjectManage()}disconnectedCallback(){}attributeChangedCallback(){}get sandbox(){return this.shadowRoot.querySelector("#sandbox")}get editorWrap(){return this.shadowRoot.querySelector("#editor-wrap")}get tabWrap(){return this.shadowRoot.querySelector("#tab")}get addButton(){return this.shadowRoot.querySelector("#tab .icon-add")}get addInput(){return this.shadowRoot.querySelector("#filename-input")}get unpkgManage(){return this.shadowRoot.querySelector("unpkg-manage")}async setupProjectManage(){const{sandbox:t,editorManage:e,unpkgManage:o,fs:i}=this,s=await I("vue",this.fs);let d=!1;async function a(c){const r=d;await W(c),r&&t.eval(s.update(c))}i.clear(),i.subscribe("update",a),t.setupDependency(s.importMap),o.installPackage(s.importMap),await v(this,s.entryFile,{vuehtml:"<template>vue template</template>",ts:"export default {}"},!0),d=!0,await v(this,s.configFile,{ts:s.defaultConfigCode},!0),(await e.get("ts").editor.monacoAccessor).typescript.addDTS(s.dts)}}function K(){window.customElements.get("code-playground")||(C(),j(),x(),M(),window.CodePlayground=y,window.customElements.define("code-playground",y))}K();
