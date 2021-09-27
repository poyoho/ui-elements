import fs from "fs"
import path from "path"
import { UserConfig } from "vite"

const entry = fs.readdirSync(path.resolve("./demos/")).reduce((prev, filename) => {
  prev[filename.replace(".html", "")] = path.resolve("./demos/", filename, filename+".html")
  return prev
}, {})
entry.index = path.resolve("./index.html")

const viteConfig: UserConfig = {
  resolve: {
    alias: {
      "@ui-elements": path.resolve("../packages/"),
      "@": path.resolve("./src"),
    }
  },
  build: {
    rollupOptions: {
      input: entry
    },
  },
  base: "/ui-elements/",
  css: {
    modules: {
      scopeBehaviour: "global"
    }
  }
}

export default viteConfig
