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
      "@ui-elements": path.resolve("../libs/"),
      "@": path.resolve("./src"),
    }
  },
  build: {
    rollupOptions: {
      input: entry
    },
  },
  base: "/ui-elements/",
}

export default viteConfig
