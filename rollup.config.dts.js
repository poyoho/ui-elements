const path =  require("path")
const resolve = (p) => path.resolve("./packages/ui-elements", p)
const pkg = require(resolve("package.json"))
const deps = Object.keys(pkg.dependencies || pkg.peerDependencies || {})

export default {
  input: resolve("index.ts"),
  output: {
    format: "es",
    dir: path.resolve("./libs"),
    paths(id) {
      if (id.startsWith("@ui-elements")) {
        return id.replace('@ui-elements', '..')
      }
    }
  },
  plugins: [
    require('@rollup/plugin-node-resolve').default({
      jsnext: true,
      main: true,
      browser: true,
    }),
    require("rollup-plugin-typescript2")({
      tsconfig: path.resolve("./tsconfig.json"),
      tsconfigOverride: {
        compilerOptions: {
          emitDeclarationOnly: true,
        },
        exclude: [
          "node_modules",
          "playground",
          "scripts",
          "libs",
          "*.js"
        ]
      }
    }),
    require("./scripts/plugins/rollup.worker")(),
    require("./scripts/plugins/rollup.raw")(),
    require("./scripts/plugins/rollup.url")(),
    require("./scripts/plugins/rollup.transform")(),
    require("@rollup/plugin-json")(),
  ],
  external (id) {
    return /^@ui-elements/.test(id)
      || deps.some(k => new RegExp('^' + k).test(id))
  },
}
