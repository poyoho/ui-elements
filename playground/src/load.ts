;(async function () {
  Object.keys(
    (await import.meta.glob("../public/*.html"))
  ).forEach(filename => {
    const absolutePath = filename.replace("../public/", "./")
    const dom = document.createElement("a")
    dom.href = absolutePath
    dom.innerHTML = absolutePath.replace("./", "").replace(".html", "")
    document.body.appendChild(dom)
  })
})()

