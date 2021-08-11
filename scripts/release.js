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
  async function chooseVersion(pkg) {
    let targetVersion
    const currentVersion = require(path.join(__dir, pkg, "package.json")).version
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
      message: `Select ${pkg} release type`,
      choices: (versionIncrements.map(i => `${i} (${inc(i)})`)).concat(["custom"])
    })

    if (release === "custom") {
      targetVersion = (await prompt({
        type: "input",
        name: "version",
        message: `Input ${pkg} custom version`,
        initial: currentVersion
      })).version
    } else {
      targetVersion = release.match(/\((.*)\)/)[1]
    }

    const { yes } = await prompt({
      type: "confirm",
      name: "yes",
      message: `Releasing ${pkg}@v${targetVersion}. Confirm?`
    })

    if (!yes) {
      return
    }
    return targetVersion
  }

  const __dir = path.join(__dirname, "../packages")
  const packages = fs.readdirSync(__dir)

  const { pkg } = await prompt({
    type: "select",
    name: "pkg",
    message: "Select release package",
    choices: [...packages, "all"]
  })
  const targetVersion = []
  if (pkg === "all") {
    for(let i = 0; i < packages.length; i++) {
      const ver = await chooseVersion(packages[i])
      ver && targetVersion.push({
        pkg: packages[i],
        ver: ver,
      })
    }
  } else {
    const ver = await chooseVersion(pkg)
    ver && targetVersion.push({
      pkg: pkg,
      ver: ver,
    })
  }
  return targetVersion
}

async function main () {
  const targetVersions = await choiseTargetVersion()

  step("\nUpdating version...")
  targetVersions.forEach(target => {
    const pkgPath = path.resolve(__dirname, "../package.json")
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
    pkg.version = target.ver
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
  })

  step("\nBuilding all packages...")
  targetVersions.forEach(async target => {

    try {
      await run("yarn", [`build:${target.pkg}`], {
        cwd: path.join(__dirname, ".."),
        stdio: "pipe"
      })
    } catch(e) {
      console.log(e)
    }

    // publish packages
    step("\nPublishing packages...")
    await runIfNotDry(
      "yarn",
      [
        "publish",
        "--new-version",
        target.ver,
        "--access",
        "public"
      ],
      {
        cwd: path.join(__dirname, "../packages/", target.pkg),
        stdio: "pipe"
      }
    )
    console.log(chalk.green(`Successfully published ${target.pkg}@${target.ver}`))
  })

}

main()
