const path =  require("path")
const chalk = require("chalk")
const rollup = require("rollup")
const esbuild = require("rollup-plugin-esbuild")
const tsc = require("rollup-plugin-typescript2")
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const json = require("@rollup/plugin-json")
const rollupWorker = require("./rollup.worker")
const rm = require("rimraf")
const tsconfigPath = path.join(__dirname, "../tsconfig.json")
const packagePath = path.join(__dirname, "../packages/")
const { getPackages } = require("@lerna/project")
const { exit } = require("process")

/**
 * build component by rollup
 * @param {string} pkgName
 */
async function componentBuilder (pkgName) {
  const entry = path.resolve(packagePath, pkgName)
  const deps = Object.keys(require(path.resolve(entry, "package.json")).dependencies || {})
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
      json(),
    ],
    external (id) {
      return /^@ui-elements/.test(id) && !["@ui-elements/utils"].includes(id)
        || deps.some(k => new RegExp('^' + k).test(id)) && !["monaco-editor/esm"].includes(id)
    },
  })
  await bundle.write({
    format: "es",
    dir: path.resolve(__dirname, "..", "lib", pkgName)
  })
}

async function runBuild () {
  const pkgs = (await getPackages())
    .map(pkg => pkg.name)
    .filter(name => !["ui-elements", "@ui-elements/utils"].includes(name))
    .map(name => name.replace("@ui-elements/", ""))

  for (const pkgName of pkgs) {
    console.log(pkgName)
    await componentBuilder(pkgName)
  }
}

runBuild()
