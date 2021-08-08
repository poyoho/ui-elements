// prefer old unicode hacks for backward compatibility
// https://base64.guru/developers/javascript/examples/unicode-strings
function utoa(data: string): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify({
    "App.vue": data
  }))))
}

function genVueSFCUrl(data: string): string {
  return `https://sfc.vuejs.org/#${utoa(data)}`
}

export function appendVueSFCPlaygroundCtrl(ctrlNode: HTMLDivElement, component: string) {
  const link = document.createElement("a")
  link.setAttribute("target", "_blank")
  link.className = "icon"
  link.href = genVueSFCUrl(component)
  link.textContent = "sfc"
  ctrlNode.append(link)
}
