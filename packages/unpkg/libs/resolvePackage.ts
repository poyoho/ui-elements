import { parseSkypackDTSModule } from "@ui-elements/compile-module"

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

const formatName = (name: string) => name[0] === "/" ? name : `/${name}`
const formatVersion = (version?: string) => version ? "@"+version : ""

export const SKYPACK_RECOMMEND = (keyword: string) => `https://api.skypack.dev/v1/search?q=${keyword}&count=12`
export const SKYPACK_PACKAGEDATA = (pkgName: string) => `https://api.skypack.dev/v1/package/${pkgName}`
export const SKYPACK_CDN = (name: string, version?: string, params?: string) => `https://cdn.skypack.dev${formatName(name)}${formatVersion(version)}` + (params || "")
export const UNPKG_CDN = (name: string, version?: string, params?: string) => `https://unpkg.com/${formatName(name)}${formatVersion(version)}` + (params || "")

export async function resolvePackageTypes(name: string, version?: string): Promise<{filePath: string, content: string}[]> {
  const response = await fetch(SKYPACK_CDN(name, version, "?dts"))
  if (!response.ok) return []
  const respDTS = await fetch(SKYPACK_CDN(response.headers.get("x-typescript-types")!))
  if (!response.ok) return []
  const dtsScript = await respDTS.text()
  const allDTS = await parseSkypackDTSModule("vue", dtsScript, async (packageURI: string) => {
    // load deps packages dts
    const resp = await fetch(SKYPACK_CDN(packageURI))
    const dts = await resp.text()
    return Promise.resolve(dts)
  })
  return allDTS.reverse()
}

export async function resolveRecommendPackage (keyword: string) {
  if (!keyword) {
    return []
  }
  const response = await fetch(SKYPACK_RECOMMEND(keyword))
  if (!response.ok) {
    return []
  }
  const data = (await response.json()).results
  return data
}

export async function resolvePackageVersion (pkgName: string) {
  const response = await fetch(SKYPACK_PACKAGEDATA(pkgName))
  if (!response.ok) {
    return []
  }
  const data = (await response.json()).versions
  const versionList = Object.keys(data)
  return versionList.splice(versionList.length - 13).sort().reverse()
}

export async function resolvePackageMetadata(name: string, version: string): Promise<PackageMetadata> {
  const response = await fetch(SKYPACK_CDN(name, version, "?metadata"))
  if (!response.ok)
    throw new Error('Error Resolving Package Data')
  return await response.json()
}

async function resolvePackage(name: string, version: string) {
  const packages: Package[] = []
  const metadata = await resolvePackageMetadata(name, version)

  if (!(metadata instanceof Error)) {
    const typesEntry = metadata.types
    const dependencies = Object.entries(metadata.dependencies || []).map(([name, version]) => ({ name, version }))
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
