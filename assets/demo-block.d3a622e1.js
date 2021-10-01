import"./modulepreload-polyfill.b7f2da20.js";import{g as s}from"./index.5a742324.js";var b=`
<div class="demo-block">
  <div class="exec">
    <slot name="exec"></slot>
  </div>
  <div class="expaned-block source">
    <div class="description">
      <slot name="description"></slot>
    </div>
    <div class="highlight">
      <div class="ctrl-bar">
        <button class="copy">copy</button>
      </div>
      <slot name="highlight"></slot>
    </div>
  </div>
  <div class="control">
    <i class="contract-icon"></i>
    <span>\u5C55\u5F00</span>
  </div>
</div>
<style>
.demo-block {
  border: 1px solid #ebebeb;
  background: #fafafa;
  margin: 20px 0;
  transition: .2s;
}
/* exec wrap */
.exec {
  margin: 10px;
  padding: 20px;
  border-radius: 5px;
  background: #fff;
  border: 1px solid #ebebeb;
}
/* source wrap */
.expaned-block {
  overflow: hidden;
  transition: all .3s;
}
.expaned-block .description {
  margin: 0 10px;
  background: #fff;
  border: 1px solid #ebebeb;
  padding: 0 10px;
  border-radius: 5px;
}
.expaned-block .highlight {
  padding: 0 10px;
}
.highlight {
  position: relative;
}
.ctrl-bar {
  position: absolute;
  bottom: 0;
  right: 10px;
  z-index: 10;
  border-radius: 5px 0 5px 0;
  background: rgba(84, 84, 88, 0.48);
  display: flex;
  padding: 10px 10px;
}
/* control wrap */
.control {
  user-select: none;
  border-top: 1px solid #ebebeb;
  background: #fff;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #e5e7eb;
}
.control:hover {
  color: #409eff
}
.control span {
  line-height: 30px;
  display: inline-block;
}
.copy {
  cursor: pointer;
  background: transparent;
  border: 0;
  color: #aeaeae;
}
.copy:hover {
  color: #eeeeee;
}
.contract-icon {
  position: relative;
  width: 0;
  height: 0;
  margin-right: 10px;
  border: 5px solid transparent;
  border-top-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
  top: 12px;
  border-top-color: #e5e7eb;
}
.control:hover .contract-icon {
  border-top-color: #409eff;
}
.control:hover .contract-icon.expand {
  border-top-color: transparent !important;
  border-bottom-color: #409eff !important;
}
.expand {
  top: -12px !important;
  border-top-color: transparent !important;
  border-bottom-color: #e5e7eb !important;
}

</style>
`;const i=new WeakMap;function l(n){const t=n.target,e=s(t),{source:o,tipText:c,expandContractIcon:a}=e,r=i.get(e);r.expaned=!r.expaned,r.expaned?(o.style.height=`${r.height}px`,c.textContent="\u9690\u85CF"):(o.style.height="0",c.textContent="\u5C55\u5F00"),a.classList.toggle("expand"),i.set(e,r)}function d(n){const t=n.currentTarget;if(t.textContent==="copyed")return;const e=s(t),o=i.get(e);n.stopPropagation(),"clipboard"in navigator&&(t.textContent="copyed",navigator.clipboard.writeText(o.componentContext))}function p(n){const t=n.target;t.textContent="copy"}class h extends HTMLElement{constructor(){super();const t=this.attachShadow({mode:"open"}),e=this.ownerDocument.createElement("div");e.style.width="inherit",e.style.height="inherit",e.innerHTML=b,t.appendChild(e)}connectedCallback(){var r;const{source:t,ctrl:e,component:o,copyIcon:c}=this,a={expaned:!1,height:t.clientHeight,componentContext:(o==null?void 0:o.textContent)||""};i.set(this,a),t.style.height="0",o?(c.addEventListener("click",d),c.addEventListener("mouseleave",p)):((r=c.parentElement)==null||r.remove(),c.remove()),e.addEventListener("click",l)}disconnectedCallback(){const t=this.ctrl,e=this.copyIcon;i.get(this)&&i.delete(this),t&&t.removeEventListener("click",l),e&&(e.removeEventListener("click",d),e.removeEventListener("mouseleave",p))}get source(){return this.shadowRoot.querySelector(".source")}get ctrl(){return this.shadowRoot.querySelector(".control")}get tipText(){return this.shadowRoot.querySelector(".control span")}get expandContractIcon(){return this.shadowRoot.querySelector(".control .contract-icon")}get copyIcon(){return this.shadowRoot.querySelector(".highlight .copy")}get component(){return this.querySelector("[slot='highlight'] .cloneable")}}function g(){window.customElements.get("demo-block")||(window.DemoBlockElement=h,window.customElements.define("demo-block",h))}g();
