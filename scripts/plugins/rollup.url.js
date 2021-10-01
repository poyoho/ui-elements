const { parse: parseUrl, URLSearchParams } = require("url")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const { createHash } = require('crypto');

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

module.exports = function rollupWebWorker () {
  return {
    name: "url-loader",
    async load (id) {
      const query = parseRequest(id)
      if (query && query.search.url !== undefined) {
        console.log(chalk.blue("[url]"), query.path);
        const source = fs.readFileSync(query.path, { encoding: 'utf-8' })
        const basename = path.parse(query.path)
        const sourceHash = getAssetHash(source)
        const fileName = path.posix.join(`${basename.name}.${sourceHash}${basename.ext}`)
        this.emitFile({
          source,
          fileName,
          type: 'asset',
        })
        return `export default new URL("./${fileName}", import.meta.url).href`
      }
    },
  }
}
