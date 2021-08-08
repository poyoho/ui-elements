const path =  require("path")
const chalk = require("chalk")
const rollup =  require("rollup")
const { nodeResolve } =  require("@rollup/plugin-node-resolve")
// const { terser } =  require("rollup-plugin-terser")
const commonjs =  require("rollup-plugin-commonjs")
const json =  require("@rollup/plugin-json")
const esbuild = require("rollup-plugin-esbuild")
const tsc =  require("rollup-plugin-typescript2")
const nodePolyfills = require("rollup-plugin-node-polyfills")
const rm = require("rimraf")
const pkg = require("../packages/compile/package.json")
const deps = Object.keys(pkg.dependencies)
const args = require("minimist")(process.argv.slice(2))


__dirname = path.join(__dirname, "../packages/compile/")
const tsconfigPath = path.join(__dirname, "tsconfig.json")

let _rollup_options = (_opt) => ({
  input: {
    input: path.join(__dirname, "src/index.ts"),
    plugins: [
      _opt.browser && nodePolyfills(),
      nodeResolve(),
      commonjs(),
      _opt.dts
        ? tsc({
          tsconfig: tsconfigPath,
          tsconfigOverride: {
            compilerOptions: {
              emitDeclarationOnly: true,
            },
          }
        })
        : esbuild({
          tsconfig: tsconfigPath,
          exclude: [
            "node_modules",
            "__tests__",
          ]
        }),
      json(),
    // terser(),
    ],
    external(id) {
    // 不打包deps的项目
      return deps.some(k => new RegExp("^" + k).test(id))
    },
  },
  output: {
    format: _opt.browser ? "es" : "cjs",
    file: _opt.browser
      ? path.join(__dirname, "/dist/browser.js")
      : path.join(__dirname, "/dist/node.js")

  }
})

async function buildNode(watch) {
  if (watch) {
    let opts = _rollup_options({ browser: false, dts: true })
    rollup.watch({ ...opts.input, output: opts.output, watch: { chokidar: true } })
    opts = _rollup_options({ browser: false, dts: false })
    rollup.watch({ ...opts.input, output: opts.output, watch: { chokidar: true } })
    console.log(chalk.green(`build ${watch} server`))
  } else {
    let opts = _rollup_options({ browser: false, dts: true })
    let bundle = await rollup.rollup(opts.input)
    await bundle.write(opts.output)
    opts = _rollup_options({ browser: false, dts: false })
    bundle = await rollup.rollup(opts.input)
    await bundle.write(opts.output)
    console.log(chalk.green("build nodejs"))
  }
}

async function buildBrowser(watch) {
  if (watch) {
    let opts = _rollup_options({ browser: true, dts: true })
    rollup.watch({ ...opts.input, output: opts.output, watch: { chokidar: true } })
    opts = _rollup_options({ browser: true, dts: false })
    rollup.watch({ ...opts.input, output: opts.output, watch: { chokidar: true } })
    console.log(chalk.green(`build ${watch} server`))
  } else {
    let opts = _rollup_options({ browser: true, dts: true })
    let bundle = await rollup.rollup(opts.input)
    await bundle.write(opts.output)
    opts = _rollup_options({ browser: true, dts: false })
    bundle = await rollup.rollup(opts.input)
    await bundle.write(opts.output)
    console.log(chalk.green("build browser"))
  }
}

async function rmDir(dir) {
  return new Promise((resolve) => {
    rm(dir, {}, () => {
      resolve()
    })
  })
}

async function main () {
  const watch = args.watch
  await rmDir(path.join(__dirname, "dist"))
  switch(watch) {
    case "browser":
      buildBrowser("browser")
      break
    case "node":
      buildNode("node")
      break
    case "all":
      buildBrowser("browser")
      buildNode("node")
      break
    default:
      buildBrowser()
      buildNode()
      break
  }
}

main()
