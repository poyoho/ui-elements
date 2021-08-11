function html(...args: any) {
  return args
}

export default html`
<div class="code-comment">
  <div class="source">
    <slot name="source"></slot>
  </div>
  <div class="split"></div>
  <div class="comment">
    <slot name="comment" class="comment-text"></slot>
  </div>
</div>
<style>
.code-comment {
  display: flex;
  width: 100%;
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
  width: 50%;
  background: #282c34;
  color: #d7d3cb;
  overflow: auto;
}
.comment {
  width: 50%;
  background: #282c3d;
  color: #d7d3c2;
  overflow: auto;
}
</style>
`
