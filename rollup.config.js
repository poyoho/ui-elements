const path = require("path")
const masterVersion = require('./package.json').version

const target = process.env.TARGET
const packageDir = path.resolve(__dirname, 'packages', target)
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))

export default {
  "monaco": () => createMonacoConfig()
}[target] || (() => createConfig())

function createConfig (options) {
  return {
    input: resolve("index.ts"),
    output: {
      format: "es",
      dir: path.resolve("libs", target),
      sourcemap: !!process.env.SOURCE_MAP,
      paths(id) {
        if (id.startsWith("@ui-elements")) {
          return id.replace('@ui-elements', '..')
        }
      },
    },
    plugins: [
      require('@rollup/plugin-node-resolve').default({
        jsnext: true,
        main: true,
        browser: true,
      }),
      require("rollup-plugin-esbuild")({
        tsconfig: path.resolve("./tsconfig.json"),
        exclude: [
          "node_modules",
          "__tests__",
        ]
      }),
      ...(options.plugins || []),
      require("./scripts/plugins/rollup.worker")(),
      require("./scripts/plugins/rollup.raw")(),
      require("./scripts/plugins/rollup.url")(),
      require("./scripts/plugins/rollup.transform")(),
      require("@rollup/plugin-json")(),
    ],
    external (id) {
      return /^@ui-elements/.test(id)
        || Object.keys(pkg.dependencies || pkg.peerDependencies || {}).some(k => new RegExp('^' + k).test(id))
        || options.external(id)
    },
  }
}

let count = 0
function createMonacoConfig () {
  const extractCSSName = "monaco-editor.css"
  return createConfig({
    plugins: [
      require("rollup-plugin-postcss")({
        extract: extractCSSName,
      }),
      require("./scripts/plugins/rollup.monacoCSS")({
        extract: extractCSSName
      }),
    ],
    external (id) {
      // for dev
      return count && Object.keys(pkg.devDependencies || {}).some(k => new RegExp('^' + k).test(id))
    }
  })
}
