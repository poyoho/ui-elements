const { parse: parseUrl, URLSearchParams } = require("url")
const fs = require("fs")

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
    name: "raw-loader",
    async load (id) {
      const query = parseRequest(id)
      if (query && query.search.raw !== undefined) {
        return `export default ${JSON.stringify(
          fs.readFileSync(query.path, { encoding: 'utf-8' })
        )}`
      }
    },
  }
}
