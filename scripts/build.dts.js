const path =  require("path")
const chalk = require("chalk")
const rollup = require("rollup")
const esbuild = require("rollup-plugin-esbuild")
const tsc = require("rollup-plugin-typescript2")
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const json = require("@rollup/plugin-json")
const rollupWorker = require("./rollup.worker")
const rollupTransform = require("./rollup.transform")
const tsconfigPath = path.join(__dirname, "../tsconfig.json")
const packagePath = path.join(__dirname, "../packages/")
const { getPackages } = require("@lerna/project")
const { exit } = require("process")
const _rm = require("rimraf")

function rm (dirOrFile) {
  return new Promise((resolve) => {
    _rm(dirOrFile, {}, () => {
      resolve()
    })
  })
}

module.exports = async function runBuild () {
  const entry = path.resolve(packagePath, "ui-elements")
  const deps = Object.keys(require(path.resolve(entry, "package.json")).dependencies || {})
  const bundle = await rollup.rollup({
    input: path.resolve(entry, "index.ts"),
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      tsc({
        tsconfig: tsconfigPath,
        tsconfigOverride: {
          compilerOptions: {
            emitDeclarationOnly: true,
          },
          exclude: [
            "node_modules",
            "playground"
          ]
        }
      }),
      rollupWorker(),
      rollupTransform(),
      json(),
    ],
    external (id) {
      return /^@ui-elements/.test(id)
        || deps.some(k => new RegExp('^' + k).test(id)) && !id.includes("monaco-editor/esm")
    },
  })
  await bundle.write({
    format: "es",
    dir: path.resolve(__dirname, "..", "lib"),
    paths(id) {
      if (id.startsWith("@ui-elements")) {
        return id.replace('@ui-elements', '..')
      }
    },
  })
  await rm(path.resolve(__dirname, "..", "lib/index.js"))
}
