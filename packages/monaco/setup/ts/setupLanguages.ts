type monaco = typeof monaco

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

    addDTS (options: Array<{filePath: string, content: string}>) {
      options.forEach((option) => packages.add(option.filePath))
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(options)
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(options)
    },

    deleteDTS (names: string[]) {
      const packages = monaco.languages.typescript.typescriptDefaults.getExtraLibs()
      names.forEach(name => {
        delete packages[name]
      })
      console.log(packages)

      // monaco.languages.typescript.typescriptDefaults.setExtraLibs(packages)
      // monaco.languages.typescript.javascriptDefaults.setExtraLibs(packages)
    }
  }
}
