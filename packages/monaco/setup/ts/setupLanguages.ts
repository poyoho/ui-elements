type monaco = typeof import("monaco-editor")

export function setupTypescriptLanguageService (monaco: monaco) {
  const localConfig = {
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowUnreachableCode: true,
    moduleResolution: 2,
    allowUnusedLabels: true,
    strict: false,
    allowJs: true,
    importHelpers: true,
    noImplicitUseStrict: false,
  }
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    ...localConfig,
  })
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    ...localConfig,
  })

  const packages = new Set<string>()

  return {
    hasDTS (name: string) {
      return packages.has(name)
    },

    addDTS (options: Array<{name: string, content: string}>) {
      const dts = options.reduce((prev, next) => {
        if (packages.has(next.name)) {
          return prev
        }
        const lib =  {
          filePath: next.name,
          content: `declare module '${next.name}' { ${next.content} } `
        }
        packages.add(next.name)
        prev.push(lib)
        return prev
      }, [] as {content: string}[])
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(dts)
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(dts)
    },

    deleteDTS (names: string[]) {
      const packages = monaco.languages.typescript.typescriptDefaults.getExtraLibs()
      names.forEach(name => {
        delete packages[name]
      })
      console.log(packages);

      // monaco.languages.typescript.typescriptDefaults.setExtraLibs(packages)
      // monaco.languages.typescript.javascriptDefaults.setExtraLibs(packages)
    }
  }
}
