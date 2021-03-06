const { parse: parseUrl, URLSearchParams } = require("url")
const path = require("path")
const { createHash } = require('crypto');
const chalk = require("chalk")

function getAssetHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8)
}

function parseRequest(id) {
  const { search, href } = parseUrl(id)
  if (!search) {
    return null
  }
  return {
    path: id.split("?")[0],
    search: Object.fromEntries(new URLSearchParams(search.slice(1))),
  }
}

function cleanUrl (url) {
  const queryRE = /\?.*$/s
  const hashRE = /#.*$/s
  return url.replace(hashRE, '').replace(queryRE, '')
}

module.exports = function rollupWebWorker (options) {
  return {
    name: "monaco-editor-loader",
    async load (id) {
      const query = parseRequest(id)
      if (query && query.search.virtualMonacoCSS !== undefined) {
        console.log(chalk.blue("[virtualMonacoCSS]"), query.path);
        return `export default new URL("./${options.extract}", import.meta.url).href`
      }
    },
  }
}
