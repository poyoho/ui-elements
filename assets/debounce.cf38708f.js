function n(n,t=300){let e=null;return function(...i){e&&window.clearTimeout(e),e=window.setTimeout((()=>{n.apply(this,i),e=null}),t)}}export{n as d};
