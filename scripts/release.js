const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const execa = require("execa")
const semver = require("semver")
const { prompt } = require("enquirer")
const args = require("minimist")(process.argv.slice(2))

const isDryRun = args.dry
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: "inherit", ...opts })
const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(" ")}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const step = msg => console.log(chalk.cyan(msg))

async function choiseTargetVersion () {
  const currentVersion = require(path.join(__dirname, "../package.json")).version
  const preId = semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]
  const inc = i => semver.inc(currentVersion, i, preId)

  const versionIncrements = [
    "patch",
    "minor",
    "major",
    ...(preId ? ["prepatch", "preminor", "premajor", "prerelease"] : [])
  ]

  // no explicit version, offer suggestions
  const { release } = await prompt({
    type: "select",
    name: "release",
    message: `Select release type`,
    choices: (versionIncrements.map(i => `${i} (${inc(i)})`)).concat(["custom"])
  })

  if (release === "custom") {
    targetVersion = (await prompt({
      type: "input",
      name: "version",
      message: `Input custom version`,
      initial: currentVersion
    })).version
  } else {
    targetVersion = release.match(/\((.*)\)/)[1]
  }

  const { yes } = await prompt({
    type: "confirm",
    name: "yes",
    message: `Releasing @v${targetVersion}. Confirm?`
  })

  if (!yes) {
    return
  }
  return targetVersion
}

async function main () {
  const targetVersion = await choiseTargetVersion()

  step("\nUpdating version...")
  const pkgPath = path.resolve(__dirname, "../package.json")
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  step("\nBuilding all packages...")

  try {
    await run("yarn", [`build`], {
      cwd: path.join(__dirname, ".."),
      stdio: "pipe"
    })
  } catch(e) {
    throw e
  }

  // publish packages
  step("\nPublishing packages...")
  pkg.private = false
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
  await runIfNotDry(
    "yarn",
    [
      "publish",
      "--new-version",
      targetVersion,
      "--access",
      "public"
    ],
    {
      cwd: path.join(__dirname, ".."),
      stdio: "pipe"
    }
  ).catch((e) => {
    throw e
  })
  pkg.private = true
  pkg.version = targetVersion
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
  console.log(chalk.green(`Successfully published @${targetVersion}`))
}

main()
