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

  const packages = new Map<string, {
    content: string;
    filePath?: string;
  }>()

  return {
    addDTS (options: Array<{name: string, types: string}>) {
      options.forEach(opt => {
        if (packages.has(opt.name)) {
          return
        }
        const lib =  {
          content: `declare module '${opt.name}' { ${opt.types} } `
        }
        packages.set(opt.name, lib)
      })
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(Array.from(packages.values()))
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(Array.from(packages.values()))
    },
    deleteDTS (names: string[]) {
      names.forEach(name => {
        packages.delete(name)
      })
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(Array.from(packages.values()))
      monaco.languages.typescript.javascriptDefaults.setExtraLibs(Array.from(packages.values()))
    }
  }
}
