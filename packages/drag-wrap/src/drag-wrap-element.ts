function html(...args: any) {
  return args
}

export default html`
<div class="drag-wrap">
  <slot name="item">
</div>
<style>
  .drag-wrap {
    background: #345;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    height: 100%;
  }
</style>
`