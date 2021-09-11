function html(...args: any) {
  return args
}

export default html`
<drag-wrap direction="row">
  <div slot="item">
    <div id="tab">

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
.tab {
  width: 100%;
  height: 100%;
}
.tablist {
  font-size: 0;
}
.tablist button {
  font-size: 14px;
  padding: 7px;
}
</style>
`
