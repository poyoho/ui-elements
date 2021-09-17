function html(...args: any) {
  return args
}

export default html`
<button id="entry">
  <svg t="1631631233593" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2480" width="24" height="24"><path d="M846.416977 421.154969c-7.857968-29.366841-19.485797-57.192583-34.354436-82.913385l65.271586-98.513688-0.107447-0.107447-92.849688-92.848665-0.107447-0.107447-98.513688 65.271586c-25.718755-14.869662-53.544497-26.495444-82.912361-34.355459L579.340199 61.780065l-0.152473 0L447.877075 61.780065l-0.151449 0-23.502273 115.801423c-29.366841 7.858992-57.192583 19.485797-82.914408 34.355459l-98.513688-65.271586-0.107447 0.107447-92.849688 92.849688-0.107447 0.107447 65.272609 98.513688c-14.869662 25.720801-26.495444 53.546543-34.355459 82.913385L64.848449 444.657242l0 0.152473 0 131.309628 0 0.151449 115.801423 23.50125c7.860015 29.365818 19.485797 57.192583 34.355459 82.913385l-65.271586 98.514711 0.107447 0.106424 92.849688 92.848665 0.107447 0.107447 98.513688-65.271586c25.720801 14.869662 53.546543 26.495444 82.914408 34.355459l23.502273 115.801423 0.152473 0 131.309628 0 0.151449 0 23.502273-115.801423c29.366841-7.860015 57.192583-19.485797 82.912361-34.355459l98.513688 65.271586 0.107447-0.107447 92.850711-92.848665 0.107447-0.106424-65.272609-98.514711c14.870686-25.720801 26.497491-53.546543 34.354436-82.913385l115.802446-23.50125 0-0.152473L962.220447 444.808692l0-0.151449L846.416977 421.154969zM669.350213 510.465041c0 86.054935-69.761853 155.815765-155.817812 155.815765-86.054935 0-155.818835-69.76083-155.818835-155.815765 0-86.055958 69.762877-155.816788 155.818835-155.816788C599.589382 354.648252 669.350213 424.409083 669.350213 510.465041z" p-id="2481"></path></svg>
</button>
<div id="panel" style="display: none;">
  <ul class="menu">
    <li noclick class="title">Setting</li>
    <li class="active">Installed</li>
    <li>Packages</li>
  </ul>
  <div class="result">
    <input type="text" class="filter item" placeholder="filter packages">
    <div class="content"></div>
  </div>
<style>
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(0, 0, 0, 0.5);
}
button {
  background: transparent;
  outline: 0;
  border: 0;
  cursor: pointer;
}
button svg path {
  fill: #e1e1e1;
}
button:hover svg path {
  fill: #1e1e1e;
}
#panel {
  width: 1000px;
  background: #fff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1e1e1e;
  color: #e1e1e1;
  border-radius: 10px;
  height: 700px;
  overflow: hidden;
}
@media screen and (max-width: 1000px) {
  #panel {
    width: 100%;
  }
}
.show {
  display: flex !important;
}
.menu {
  margin: 0;
  padding: 0;
  list-style: none;
  border-right: 3px solid #111111;
  width: 25%;
  user-select: none;
}
.menu li {
  color: #e1e1e1;
  padding: 20px;
  cursor: pointer;
}
.menu li[noclick] {
  cursor: default;
}
.menu li.active {
  background: #555;
}
.result {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  overflow-y: scroll;
}
.filter {
  height: 40px;
  color: #e1e1e1;
  padding: 0 20px;
  font-size: 18px;
  outline: 0;
  display: block;
}
.item {
  position: relative;
  box-sizing: border-box;
  width: 95%;
  margin: 12px auto;
  border: 1px solid #111;
  background: #1e1e1e;
  padding: 15px;
  border-radius: 5px;
}
.pkg-title {
  font-size: 24px;
  margin: 0;
  color: #e1e1e1;
}
.pkg-desc {
  font-size: 16px;
  color: #bbb;
  padding: 10px 0;
  word-break: break-all;
}
.pkg-ctrl {
  position: absolute;
  font-size: 16px;
  text-align: right;
  padding: 10px 16px;
  border-radius: 5px;
  background: #000;
  top: 12px;
  right: 15px;
}
.pkg-ctrl button {
  color: #e1e1e1;
}
select-box {
  width: 100px;
  display: none;
}
</style>
`
