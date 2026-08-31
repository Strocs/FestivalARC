import type {
  PublicationBase,
  PublicationConfig,
} from '@festivalarc/editions'

function normalizeBase(value: string): PublicationBase {
  const normalized = `/${value.replace(/^\/+|\/+$/g, '')}`
  return (normalized === '/' ? '/' : normalized) as PublicationBase
}

export type PublicationUrlTools = Readonly<{
  base: PublicationBase
  publicPath: (pathname?: string) => string
  routePath: (pathname: string) => string
  assetPath: (pathname: string) => string
}>

export function createPublicationUrlTools(base: string): PublicationUrlTools {
  const appBase = normalizeBase(base)
  const publicPath = (pathname = '/'): string => {
    const path = pathname === '/' ? '' : `/${pathname.replace(/^\/+/, '')}`
    return appBase === '/' ? path || '/' : path ? `${appBase}${path}` : `${appBase}/`
  }
  const routePath = (pathname: string): string => {
    const path = pathname || '/'
    if (appBase === '/' || path === appBase) return path === appBase ? '/' : path
    return path.startsWith(`${appBase}/`) ? path.slice(appBase.length) : path
  }
  return { base: appBase, publicPath, routePath, assetPath: publicPath }
}

export const publicationUrls = createPublicationUrlTools(
  import.meta.env.BASE_URL || '/',
)
export const appBase = publicationUrls.base
export const publicPath = publicationUrls.publicPath
export const routePath = publicationUrls.routePath
export const assetPath = publicationUrls.assetPath

export type EditionTarget = Readonly<{
  id: string
  year: number
  label: string
  href: string
}>

export function publicationTargets(
  config: PublicationConfig,
): readonly EditionTarget[] {
  const publications = [
    { publication: config.active, base: '/' as PublicationBase },
    ...config.archives.map((publication) => ({
      publication,
      base: publication.base,
    })),
  ]

  return publications
    .sort((left, right) => right.publication.year - left.publication.year)
    .map(({ publication, base }) => ({
      id: publication.id,
      year: publication.year,
      label: publication.kind === 'calls'
        ? `Convocatoria ${publication.year}`
        : `Festival ARC ${publication.year}`,
      href: base === '/' ? '/' : `${base}/`,
    }))
}
