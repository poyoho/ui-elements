import iconadd from "./icon/icon-add.svg?raw"

function html(...args: any) {
  return (args[0] as Array<string>).map((str, idx) => str + (args[1 + idx] || "")).join("")
}

export default html`
<div class="control-bar">
  <unpkg-manage></unpkg-manage>
</div>
<drag-wrap direction="row" id="editor">
  <div slot="item">
    <div id="tab">

      <input type="text" id="filename-input" />
      ${iconadd}
    </div>
    <drag-wrap direction="column" id="editor-wrap">
      <div slot="item" id="spacehold" hidden></div>
      <slot name="editor">

      </slot>
    </drag-wrap>
  </div>

  <div slot="item">
    <iframe-sandbox id="sandbox"/>
  </div>
</drag-wrap>
<style>
  .control-bar {
    width: 36px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
  #editor {
    flex: 1;
    height: 100%;
    margin: auto 0;
  }
  #sandbox {
    width: 100%;
    height: 100%;
  }
  #editor [slot="item"] {
    height: 100%;
  }
  #editor-wrap {
    width: 100%;
    height: calc(100% - 25px);
    background: #1e1e1e;
  }
  @keyframes input-error {
    to {
      transform: scale(.92);
    }
  }
  .filename-input-error {
    animation: input-error .1s linear 4 alternate;
  }
  .filename-input-show {
    margin-left: 5px;
    width: 80px !important;
    opacity: 1 !important;
    transition: width .1s;
  }
  #filename-input {
    opacity: 0;
    width: 0px;
    color: #e1e1e1;
    background: #1e1e1e;
    outline: 0;
    border: 1px solid #333;
    transition: width .1s;
  }
  #tab button {
    font-size: 13px;
    border: 0;
    outline: 0;
    border-radius: 0;
    background: #666;
    color: #e1e1e1;
    padding: 5px;
    padding-right: 8px;
  }
  #tab button[closeable] {
    padding-right: 20px;
  }
  #spacehold {
    background: #1e1e1e;
  }
  #tab {
    background: #1e1e1e;
  }
  #tab button .icon-close {
    position: absolute;
    transform: translate(3px, 1px);
  }
  #tab button[active] {
    color: #e1e1e1;
    background: #333;
  }
  #tab .icon-add {
    transform: translateY(3px)
  }
</style>
`
