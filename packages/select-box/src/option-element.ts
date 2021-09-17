function html(...args: any) {
  return args
}

export default html`
<style>
:host {
  position: relative;
}
.option {
  height: 32px;
  line-height: 32px;
  box-sizing: border-box;
  font-size: 13px;
  color: #e1e1e1;
  background: #000;
  padding: 0 10px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.option:hover {
  background-color: #333;
}
</style>
<div class="option">
  <slot></slot>
</div>
`
