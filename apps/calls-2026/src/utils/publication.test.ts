import { describe, expect, it } from 'vitest'
import { createPublicationUrlTools } from './publication'

describe('temporary calls publication paths', () => {
  it.each([
    ['/', '/', '/calls-mark.svg'],
    ['/ediciones/2026', '/ediciones/2026/', '/ediciones/2026/calls-mark.svg'],
  ])('prefixes links and assets for %s', (base, home, asset) => {
    const urls = createPublicationUrlTools(base)
    expect(urls.publicPath('/')).toBe(home)
    expect(urls.publicPath('/calls-mark.svg')).toBe(asset)
    expect(urls.publicPath('/convocatoria')).toBe(`${base === '/' ? '' : base}/convocatoria`)
  })
})
