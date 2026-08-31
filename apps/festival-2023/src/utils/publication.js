import { withPublicationBase } from './publication-path.js'

export const publicationBase = import.meta.env?.BASE_URL || '/'
export const withBase = (path) => withPublicationBase(path, publicationBase)
