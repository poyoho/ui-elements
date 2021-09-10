function html(...args: any) {
  return args
}

export default html`
<drag-wrap direction="row">
  <div slot="item" class="editor">
    <tab-container class="tab">
      <div role="tablist" class="tablist" id="tab"></div>
      <div role="tabpanel" aria-labelledby="tab-one">
        <drag-wrap direction="column" id="editor"></drag-wrap>
      </div>
    </tab-container>
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
