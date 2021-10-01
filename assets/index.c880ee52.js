import{g as i}from"./index.5a742324.js";var p=`
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
`;function r(n){const e=n.target,t=i(e),{drop:o}=t;o.classList.toggle("show")}function l(n){const e=n.target;if(e.tagName!=="OPTION-BOX")return;const t=n.currentTarget,o=i(t),s=e.getAttribute("value"),d=new CustomEvent("change",{detail:s});o.dispatchEvent(d),o.input.value=s,o.value=s,t.classList.toggle("show")}class a extends HTMLElement{constructor(){super();this.value="";const e=document.createElement("template");e.innerHTML=p;const t=this.attachShadow({mode:"open"}),o=e.content.cloneNode(!0);t.appendChild(o)}get input(){return this.shadowRoot.querySelector(".select-inner")}get drop(){return this.shadowRoot.querySelector(".drop")}connectedCallback(){const{input:e,drop:t}=this;e.placeholder=this.getAttribute("placeholder")||"",e.addEventListener("click",r),t.addEventListener("click",l)}disconnectedCallback(){const{input:e,drop:t}=this;e.removeEventListener("click",r),t.removeEventListener("click",l)}}var h=`
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
`;class c extends HTMLElement{constructor(){super();const e=this.attachShadow({mode:"open"}),t=this.ownerDocument.createElement("template");t.innerHTML=h;const o=t.content.cloneNode(!0);e.appendChild(o)}}function u(){window.customElements.get("select-box")||(window.SelectBox=a,window.OptionBox=c,window.customElements.define("select-box",a),window.customElements.define("option-box",c))}export{u as i};
