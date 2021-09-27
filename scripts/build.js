const componentBuilder = require("./build.chunk")
const dtsBuilder = require("./build.dts")
const monacoEditorBuilder = require("./build.monaco-editor")
const { getPackages } = require("@lerna/project")
const chalk = require("chalk")

async function buildComponents () {
  const pkgs = (await getPackages())
    .map(pkg => pkg.name.replace("@ui-elements/", ""))
    .filter(pkg => pkg === "monaco")

  for (const pkgName of pkgs) {
    console.log(chalk.bgBlue("building package"), chalk.green(pkgName))
    if (pkgName === "monaco") {
      await monacoEditorBuilder(pkgName)
    } else {
      await componentBuilder(pkgName)
    }
    console.log(chalk.cyan("builded package", pkgName))
  }
}

function main () {
  // dtsBuilder()
  buildComponents()
}

main()
