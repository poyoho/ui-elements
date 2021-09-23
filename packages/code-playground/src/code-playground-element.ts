function html(...args: any) {
  return args
}

export default html`
<div class="control-bar">
  <unpkg-manage></unpkg-manage>
</div>
<drag-wrap direction="row" id="editor">
  <div slot="item">
    <div id="tab">

      <input type="text" id="filename-input" />
      <svg t="1631454598719" class="icon-add" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2150" width="14" height="14"><path d="M512 170.666667a42.666667 42.666667 0 0 1 42.666667 42.666666v256h256a42.666667 42.666667 0 1 1 0 85.333334h-256v256a42.666667 42.666667 0 1 1-85.333334 0v-256H213.333333a42.666667 42.666667 0 1 1 0-85.333334h256V213.333333a42.666667 42.666667 0 0 1 42.666667-42.666666z" fill="#e1e1e1" p-id="2151"></path></svg>
    </div>
    <drag-wrap direction="column" id="editor-wrap">
      <div slot="item" id="spacehold" hidden></div>
      <slot name="editor"></slot>
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
