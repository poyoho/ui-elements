const express = require("express")
const path = require("path")
const chalk = require("chalk")
const app = express()
const server = require("http").createServer(app)
server.listen(80)
app.use('/ui-elements', express.static(path.resolve(__dirname, "../playground/dist/")))
app.get("/ui-elements", function (req, res) {
  res.sendfile(path.resolve(__dirname, "../playground/dist/index.html"))
})
console.log(chalk.bgBlue("host"), chalk.green("http://localhost/ui-elements/"));
