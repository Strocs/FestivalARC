const LOCAL_PATH = /^(?:\/|[^/?#][^:]*$)/

export function withPublicationBase(path, base = '/') {
  if (typeof path !== 'string' || !path || path.startsWith('//') || !LOCAL_PATH.test(path)) return path

  const normalizedBase = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`
  const hashIndex = path.search(/[?#]/)
  const pathname = hashIndex === -1 ? path : path.slice(0, hashIndex)
  const suffix = hashIndex === -1 ? '' : path.slice(hashIndex)
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (!normalizedBase || normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`)) {
    return `${normalizedPath}${suffix}`
  }
  if (normalizedPath === '/') return `${normalizedBase}/${suffix}`
  return `${normalizedBase}${normalizedPath}${suffix}`
}
