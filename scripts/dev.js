const execa = require('execa')
const { targets: allTargets, fuzzyMatchTarget, runParallel } = require('./utils')
const chalk = require("chalk")
const args = require('minimist')(process.argv.slice(2))

// params
const targets = args._
const sourceMap = args.sourcemap || args.s
const buildAllMatching = args.all || args.a

run()

async function run() {
  if (!targets.length) {
    await devAll(allTargets)
  } else {
    await devAll(fuzzyMatchTarget(targets, buildAllMatching))
  }
}

async function dev (target) {
  await execa(
    'rollup',
    [
      '-wc',
      '--environment',
      [
        `TARGET:${target}`,
        sourceMap ? `SOURCE_MAP:true` : ``
      ].filter(Boolean).join(',')
    ],
    {
      stdio: 'inherit'
    }
  )
}

async function devAll(targets) {
  await runParallel(require('os').cpus().length, targets, dev)
}
