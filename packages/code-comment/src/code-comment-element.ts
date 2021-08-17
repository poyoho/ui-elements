const IconFullScreen = new URL("./full-screen.svg", import.meta.url).href
const IconSpliteScreen = new URL("./splite-screen.svg", import.meta.url).href

function html(...args: any) {
  return (args[0] as Array<string>).map((str, idx) => str + (args[1 + idx] || "")).join("")
}

export default html`
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
  background: url(${IconFullScreen}) no-repeat;
  background-size: 100% 100%;
}
.icon-splite-screen {
  background: url(${IconSpliteScreen}) no-repeat;
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
`
