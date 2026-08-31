import { describe, expect, it } from 'vitest'

import { createPublicationMetadata, publicationUrl } from './index.js'
import { publicationBase } from '../../editions/src/index.js'

describe('publication metadata', () => {
  it('builds root URLs without a duplicate slash', () => {
    const metadata = createPublicationMetadata({
      siteOrigin: 'https://festivalarc.com',
      base: publicationBase('/'),
      pathname: '/programacion',
      title: 'Festival ARC',
      description: 'Annual programme',
      image: '/og.png',
    })

    expect(metadata.canonical).toBe('https://festivalarc.com/programacion')
    expect(metadata.openGraph.url).toBe(metadata.canonical)
    expect(metadata.twitter.image).toBe('https://festivalarc.com/og.png')
    expect(metadata.jsonLd.url).toBe(metadata.canonical)
    expect(metadata.sitemap).toBe('https://festivalarc.com/sitemap-index.xml')
  })

  it('keeps archive metadata and assets beneath the publication base', () => {
    const base = publicationBase('/ediciones/2024')
    const url = publicationUrl('https://festivalarc.com', base, '/programacion')
    const metadata = createPublicationMetadata({
      siteOrigin: 'https://festivalarc.com',
      base,
      pathname: '/programacion/',
      title: 'ARC 2024',
      image: '/social.png',
    })

    expect(url).toBe('https://festivalarc.com/ediciones/2024/programacion')
    expect(metadata.canonical).toBe(url)
    expect(metadata.openGraph.image).toBe(
      'https://festivalarc.com/ediciones/2024/social.png',
    )
  })

  it('supports an intentional cross-edition target when its base is explicit', () => {
    expect(
      publicationUrl(
        'https://festivalarc.com',
        publicationBase('/ediciones/2023'),
        '/',
      ),
    ).toBe('https://festivalarc.com/ediciones/2023')
  })
})
