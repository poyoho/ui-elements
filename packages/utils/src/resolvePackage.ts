export interface Package {
  name: string
  version: string
  types: string
  entry: string
}

// package.json
export interface PackageMetadata {
  name: string
  version: string
  types: string
  main: string
  module: string
  dependencies: Record<string, string>
}

export interface PacakgeVersions {
  tags: Record<string, string>
  versions: string[]
}

const url = (path: string) => `https://unpkg.com/${path}`

export async function resolvePackageMetadata(name: string, version: string): Promise<PackageMetadata | Error> {
  const response = await fetch(url(`${name}${version ? `@${version}` : ''}/package.json`))

  if (!response.ok)
    return new Error('Error Resolving Package Data')

  return await response.json()
}

export async function resolvePackageTypes(name: string, version: string, entry: string): Promise<string> {
  const response = await fetch(url(`${name}@${version}/${entry}`))

  if (!response.ok)
    return ''

  return await response.text()
}

export async function resolvePackage(name: string, version: string) {
  const packages: Package[] = []
  const metadata = await resolvePackageMetadata(name, version)

  if (!(metadata instanceof Error)) {
    const typesEntry = metadata.types
    const dependencies = Object.entries(metadata.dependencies || []).map(([name, version]) => ({ name, version }))
    // 递归加载所有依赖
    const resolvedDeps = await Promise.allSettled(dependencies.map(({ name, version }) => resolvePackage(name, version)))

    packages.push(
      {
        name: metadata.name,
        version: metadata.version,
        entry: metadata.module || metadata.main,
        types: typesEntry,
      },
      ...resolvedDeps
        .filter((result): result is PromiseFulfilledResult<Package[]> => result.status === 'fulfilled')
        .map(result => result.value)
        .flat(),
    )
  }

  return packages.filter((p, i) => packages.findIndex(x => x.name === p.name) === i)
}
