import fs from "fs"
import path from "path"
import { UserConfig } from "vite"

const entry = fs.readdirSync(path.resolve("./public/")).reduce((prev, filename) => {
  prev[filename.replace(".html", "")] = path.resolve("./public/", filename)
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
}

export default viteConfig
