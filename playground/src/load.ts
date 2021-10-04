(async function () {
  Object.keys(
    (await import.meta.glob("../demos/**/*.html"))
  ).forEach(filename => {
    const absolutePath = filename.replace("../", "./")
    const dom = document.createElement("a")
    dom.href = absolutePath
    dom.innerHTML = absolutePath.split("/").pop()!.replace("/ui-elements/", "").replace(".html", "")
    document.body.appendChild(dom)
  })
})()
