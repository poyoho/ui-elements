export function getShadowHost(el: HTMLElement) {
  const rootNode = el.getRootNode()
  if (!(rootNode instanceof ShadowRoot)) {
    return el
  }
  return rootNode.host
}
