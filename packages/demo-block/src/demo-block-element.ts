function html(...args: any) {
  return args
}

export default html`
<div class="demo-block">
  <div class="exec">
    <slot name="exec"></slot>
  </div>
  <div class="expaned-block source">
    <div class="description">
      <slot name="description"></slot>
    </div>
    <div class="highlight">
      <div class="ctrl-bar">
        <button class="copy">copy</button>
      </div>
      <slot name="highlight"></slot>
    </div>
  </div>
  <div class="control">
    <i class="contract-icon"></i>
    <span>展开</span>
  </div>
</div>
<style>
.demo-block {
  border: 1px solid #ebebeb;
  background: #fafafa;
  margin: 20px 0;
  transition: .2s;
}
/* exec wrap */
.exec {
  margin: 10px;
  padding: 20px;
  border-radius: 5px;
  background: #fff;
  border: 1px solid #ebebeb;
}
/* source wrap */
.expaned-block {
  overflow: hidden;
  transition: all .3s;
}
.expaned-block .description {
  margin: 0 10px;
  background: #fff;
  border: 1px solid #ebebeb;
  padding: 0 10px;
  border-radius: 5px;
}
.expaned-block .highlight {
  padding: 0 10px;
}
.highlight {
  position: relative;
}
.ctrl-bar {
  position: absolute;
  bottom: 0;
  right: 10px;
  z-index: 10;
  border-radius: 5px 0 5px 0;
  background: rgba(84, 84, 88, 0.48);
  display: flex;
  padding: 10px 10px;
}
/* control wrap */
.control {
  user-select: none;
  border-top: 1px solid #ebebeb;
  background: #fff;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #e5e7eb;
}
.control:hover {
  color: #409eff
}
.control span {
  line-height: 30px;
  display: inline-block;
}
.copy {
  cursor: pointer;
  background: transparent;
  border: 0;
  color: #aeaeae;
}
.copy:hover {
  color: #eeeeee;
}
.contract-icon {
  position: relative;
  width: 0;
  height: 0;
  margin-right: 10px;
  border: 5px solid transparent;
  border-top-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
  top: 12px;
  border-top-color: #e5e7eb;
}
.control:hover .contract-icon {
  border-top-color: #409eff;
}
.control:hover .contract-icon.expand {
  border-top-color: transparent !important;
  border-bottom-color: #409eff !important;
}
.expand {
  top: -12px !important;
  border-top-color: transparent !important;
  border-bottom-color: #e5e7eb !important;
}

</style>
`
