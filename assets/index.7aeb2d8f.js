import{g as e}from"./shadow.87af85ed.js";var t=(function(...e){return e})`
<style>
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, .5);
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
  }
  ::-webkit-scrollbar-thumb:window-inactive {
    background: rgba(0, 0, 0, 0.5);
  }
  :host {
    position: relative;
    display: inline-block;
  }
  .select-inner {
    width: 100%;
    border: 1px solid #1e1e1e;
    background: #000;
    color: #e1e1e1;
    box-sizing: border-box;
    font-size: 13px;
    outline: none;
    border-radius: 4px;
  }
  .drop {
    width: 100%;
    position: absolute;
    top: 36px;
    left: 0;
    padding: 4px 0;
    border-radius: 2px;
    overflow: auto;
    max-height: 256px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    display: none;
    z-index: 999;
    text-align: left;
  }
  .show {
    display: block;
  }
</style>
<input class="select-inner" readonly>
<div class="drop">
  <slot></slot>
</div>
`;function o(t){const o=t.target,n=e(o),{drop:i}=n;i.classList.toggle("show")}function n(t){const o=t.target;if("OPTION-BOX"!==o.tagName)return;const n=t.currentTarget,i=e(n),s=o.getAttribute("value"),r=new CustomEvent("change",{detail:s});i.dispatchEvent(r),i.input.value=s,i.value=s,n.classList.toggle("show")}class i extends HTMLElement{constructor(){super(),this.value="";const e=document.createElement("template");e.innerHTML=t;const o=this.attachShadow({mode:"open"}),n=e.content.cloneNode(!0);o.appendChild(n)}get input(){return this.shadowRoot.querySelector(".select-inner")}get drop(){return this.shadowRoot.querySelector(".drop")}connectedCallback(){const{input:e,drop:t}=this;e.placeholder=this.getAttribute("placeholder")||"",e.addEventListener("click",o),t.addEventListener("click",n)}disconnectedCallback(){const{input:e,drop:t}=this;e.removeEventListener("click",o),t.removeEventListener("click",n)}}var s=(function(...e){return e})`
<style>
:host {
  position: relative;
}
.option {
  height: 32px;
  line-height: 32px;
  box-sizing: border-box;
  font-size: 13px;
  color: #e1e1e1;
  background: #000;
  padding: 0 10px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.option:hover {
  background-color: #333;
}
</style>
<div class="option">
  <slot></slot>
</div>
`;class r extends HTMLElement{constructor(){super();const e=this.attachShadow({mode:"open"}),t=this.ownerDocument.createElement("template");t.innerHTML=s;const o=t.content.cloneNode(!0);e.appendChild(o)}}function l(){window.customElements.get("select-box")||(window.SelectBox=i,window.OptionBox=r,window.customElements.define("select-box",i),window.customElements.define("option-box",r))}export{l as i};
