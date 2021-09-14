const path =  require("path")
const chalk = require("chalk")
const rollup = require("rollup")
const esbuild = require("rollup-plugin-esbuild")
const tsc = require("rollup-plugin-typescript2")
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const json = require("@rollup/plugin-json")
const rollupWorker = require("./plugins/rollup.worker")
const rollupRaw = require("./plugins/rollup.raw")
const rollupTransform = require("./plugins/rollup.transform")
const tsconfigPath = path.join(__dirname, "../tsconfig.json")
const packagePath = path.join(__dirname, "../packages/")
const { getPackages } = require("@lerna/project")
const { exit } = require("process")
const { importMetaAssets } = require("@web/rollup-plugin-import-meta-assets")
const { convertCompilerOptionsFromJson } = require("typescript")

/**
 * build component by rollup
 * @param {string} pkgName
 */
async function componentBuilder (pkgName) {
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
      rollupTransform(),
      json(),
      importMetaAssets({
        exclude: /\?worker|\?raw/
      }),
    ],
    external (id) {
      return /^@ui-elements/.test(id)
        || deps.some(k => new RegExp('^' + k).test(id)) && !id.includes("monaco-editor/esm")
    },
  }).catch(err => {
    console.log(err)
  })
  await bundle.write({
    format: "es",
    dir: path.resolve(__dirname, "..", "lib", pkgName),
    paths(id) {
      if (id.startsWith("@ui-elements")) {
        return id.replace('@ui-elements', '..')
      }
    },
  })
}

module.exports = async function runBuild () {
  const pkgs = (await getPackages())
    .map(pkg => pkg.name.replace("@ui-elements/", ""))
    // .filter(name => name !== "code-editor")

  for (const pkgName of pkgs) {
    console.log(pkgName)
    await componentBuilder(pkgName)
  }
}
