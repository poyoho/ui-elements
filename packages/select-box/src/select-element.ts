function html(...args: any) {
  return args
}

export default html`
<style>
  :host {
    position: relative;
    display: inline-block;
  }
  .select-inner {
    height: 34px;
    border: 1px solid #1e1e1e;
    background: #1e1e1e;
    color: #e1e1e1;
    box-sizing: border-box;
    font-size: 13px;
    outline: none;
    padding: 0 10px;
    border-radius: 4px;
  }
  .drop {
    position: absolute;
    top: 36px;
    left: 0;
    width: 100%;
    padding: 4px 0;
    border-radius: 2px;
    overflow: auto;
    max-height: 256px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    display: none;
  }
  .show {
    display: block;
  }
</style>
<input class="select-inner" readonly>
<div class="drop">
  <slot></slot>
</div>
`
