function html(...args: any) {
  return (args[0] as Array<string>).map((str, idx) => str + (args[1 + idx] || "")).join("")
}

export default html`
<div class="drag-wrap">
  <slot name="item">
</div>
<style>
  .drag-wrap {
    background: #000;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    height: 100%;
  }
</style>
`
