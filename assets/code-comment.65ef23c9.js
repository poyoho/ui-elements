var H=Object.defineProperty,B=Object.defineProperties;var q=Object.getOwnPropertyDescriptors;var f=Object.getOwnPropertySymbols;var E=Object.prototype.hasOwnProperty,O=Object.prototype.propertyIsEnumerable;var y=(o,s,t)=>s in o?H(o,s,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[s]=t,w=(o,s)=>{for(var t in s||(s={}))E.call(s,t)&&y(o,t,s[t]);if(f)for(var t of f(s))O.call(s,t)&&y(o,t,s[t]);return o},v=(o,s)=>B(o,q(s));import"./modulepreload-polyfill.b7f2da20.js";import{g as b}from"./index.5a742324.js";var T=new URL("/ui-elements/assets/full-screen.57c02417.57c02417.svg",self.location).href,M=new URL("/ui-elements/assets/splite-screen.ec29f58f.ec29f58f.svg",self.location).href,j=`
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
  background: url(${T}) no-repeat;
  background-size: 100% 100%;
}
.icon-splite-screen {
  background: url(${M}) no-repeat;
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
`;const a=new WeakMap;function S(o){console.log("pushStyleState");const{top:s,topLeft:t,topRight:n,contentWrap:e,source:c,comment:i}=o,r=window.getComputedStyle(s);a.get(o).cache.push({top:{height:r.height,position:r.position,top:r.top,bottom:r.bottom,transform:r.transform},topLeft:{width:t.style.width},topRight:{width:n.style.width,overflow:n.style.overflow},contentWrap:{flexDirection:e.style.flexDirection},source:{width:c.style.width},comment:{width:i.style.width}})}function h(o,s){let t=s;t||(t=a.get(o).cache.pop());const{top:n,topLeft:e,topRight:c,contentWrap:i,source:r,comment:p}=o;t&&(Object.assign(n.style,t.top),Object.assign(e.style,t.topLeft),Object.assign(c.style,t.topRight),Object.assign(i.style,t.contentWrap),Object.assign(r.style,t.source),Object.assign(p.style,t.comment))}const D=(()=>{const o=new WeakMap,s=new IntersectionObserver(t=>{for(const n of t){const e=n.intersectionRatio,c=n.boundingClientRect,i=n.rootBounds,r=o.get(n.target);if(!r)return;c.top-i.top>0&&e===1&&r.outBottomSticky(),c.top-i.top<0&&c.bottom-i.bottom<0&&r.onBottomSticky()}},{threshold:[1]});return t=>{const n={onBottomSticky:t.onBottomSticky,outBottomSticky:t.outBottomSticky};return o.set(t.observeNode,n),v(w({},s),{observe:()=>{o.set(t.observeNode,n),s.observe(t.observeNode)},unobserve:()=>{o.delete(t.observeNode),s.unobserve(t.observeNode)}})}})();function x(o){const s=o.currentTarget,t=b(s),{source:n,comment:e,topLeft:c,topRight:i,bottomOccupy:r,top:p}=t,d=a.get(t),R=o.clientX,g=n.parentElement.clientWidth,W=n.clientWidth,m=z=>{const C=z.clientX-R,u=W+C;if(u>g||u<0)return;let l=u*100/g;l<5?l=0:l>95&&(l=100),n.style.width=l+"%",e.style.width=100-l+"%",c.style.width=l+"%",i.style.width=100-l+"%",l===0?(n.style.paddingLeft="0px",e.style.paddingLeft="0px"):l===100?(n.style.paddingLeft="0px",e.style.paddingLeft="0px",i.style.opacity="0"):(n.style.paddingLeft="10px",e.style.paddingLeft="10px",i.style.opacity="1"),l===100?h(t,{top:{height:e.style.height,position:"absolute",top:"0",bottom:"auto",transform:"none"}}):p.scrollHeight>e.clientHeight&&!d.willChangeSourceWidth?(d.observer.unobserve(),S(t),h(t,{top:{position:"absolute",height:e.style.height,top:"0",bottom:"auto",transform:"none"},topRight:{width:e.style.width,overflow:"auto"}}),d.willChangeSourceWidth=l):l<d.willChangeSourceWidth&&d.willChangeSourceWidth&&(h(t),d.observer.observe(),d.willChangeSourceWidth=0),r.style.height=`calc(${d.paddingTopAttr} + ${i.scrollHeight+30}px)`,a.set(t,d)};document.addEventListener("mousemove",m),document.addEventListener("mouseup",()=>{document.removeEventListener("mousemove",m)})}function k(o){const s=o.currentTarget,t=b(s),{wrap:n,comment:e,source:c}=t;if(n.classList.toggle("full-screen"))c.style.height="100%",e.style.height="100%",document.body.style.overflow="hidden";else{const i=Math.max(c.offsetHeight,e.offsetHeight)+20;c.style.height=i+"px",e.style.height=i+"px",document.body.style.overflow="auto"}}function $(o){const s=a.get(o),{source:t,comment:n,topRight:e,bottomOccupy:c}=o,i=Math.max(t.offsetHeight,n.offsetHeight);t.style.height=i+"px",n.style.height=i+"px",c.style.height=`calc(${s.paddingTopAttr} + ${e.scrollHeight+20}px)`,a.set(o,s)}function A(o){const{comment:s,source:t,topRight:n}=o,e=a.get(o);e.mode==="leftRight"?(S(o),e.mode="topBottom",a.set(o,e),h(o,{top:{height:"0",position:"absolute",top:"0",bottom:"auto",transform:"none"},topLeft:{width:"0"},topRight:{width:"100%",overflow:"visible"},contentWrap:{flexDirection:"column-reverse"},source:{width:"100%"},comment:{width:"100%"}}),e.observer.unobserve(),s.style.height=n.scrollHeight+20+"px"):e.mode==="topBottom"&&(e.mode="leftRight",a.set(o,e),h(o),!e.willChangeSourceWidth&&e.observer.observe(),s.style.height=t.style.height)}class L extends HTMLElement{constructor(){super();const s=this.attachShadow({mode:"open"}),t=this.ownerDocument.createElement("div");t.innerHTML=j,s.appendChild(t)}connectedCallback(){const{controlFullScreen:s,controlSpliteScreen:t,split:n,top:e,topRight:c,bottomOccupy:i}=this,r=D({observeNode:i,onBottomSticky:()=>{e.style.position="absolute",e.style.top="auto",e.style.bottom="0",e.style.transform=`translateY(-${c.scrollHeight+20+40}px)`},outBottomSticky:()=>{const{paddingTopAttr:d}=a.get(this);e.style.position="sticky",e.style.top=d,e.style.bottom="auto",e.style.transform="none"}}),p={paddingTopAttr:this.getAttribute("paddingTop")||"0",willChangeSourceWidth:0,mode:"leftRight",observer:r,cache:[],resize:()=>$(this),upDownSplitScreen:()=>{t.classList.toggle("rotate90"),A(this)}};e.style.top=p.paddingTopAttr,a.set(this,p),p.resize(),r.observe(),window.addEventListener("resize",p.resize),n.addEventListener("mousedown",x),s.addEventListener("click",k),t.addEventListener("click",p.upDownSplitScreen)}disconnectedCallback(){const{split:s,controlFullScreen:t,controlSpliteScreen:n}=this,e=a.get(this);a.delete(this),s&&s.removeEventListener("mousedown",x),t&&t.removeEventListener("click",k),n&&n.removeEventListener("click",e.upDownSplitScreen),e&&window.removeEventListener("resize",e.resize),e&&e.observer.unobserve()}get wrap(){return this.shadowRoot.querySelector(".code-comment")}get contentWrap(){return this.shadowRoot.querySelector(".wrap")}get source(){return this.shadowRoot.querySelector(".source-wrap")}get comment(){return this.shadowRoot.querySelector(".comment-wrap")}get split(){return this.shadowRoot.querySelector(".split")}get controlFullScreen(){return this.shadowRoot.querySelector(".icon-full-screen")}get controlSpliteScreen(){return this.shadowRoot.querySelector(".icon-splite-screen")}get top(){return this.shadowRoot.querySelector(".top")}get topRight(){return this.shadowRoot.querySelector(".comment-content")}get topLeft(){return this.shadowRoot.querySelector(".top-left-occupy")}get bottomOccupy(){return this.shadowRoot.querySelector(".bottom-occupy")}}function I(){window.customElements.get("code-comment")||(window.CodeCommentElement=L,window.customElements.define("code-comment",L))}I();
