;(async function () {
  Object.keys(
    (await import.meta.glob("../public/*.html"))
  ).forEach(filename => {
    const absolutePath = filename.replace("../public/", "/ui-elements/")
    const dom = document.createElement("a")
    dom.href = absolutePath
    dom.innerHTML = absolutePath.replace("/ui-elements/", "").replace(".html", "")
    document.body.appendChild(dom)
  })
})()

