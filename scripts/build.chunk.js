const path =  require("path")
const rollup = require("rollup")
const esbuild = require("rollup-plugin-esbuild")
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const json = require("@rollup/plugin-json")
const rollupWorker = require("./plugins/rollup.worker")
const rollupRaw = require("./plugins/rollup.raw")
const rollupUrl = require("./plugins/rollup.url")
const rollupTransform = require("./plugins/rollup.transform")
const tsconfigPath = path.join(__dirname, "../tsconfig.json")
const packagePath = path.join(__dirname, "../packages/")
const { exit } = require("process")
const { convertCompilerOptionsFromJson } = require("typescript")

/**
 * build component by rollup
 * @param {string} pkgName
 */
module.exports = async function componentBuilder (pkgName) {
  const entry = path.resolve(packagePath, pkgName)
  const packageJSON = require(path.resolve(entry, "package.json"))
  const deps = Object.keys(
    Object.assign({}, packageJSON.dependencies || {}, packageJSON.peerDependencies || {})
  )
  const bundle = await rollup.rollup({
    input: path.resolve(entry, "index.ts"),
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      esbuild({
        tsconfig: tsconfigPath,
        exclude: [
          "node_modules",
          "__tests__",
        ]
      }),
      rollupWorker(),
      rollupRaw(),
      rollupUrl(),
      rollupTransform(),
      json(),
    ],
    external (id) {
      return /^@ui-elements/.test(id)
        || deps.some(k => new RegExp('^' + k).test(id))
    },
  }).catch(err => {
    console.log(err)
  })
  await bundle.write({
    format: "es",
    dir: path.resolve(__dirname, "..", "libs", pkgName),
    paths(id) {
      if (id.startsWith("@ui-elements")) {
        return id.replace('@ui-elements', '..')
      }
    },
  })
}
