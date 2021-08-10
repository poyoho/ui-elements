function html(...args: any) {
  return args
}

export default html`
<div class="code-comment">
  <div class="source">
    <slot name="source"></slot>
  </div>
  <div class="comment">
    <slot name="comment" class="comment-text"></slot>
  </div>
</div>
<style>
.code-comment {
  display: flex;
  width: 100%;
}
.source {
  flex: 1;
  background: aqua;
  overflow: auto;
}
.comment {
  flex: 1;
  background: green;
  overflow: auto;
}
</style>
`
