import{MonacoEditor as e,install as t}from"./index.45b17e20.js";import{d as n}from"./debounce.cf38708f.js";import{_ as i}from"./preload-helper.f6ac322f.js";import{g as o}from"./shadow.87af85ed.js";import{r as s,S as a}from"./resolvePackage.fdc5f42d.js";import{c as r}from"./promise.2d7cfcc9.js";import{i as d}from"./index.521922e3.js";import{i as c}from"./index.26171d6e.js";import{i as l}from"./index.47e17cc7.js";import"./vendor.3da8fb95.js";import"./index.7aeb2d8f.js";var u=(function(...e){return e})`
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
`;class p extends class{constructor(){this.map={}}subscribe(e,t){this.map[e]?this.map[e].push(t):this.map[e]=[t]}unsubscribe(e){delete this.map[e]}emit(e,...t){this.map[e]&&this.map[e].forEach((e=>e.apply(null,t)))}}{constructor(){super(...arguments),this.files={}}isExist(e){return void 0!==this.files[e]}readFile(e){return this.files[e]}writeFile(e,t){return e.content=t,e.change=!0,this.files[e.filename]=e,this.emit("update",e),e}removeFile(e){delete this.files[e],this.emit("delete",e)}clear(){this.files={}}}class h extends class{constructor(e){this.filename=e,this.type="base",this.content="",this.change=!0}}{constructor(){super(...arguments),this.compiled={js:"",ssr:"",css:""}}}async function g(e,t,n,i,o){let s;return s=o?await e.createModel(t,n,i):await e.findModel(n),s}function m(e,t,n,i){let o;return o=i?e.writeFile(new h(t),n):e.readFile(t),o}const f=r((()=>i((()=>import("./index.60c15bf5.js")),[]))),v=r((()=>i((()=>import("./index.45b17e20.js")),["assets/index.45b17e20.js","assets/preload-helper.f6ac322f.js","assets/promise.2d7cfcc9.js","assets/vendor.3da8fb95.js","assets/debounce.cf38708f.js"])));async function w(e,t,i,o){const{editorManage:s,tabWrap:a,fs:r}=e;async function d(e){const o=a.children;for(let t in o)"BUTTON"===o[t].tagName&&o[t].removeAttribute("active");if(e instanceof MouseEvent){e.target.setAttribute("active","")}else e.setAttribute("active","");await async function(e,t,i,o){const s=!t.isExist(i);if(i.endsWith(".vue")){const[a,r]=e.active(["vuehtml","ts"]),d=await g(a.editor,"vuehtml",i+".vuehtml",o.vuehtml||"",s);a.editor.setModel(d);const c=await g(r.editor,"ts",i+".ts",o.ts||"",s);if(r.editor.setModel(c),s){const e={html:d.getValue(),ts:c.getValue()},o=()=>[e.html,"<script>",e.ts,"<\/script>"].join("\n"),a=m(t,i,o(),s);d.onDidChangeContent(n((()=>{e.html=d.getValue(),t.writeFile(a,o())}))),c.onDidChangeContent(n((async()=>{e.ts=c.getValue(),t.writeFile(a,o())})))}}else{if(!i.endsWith(".ts"))throw`don't support create ${i}, only support create *.vue/*.ts.`;{const[a]=e.active(["ts"]),r=await g(a.editor,"ts",i,o.ts||"",s);if(a.editor.setModel(r),s){const e=m(t,i,o.ts||"",s);r.onDidChangeContent(n((async()=>{t.writeFile(e,r.getValue())})))}}}}(s,r,t,i)}const c=function(e,t){const n=document.createElement("button");return!t&&n.setAttribute("closeable",""),n.innerHTML=e+(t?"":'<svg t="1631378872341" class="icon-close" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1198" width="14" height="14"><path d="M466.773333 512l-254.72 254.72 45.226667 45.226667L512 557.226667l254.72 254.72 45.226667-45.226667L557.226667 512l254.72-254.72-45.226667-45.226667L512 466.773333 257.28 212.053333 212.053333 257.28 466.773333 512z" fill="#e1e1e1" p-id="1199"></path></svg>'),n}(t,o);if(a.insertBefore(c,a.lastElementChild.previousElementSibling),c.addEventListener("click",d),await d(c),!o){c.querySelector("svg").addEventListener("click",(function(e){!function(e){e.getActive().forEach((async e=>{e.editor.removeModel()}))}(s),c.hasAttribute("active")&&c.previousElementSibling.click(),r.removeFile(c.textContent),c.remove(),e.stopPropagation()}),!1)}}function b(e){const t=e.currentTarget.previousElementSibling;t.classList.toggle("filename-input-show",!0),t.focus()}async function y(e){const t=e.target,n=o(t);if("Enter"===e.key){const t=e.target,i=t.value;!function(e,t){return[".vue",".ts"].some((t=>e.endsWith(t)))&&!t.isExist(e)}(i,n.fs)?(t.classList.toggle("filename-input-error",!0),setTimeout((()=>{t.classList.toggle("filename-input-error",!1)}),400)):(await w(n,i,{}),t.value="",t.classList.toggle("filename-input-show",!1))}}function x(e){e.target.classList.toggle("filename-input-show",!1)}async function _(e){const{item:t,action:n}=e.detail,i=e.target,r=o(i),{sandbox:d}=r,c=r.editorManage.get("ts");if(c){const e=await c.editor.monacoAccessor;if("add"===n){const n=await s(t.name,t.version);e.typescript.addDTS(n),d.setupDependency({[t.name]:a(t.name,t.version)})}}}class E extends HTMLElement{constructor(){super(),this.fs=new p,this.editorManage=function(t){const n={},i={get:e=>n[e],active:o=>{const{editorWrap:s}=t;i.hideAll();const a=o.map((i=>{let o=n[i];if(!o){const a=new e;a.style.width="100%",a.style.height="100%";const r=t.ownerDocument.createElement("div");r.style.width="100%",r.style.height="100%",r.setAttribute("slot","item"),r.setAttribute("type",i),r.appendChild(a),o={wrap:r,editor:a,status:!1},n[i]=o,s.appendChild(o.wrap)}return o.status||(o.status=!0,o.wrap.style.display="block",o.wrap.removeAttribute("hidden")),o}));return s.updateItems(),a},getActive:()=>{const e=[];for(let t in n){const i=n[t];i.status&&e.push(i)}return e},hide:e=>{const t=n[e];t&&t.status&&(t.status=!1,t.wrap.style.display="none",t.wrap.setAttribute("hidden",""))},hideAll:()=>{const{editorWrap:e}=t;e.items.forEach((e=>{const t=e.getAttribute("type");t&&i.hide(t)}))}};return i}(this);const t=this.attachShadow({mode:"open"}),n=this.ownerDocument.createElement("div");n.innerHTML=u,n.style.width="inherit",n.style.height="inherit",n.style.display="flex",t.appendChild(n)}async connectedCallback(){const{addButton:e,addInput:t,unpkgManage:n}=this;!function(e){const{sandbox:t}=e;t.addEventListener("on_fetch_progress",(e=>{const t=e;console.log("[vueplayground] on_fetch_progress",t.data)})),t.addEventListener("on_error",(e=>{const t=e;console.log("[vueplayground] on_error",t.data)})),t.addEventListener("on_unhandled_rejection",(e=>{const t=e;console.log("[vueplayground] on_unhandled_rejection",t.data)})),t.addEventListener("on_console",(e=>{const t=e;console.log("[vueplayground] on_console",t.data)})),t.addEventListener("on_console_group",(e=>{const t=e;console.log("[vueplayground] on_console_group",t.data)})),t.addEventListener("on_console_group_collapsed",(e=>{const t=e;console.log("[vueplayground] on_console_group_collapsed",t.data)})),t.addEventListener("on_console_group_end",(e=>{const t=e;console.log("[vueplayground] on_console_group_end",t.data)}))}(this),e.addEventListener("click",b),t.addEventListener("keydown",y),t.addEventListener("blur",x),n.addEventListener("unpkg-change",_),this.setupProjectManage()}disconnectedCallback(){}attributeChangedCallback(){}get sandbox(){return this.shadowRoot.querySelector("#sandbox")}get editorWrap(){return this.shadowRoot.querySelector("#editor-wrap")}get tabWrap(){return this.shadowRoot.querySelector("#tab")}get addButton(){return this.shadowRoot.querySelector("#tab .icon-add")}get addInput(){return this.shadowRoot.querySelector("#filename-input")}get unpkgManage(){return this.shadowRoot.querySelector("unpkg-manage")}async setupProjectManage(){const{sandbox:e,editorManage:t,unpkgManage:n,fs:o}=this,s=await async function(e,t){switch(e){case"vue":return(await i((()=>import("./vue.b3d1961c.js")),["assets/vue.b3d1961c.js","assets/resolvePackage.fdc5f42d.js","assets/vendor.3da8fb95.js"])).createVueProject(t)}}("vue",this.fs);let a=!1;o.clear(),o.subscribe("update",(async function(t){const n=a;await async function(e){if(e.change)if(e.change=!1,e.filename.endsWith(".vue"))await(await f()).compileVueSFCFile(e);else if(e.filename.endsWith(".ts")){const t=await(await v()).getRunnableJS(e.filename);e.compiled.js=t}}(t),n&&e.eval(s.update(t))})),e.setupDependency(s.importMap),n.installPackage(s.importMap),await w(this,s.entryFile,{vuehtml:"<template>vue template</template>",ts:"export default {}"},!0),a=!0,await w(this,s.configFile,{ts:s.defaultConfigCode},!0),(await t.get("ts").editor.monacoAccessor).typescript.addDTS(s.dts)}}window.customElements.get("code-playground")||(d(),c(),t(),l(),window.CodePlayground=E,window.customElements.define("code-playground",E));
