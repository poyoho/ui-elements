const path = require('path')
const fs = require('fs-extra')
const args = require('minimist')(process.argv.slice(2))
const execa = require('execa')
const { targets: allTargets, fuzzyMatchTarget, runParallel } = require('./utils')

// params
const targets = args._
const sourceMap = args.sourcemap || args.s
const buildAllMatching = args.all || args.a

run()

async function run() {
  // build bundle
  if (!targets.length) {
    await buildAll(allTargets)
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching))
  }
  // build dts
  await execa(
    "rollup",
    [
      "-c",
      "./rollup.config.dts.js"
    ],
    { stdio: 'inherit' }
  )
  fs.remove("./libs/index.js")
}

async function build(target) {
  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `TARGET:${target}`,
        sourceMap ? `SOURCE_MAP:true` : ``
      ].filter(Boolean).join(',')
    ],
    { stdio: 'inherit' }
  )
}

async function buildAll(targets) {
  await runParallel(require('os').cpus().length, targets, build)
}
