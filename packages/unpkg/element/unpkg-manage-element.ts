import ENTRY from "./icon/entry.svg?raw"
import CLOSE from "./icon/close.svg?raw"
import INSTALLED from "./icon/installed.svg?raw"
import PACKAGE from "./icon/package.svg?raw"

function html(...args: any) {
  return (args[0] as Array<string>).map((str, idx) => str + (args[1 + idx] || "")).join("")
}

export default html`
<button id="entry">
  ${ENTRY}
</button>
<div id="panel" style="display: none;">
  <ul class="menu">
    <li class="title">
      Setting
      ${CLOSE}
    </li>
    <li key="Installed" class="active">
      ${INSTALLED}
      Installed
    </li>
    <li key="Packages">
      ${PACKAGE}
      Packages
    </li>
  </ul>
  <div class="result">
    <input type="text" class="filter item" placeholder="pick package">
    <div class="content"></div>
  </div>
<style>
@keyframes input-error {
  to {
    transform: scale(.92);
  }
}
.input-error {
  animation: input-error .1s linear 4 alternate;
}
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
  z-index: 2147483647;
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
  cursor: default;
}
.icon-close {
  float: right;
  cursor: pointer;
}
.menu li[key] {
  cursor: pointer;
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
.installed {
  background: #3f3f3f;
}
select-box {
  width: 90px;
  display: none;
}
</style>
`
