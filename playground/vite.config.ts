import path from "path"
import { UserConfig } from "vite"

const viteConfig: UserConfig = {
  plugins: [
  ],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    }
  }
}

export default viteConfig
