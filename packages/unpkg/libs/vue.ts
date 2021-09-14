import { resolvePackageTypes } from "../resolvePackage";

export const vuePackages = [
  {
    name: "@vue/runtime-dom",
    types: await resolvePackageTypes("@vue/runtime-dom", "dist/runtime-dom.d.ts", "3.2.6")
  },
  {
    name: "@vue/runtime-core",
    types: await resolvePackageTypes("@vue/runtime-core", "dist/runtime-core.d.ts", "3.2.6")
  },
  {
    name: "@vue/reactivity",
    types: await resolvePackageTypes("@vue/reactivity", "dist/reactivity.d.ts", "3.2.6")
  },
  {
    name: "vue",
    types: await resolvePackageTypes("vue", "dist/vue.d.ts", "3.2.6")
  }
]
