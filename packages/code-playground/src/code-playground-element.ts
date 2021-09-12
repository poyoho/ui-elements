function html(...args: any) {
  return args
}

export default html`
<drag-wrap direction="row">
  <div slot="item">
    <div id="tab">
      <button>add</button>
    </div>
    <drag-wrap direction="column" id="editor-wrap">
    </drag-wrap>
  </div>

  <div slot="item" class="sandbox">
    <iframe-sandbox id="sandbox"/>
  </div>
</drag-wrap>
<style>
.sandbox {
  height: 100%;
  background: #333;
}
#vuehtml, #vuets {
  width: 100%;
  height: 100%;
}
.tablist {
  font-size: 0;
  cursor: pointer;
}
.tablist button {
  font-size: 14px;
  padding: 7px;
}
#tab {
  background: #1e1e1e;
}
#tab button {
  border: 0;
  outline: 0;
  background: #666;
  color: #e1e1e1;
  padding: 5px;
  padding-right: 8px;
}
#tab button .icon {
  transform: translate(4px, 3px)
}
#tab button[active] {
  color: #e1e1e1;
  background: #333;
}
</style>
`
