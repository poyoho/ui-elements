const rollup = require("rollup")
const path = require("path")
const { parse: parseUrl, URLSearchParams } = require("url")
const { createHash } = require('crypto');
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

function getAssetHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8)
}

function parseWorkerRequest(id) {
  const { search } = parseUrl(id)
  if (!search) {
    return null
  }
  return Object.fromEntries(new URLSearchParams(search.slice(1)))
}

function cleanUrl (url) {
  const queryRE = /\?.*$/s
  const hashRE = /#.*$/s
  return url.replace(hashRE, '').replace(queryRE, '')
}

module.exports = function rollupWebWorker () {
  return {
    name: "webworker-loader",
    load (id) {
      const parsedQuery = parseWorkerRequest(id)
      if (parsedQuery && parsedQuery.worker != null) {
        return ''
      }
    },

    async transform (_, id) {
      const query = parseWorkerRequest(id)
      if (query == null || (query && query.worker == null)) {
        return
      }
      const filename = cleanUrl(id)
      const bundle = await rollup.rollup({
        input: filename,
        plugins: [
          nodeResolve({
            jsnext: true,
            browser: true,
          }),
          commonjs({
            include: [/node_modules/],
            extensions: ['.js', '.cjs'],
          })
        ]
      })
      let code
      try {
        const { output } = await bundle.generate({
          format: 'iife',
        })
        code = output[0].code
      } finally {
        await bundle.close()
      }
      const content = Buffer.from(code)
      const basename = path.parse(filename).name
      const contentHash = getAssetHash(content)
      const baseName = `./${basename}.${contentHash}.js`
      const fileName = path.posix.join(baseName)

      this.emitFile({
        fileName,
        type: 'asset',
        source: code
      })

      const workerOptions = { type: 'module' }
      return `export default function WorkerWrapper() {
        return new Worker(new URL('${baseName}', import.meta.url), ${JSON.stringify(workerOptions)})
      }`
    }
  }
}
