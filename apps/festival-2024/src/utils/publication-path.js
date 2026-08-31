const runtimeBase = import.meta.env?.BASE_URL || '/'

export const publicationBase = runtimeBase

const isExternalReference = (value) =>
  value.startsWith('#') ||
  value.startsWith('//') ||
  /^[a-z][a-z\d+.-]*:/i.test(value)

export function withPublicationBase(path, base = publicationBase) {
  if (!path || isExternalReference(path)) return path

  const prefix = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`
  const localPath = path.startsWith('/') ? path : `/${path}`

  if (prefix && (localPath === prefix || localPath.startsWith(`${prefix}/`))) {
    return localPath
  }

  return `${prefix}${localPath}` || '/'
}

export function publicationUrl(path, base = publicationBase, siteOrigin = 'https://festivalarc.com') {
  return new URL(withPublicationBase(path, base), siteOrigin).href
}

export function isPublicationHome(pathname, base = publicationBase) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}`
  return normalizedPath === normalizedBase
}

export const withBase = withPublicationBase
