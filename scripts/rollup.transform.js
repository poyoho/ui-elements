/** 去除为了 vscode html 插件的代码 */
module.exports = function transformHtmlFormat () {
  return {
    name: "transform-format-html",

    transform (code, id) {
      return code.replace(/function html\(...args\) {[\s\S]+html/, "export default")
    }
  }
}
