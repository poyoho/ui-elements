let e;const t={},r=function(r,n){if(!n||0===n.length)return r();if(void 0===e){const t=document.createElement("link").relList;e=t&&t.supports&&t.supports("modulepreload")?"modulepreload":"preload"}return Promise.all(n.map((r=>{if((r=`/ui-elements/${r}`)in t)return;t[r]=!0;const n=r.endsWith(".css"),s=n?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${s}`))return;const o=document.createElement("link");return o.rel=n?"stylesheet":e,n||(o.as="script",o.crossOrigin=""),o.href=r,document.head.appendChild(o),n?new Promise(((e,t)=>{o.addEventListener("load",e),o.addEventListener("error",t)})):void 0}))).then((()=>r()))};export{r as _};
