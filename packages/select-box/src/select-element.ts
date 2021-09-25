function html(...args: any) {
  return args
}

export default html`
<style>
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, .5);
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
  }
  ::-webkit-scrollbar-thumb:window-inactive {
    background: rgba(0, 0, 0, 0.5);
  }
  :host {
    position: relative;
    display: inline-block;
  }
  .select-inner {
    width: 100%;
    border: 1px solid #1e1e1e;
    background: #000;
    color: #e1e1e1;
    box-sizing: border-box;
    font-size: 13px;
    outline: none;
    border-radius: 4px;
  }
  .drop {
    width: 100%;
    position: absolute;
    top: 36px;
    left: 0;
    padding: 4px 0;
    border-radius: 2px;
    overflow: auto;
    max-height: 256px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    display: none;
    z-index: 999;
    text-align: left;
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
