function html(...args: any) {
  return args
}

export default html`
<div class="code-comment">
  <div class="source">
    <slot name="source"></slot>
  </div>
  <div class="comment">
    <slot name="comment"></slot>
  </div>
</div>
<style>
.code-comment {
  display: flex;
}
.source {
  width: 50%;
  flex: 1;
  background: aqua;
}
.comment {
  width: 50%;
  flex: 1;
  background: green;
}
</style>
`
