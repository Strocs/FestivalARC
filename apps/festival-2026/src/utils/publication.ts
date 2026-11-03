import type { PublicationBase } from '@festivalarc/editions'

export type PublicationUrlTools = Readonly<{
  base: PublicationBase
  publicPath: (pathname?: string) => string
}>

export function createPublicationUrlTools(value: string): PublicationUrlTools {
  const base = (value === '/' ? '/' : `/${value.replace(/^\/+|\/+$/g, '')}`) as PublicationBase
  const publicPath = (pathname = '/') => {
    const path = pathname === '/' ? '' : `/${pathname.replace(/^\/+/, '')}`
    return base === '/' ? path || '/' : `${base}${path || '/'}`
  }
  return { base, publicPath }
}

export const publication = createPublicationUrlTools(import.meta.env.BASE_URL || '/')
export const appBase = publication.base
export const publicPath = publication.publicPath
