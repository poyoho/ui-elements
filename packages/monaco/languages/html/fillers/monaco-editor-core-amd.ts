// Resolves with the global monaco API

declare let define: any

define([], () => {
  return (<any>self).monaco
})
