import{g as e}from"./shadow.87af85ed.js";var t=(function(...e){return e})`
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
    <span>展开</span>
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
`;const o=new WeakMap;function r(t){const r=t.target,n=e(r),{source:c,tipText:i,expandContractIcon:a}=n,s=o.get(n);s.expaned=!s.expaned,s.expaned?(c.style.height=`${s.height}px`,i.textContent="隐藏"):(c.style.height="0",i.textContent="展开"),a.classList.toggle("expand"),o.set(n,s)}function n(t){const r=t.currentTarget;if("copyed"===r.textContent)return;const n=e(r),c=o.get(n);t.stopPropagation(),"clipboard"in navigator&&(r.textContent="copyed",navigator.clipboard.writeText(c.componentContext))}function c(e){e.target.textContent="copy"}class i extends HTMLElement{constructor(){super();const e=this.attachShadow({mode:"open"}),o=this.ownerDocument.createElement("div");o.style.width="inherit",o.style.height="inherit",o.innerHTML=t,e.appendChild(o)}connectedCallback(){var e;const{source:t,ctrl:i,component:a,copyIcon:s}=this,l={expaned:!1,height:t.clientHeight,componentContext:(null==a?void 0:a.textContent)||""};o.set(this,l),t.style.height="0",a?(s.addEventListener("click",n),s.addEventListener("mouseleave",c)):(null==(e=s.parentElement)||e.remove(),s.remove()),i.addEventListener("click",r)}disconnectedCallback(){const e=this.ctrl,t=this.copyIcon;o.get(this)&&o.delete(this),e&&e.removeEventListener("click",r),t&&(t.removeEventListener("click",n),t.removeEventListener("mouseleave",c))}get source(){return this.shadowRoot.querySelector(".source")}get ctrl(){return this.shadowRoot.querySelector(".control")}get tipText(){return this.shadowRoot.querySelector(".control span")}get expandContractIcon(){return this.shadowRoot.querySelector(".control .contract-icon")}get copyIcon(){return this.shadowRoot.querySelector(".highlight .copy")}get component(){return this.querySelector("[slot='highlight'] .cloneable")}}window.customElements.get("demo-block")||(window.DemoBlockElement=i,window.customElements.define("demo-block",i));
