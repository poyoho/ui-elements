var t=Object.defineProperty,e=Object.defineProperties,o=Object.getOwnPropertyDescriptors,s=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,n=Object.prototype.propertyIsEnumerable,r=(e,o,s)=>o in e?t(e,o,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[o]=s;import{g as c}from"./shadow.87af85ed.js";var l=(function(...t){return t[0].map(((e,o)=>e+(t[1+o]||""))).join("")})`
<div class="code-comment">
  <div class="top">
    <div class="top-left-occupy"></div>
    <div class="comment-content">
      <slot name="comment" class="comment-text"></slot>
    </div>
  </div>

  <div class="wrap">
    <div class="source-wrap">
      <slot name="source"></slot>
    </div>
    <div class="split"></div>
    <div class="comment-wrap"></div>
  </div>

  <div class="occupy bottom-occupy"></div>
  <div class="control">
    <span class="icon icon-full-screen"></span>
    <span class="icon icon-splite-screen rotate90"></span>
  </div>
</div>
<style>
.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-top: 8px;
  margin-right: 10px;
}
.icon-full-screen {
  background: url(${"/ui-elements/assets/full-screen.730829af.svg"}) no-repeat;
  background-size: 100% 100%;
}
.icon-splite-screen {
  background: url(${"/ui-elements/assets/splite-screen.df4d6990.svg"}) no-repeat;
  background-size: 100% 100%;
}
.rotate90 {
  transform: rotate(90deg);
}
.code-comment {
  position: relative;
}
.wrap {
  display: flex;
  width: 100%;
  height: 100%;
}
.top {
  display: flex;
  width: 100%;
  height: 0;
  z-index: 1;
  position: sticky;
  top: 0;
}
.top-left-occupy {
  width: 50%;
}
.comment-content {
  width: 50%;
  color: #d7d3c2;
  padding-top: 10px;
  padding-left: 10px;
}
.control {
  z-index: 10;
  cursor: pointer;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: end;
  background: #303c40;
  position: sticky;
  left: 0;
  bottom: 0;
}
.split {
  width: 5px;
  background: #000;
  position: relative;
  user-select: none;
  z-index: 1;
}
.split::before {
  content: "";
  position: absolute;
  display: block;
  cursor: col-resize;
  top: 0;
  left: -5px;
  width: 15px;
  height: 100%;
}
.source-wrap {
  box-sizing: border-box;
  width: 50%;
  background: #282c34;
  color: #d7d3cb;
  overflow: auto;
  padding-top: 10px;
  padding-left: 10px;
}
.comment-wrap {
  position: relative;
  width: 50%;
  background: #282c3d;
  color: #d7d3c2;
  overflow: auto;
}
.occupy {
  width: 100%;
}
.bottom-occupy {
  position: absolute;
  transform: translateY(-100%);
  z-index: 0;
}
.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 2147483647; /* z-index max */
}
</style>
`;const p=new WeakMap;function d(t){console.log("pushStyleState");const{top:e,topLeft:o,topRight:s,contentWrap:i,source:n,comment:r}=t,c=window.getComputedStyle(e);p.get(t).cache.push({top:{height:c.height,position:c.position,top:c.top,bottom:c.bottom,transform:c.transform},topLeft:{width:o.style.width},topRight:{width:s.style.width,overflow:s.style.overflow},contentWrap:{flexDirection:i.style.flexDirection},source:{width:n.style.width},comment:{width:r.style.width}})}function a(t,e){let o=e;o||(o=p.get(t).cache.pop());const{top:s,topLeft:i,topRight:n,contentWrap:r,source:c,comment:l}=t;o&&(Object.assign(s.style,o.top),Object.assign(i.style,o.topLeft),Object.assign(n.style,o.topRight),Object.assign(r.style,o.contentWrap),Object.assign(c.style,o.source),Object.assign(l.style,o.comment))}const h=(()=>{const t=new WeakMap,c=new IntersectionObserver((e=>{for(const o of e){const e=o.intersectionRatio,s=o.boundingClientRect,i=o.rootBounds,n=t.get(o.target);if(!n)return;s.top-i.top>0&&1===e&&n.outBottomSticky(),s.top-i.top<0&&s.bottom-i.bottom<0&&n.onBottomSticky()}}),{threshold:[1]});return l=>{const p={onBottomSticky:l.onBottomSticky,outBottomSticky:l.outBottomSticky};return t.set(l.observeNode,p),d=((t,e)=>{for(var o in e||(e={}))i.call(e,o)&&r(t,o,e[o]);if(s)for(var o of s(e))n.call(e,o)&&r(t,o,e[o]);return t})({},c),e(d,o({observe:()=>{t.set(l.observeNode,p),c.observe(l.observeNode)},unobserve:()=>{t.delete(l.observeNode),c.unobserve(l.observeNode)}}));var d}})();function u(t){const e=t.currentTarget,o=c(e),{source:s,comment:i,topLeft:n,topRight:r,bottomOccupy:l,top:h}=o,u=p.get(o),m=t.clientX,g=s.parentElement.clientWidth,y=s.clientWidth,w=t=>{const e=t.clientX-m,c=y+e;if(c>g||c<0)return;let w=100*c/g;w<5?w=0:w>95&&(w=100),s.style.width=w+"%",i.style.width=100-w+"%",n.style.width=w+"%",r.style.width=100-w+"%",0===w?(s.style.paddingLeft="0px",i.style.paddingLeft="0px"):100===w?(s.style.paddingLeft="0px",i.style.paddingLeft="0px",r.style.opacity="0"):(s.style.paddingLeft="10px",i.style.paddingLeft="10px",r.style.opacity="1"),100===w?a(o,{top:{height:i.style.height,position:"absolute",top:"0",bottom:"auto",transform:"none"}}):h.scrollHeight>i.clientHeight&&!u.willChangeSourceWidth?(u.observer.unobserve(),d(o),a(o,{top:{position:"absolute",height:i.style.height,top:"0",bottom:"auto",transform:"none"},topRight:{width:i.style.width,overflow:"auto"}}),u.willChangeSourceWidth=w):w<u.willChangeSourceWidth&&u.willChangeSourceWidth&&(a(o),u.observer.observe(),u.willChangeSourceWidth=0),l.style.height=`calc(${u.paddingTopAttr} + ${r.scrollHeight+30}px)`,p.set(o,u)};document.addEventListener("mousemove",w),document.addEventListener("mouseup",(()=>{document.removeEventListener("mousemove",w)}))}function m(t){const e=t.currentTarget,o=c(e),{wrap:s,comment:i,source:n}=o;if(s.classList.toggle("full-screen"))n.style.height="100%",i.style.height="100%",document.body.style.overflow="hidden";else{const t=Math.max(n.offsetHeight,i.offsetHeight)+20;n.style.height=t+"px",i.style.height=t+"px",document.body.style.overflow="auto"}}class g extends HTMLElement{constructor(){super();const t=this.attachShadow({mode:"open"}),e=this.ownerDocument.createElement("div");e.innerHTML=l,t.appendChild(e)}connectedCallback(){const{controlFullScreen:t,controlSpliteScreen:e,split:o,top:s,topRight:i,bottomOccupy:n}=this,r=h({observeNode:n,onBottomSticky:()=>{s.style.position="absolute",s.style.top="auto",s.style.bottom="0",s.style.transform=`translateY(-${i.scrollHeight+20+40}px)`},outBottomSticky:()=>{const{paddingTopAttr:t}=p.get(this);s.style.position="sticky",s.style.top=t,s.style.bottom="auto",s.style.transform="none"}}),c={paddingTopAttr:this.getAttribute("paddingTop")||"0",willChangeSourceWidth:0,mode:"leftRight",observer:r,cache:[],resize:()=>function(t){const e=p.get(t),{source:o,comment:s,topRight:i,bottomOccupy:n}=t,r=Math.max(o.offsetHeight,s.offsetHeight);o.style.height=r+"px",s.style.height=r+"px",n.style.height=`calc(${e.paddingTopAttr} + ${i.scrollHeight+20}px)`,p.set(t,e)}(this),upDownSplitScreen:()=>{e.classList.toggle("rotate90"),function(t){const{comment:e,source:o,topRight:s}=t,i=p.get(t);"leftRight"===i.mode?(d(t),i.mode="topBottom",p.set(t,i),a(t,{top:{height:"0",position:"absolute",top:"0",bottom:"auto",transform:"none"},topLeft:{width:"0"},topRight:{width:"100%",overflow:"visible"},contentWrap:{flexDirection:"column-reverse"},source:{width:"100%"},comment:{width:"100%"}}),i.observer.unobserve(),e.style.height=s.scrollHeight+20+"px"):"topBottom"===i.mode&&(i.mode="leftRight",p.set(t,i),a(t),!i.willChangeSourceWidth&&i.observer.observe(),e.style.height=o.style.height)}(this)}};s.style.top=c.paddingTopAttr,p.set(this,c),c.resize(),r.observe(),window.addEventListener("resize",c.resize),o.addEventListener("mousedown",u),t.addEventListener("click",m),e.addEventListener("click",c.upDownSplitScreen)}disconnectedCallback(){const{split:t,controlFullScreen:e,controlSpliteScreen:o}=this,s=p.get(this);p.delete(this),t&&t.removeEventListener("mousedown",u),e&&e.removeEventListener("click",m),o&&o.removeEventListener("click",s.upDownSplitScreen),s&&window.removeEventListener("resize",s.resize),s&&s.observer.unobserve()}get wrap(){return this.shadowRoot.querySelector(".code-comment")}get contentWrap(){return this.shadowRoot.querySelector(".wrap")}get source(){return this.shadowRoot.querySelector(".source-wrap")}get comment(){return this.shadowRoot.querySelector(".comment-wrap")}get split(){return this.shadowRoot.querySelector(".split")}get controlFullScreen(){return this.shadowRoot.querySelector(".icon-full-screen")}get controlSpliteScreen(){return this.shadowRoot.querySelector(".icon-splite-screen")}get top(){return this.shadowRoot.querySelector(".top")}get topRight(){return this.shadowRoot.querySelector(".comment-content")}get topLeft(){return this.shadowRoot.querySelector(".top-left-occupy")}get bottomOccupy(){return this.shadowRoot.querySelector(".bottom-occupy")}}window.customElements.get("code-comment")||(window.CodeCommentElement=g,window.customElements.define("code-comment",g));
