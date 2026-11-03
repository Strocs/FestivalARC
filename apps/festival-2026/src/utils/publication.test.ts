import { describe, expect, it } from 'vitest'
import { createPublicationUrlTools } from './publication'

describe('temporary calls publication paths', () => {
  it.each([
    ['/', '/', '/favicon.png'],
    ['/ediciones/2026', '/ediciones/2026/', '/ediciones/2026/favicon.png'],
  ])('prefixes links and assets for %s', (base, home, asset) => {
    const urls = createPublicationUrlTools(base)
    expect(urls.publicPath('/')).toBe(home)
    expect(urls.publicPath('/favicon.png')).toBe(asset)
    expect(urls.publicPath('/resolucion-arc-2026.pdf')).toBe(`${base === '/' ? '' : base}/resolucion-arc-2026.pdf`)
  })
})
