function html(...args: any) {
  return args
}

export default html`
<drag-wrap direction="row">
  <div slot="item">
    <div id="tab">

      <svg t="1631454598719" class="icon-add" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2150" width="14" height="14"><path d="M512 170.666667a42.666667 42.666667 0 0 1 42.666667 42.666666v256h256a42.666667 42.666667 0 1 1 0 85.333334h-256v256a42.666667 42.666667 0 1 1-85.333334 0v-256H213.333333a42.666667 42.666667 0 1 1 0-85.333334h256V213.333333a42.666667 42.666667 0 0 1 42.666667-42.666666z" fill="#e1e1e1" p-id="2151"></path></svg>
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
#tab .icon-add {
  transform: translate(4px, 3px)
}
</style>
`
