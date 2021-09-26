const express = require("express")
const path = require("path")
const app = express()
const server = require("http").createServer(app)
server.listen(80)
app.use('/ui-elements', express.static(path.resolve(__dirname, "../playground/dist/")))
app.get("/ui-elements", function (req, res) {
  res.sendfile(path.resolve(__dirname, "../playground/dist/index.html"))
})
console.log("localtion: http://localhost/ui-elements/");
