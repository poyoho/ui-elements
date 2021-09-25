import path from "path"
import { UserConfig } from "vite"

const viteConfig: UserConfig = {
  resolve: {
    alias: {
      // "@ui-elements": path.resolve("../packages/"),
      "@": path.resolve("./src"),
    }
  },
  base: "/ui-elements/",
}

export default viteConfig
