function html(...args: any) {
  return args
}

export default html`
<div class="code-comment">
  <div class="wrap">
    <div class="source">
      <slot name="source"></slot>
    </div>
    <div class="split"></div>
    <div class="comment">
      <slot name="comment" class="comment-text"></slot>
    </div>
  </div>
  <div class="control"></div>
</div>
<style>
.wrap {
  display: flex;
  width: 100%;
  height: 100%;
}
.control {
  cursor: pointer;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
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
.source {
  box-sizing: border-box;
  width: 50%;
  background: #282c34;
  color: #d7d3cb;
  overflow: auto;
  padding-top: 10px;
}
.comment {
  box-sizing: border-box;
  width: 50%;
  background: #282c3d;
  color: #d7d3c2;
  overflow: auto;
  padding-top: 10px;
}
.full-screen {
  width: 100% !important;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 65535;
}
</style>
`
