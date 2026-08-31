import { describe, expect, it } from 'vitest'
import { validatePublicationConfig } from '@festivalarc/editions'
import {
  createPublicationUrlTools,
  publicationTargets,
} from './publication'

describe('publication URL tools', () => {
  it('keeps root links compatible with the existing publication', () => {
    const urls = createPublicationUrlTools('/')

    expect(urls.publicPath('/')).toBe('/')
    expect(urls.publicPath('/programacion')).toBe('/programacion')
    expect(urls.publicPath('/programacion/')).toBe('/programacion/')
    expect(urls.routePath('/programacion')).toBe('/programacion')
  })

  it('prefixes assets, nested routes, and trailing slashes for an archive', () => {
    const urls = createPublicationUrlTools('/ediciones/2025')

    expect(urls.publicPath('/')).toBe('/ediciones/2025/')
    expect(urls.assetPath('/fonts/NerisLight.woff2')).toBe(
      '/ediciones/2025/fonts/NerisLight.woff2',
    )
    expect(urls.publicPath('/programacion/')).toBe(
      '/ediciones/2025/programacion/',
    )
    expect(urls.routePath('/ediciones/2025/programacion')).toBe(
      '/programacion',
    )
  })

  it('creates typed dropdown targets from active and archive publications', () => {
    const config = validatePublicationConfig(
      {
        schemaVersion: 1,
        siteOrigin: 'https://festivalarc.com',
        active: {
          kind: 'final',
          id: 'festival-2025',
          year: 2025,
          packageName: 'festivalarc-2025',
        },
        archives: [
          {
            kind: 'final',
            id: 'festival-2024',
            year: 2024,
            packageName: 'festivalarc-2024',
            base: '/ediciones/2024',
          },
        ],
        global: {
          notFound: 'distribution',
          robots: 'distribution',
          sitemap: 'distribution',
        },
      },
      { knownWorkspacePackages: ['festivalarc-2025', 'festivalarc-2024'] },
    )

    expect(publicationTargets(config)).toEqual([
      { id: 'festival-2025', year: 2025, label: 'Festival ARC 2025', href: '/' },
      {
        id: 'festival-2024',
        year: 2024,
        label: 'Festival ARC 2024',
        href: '/ediciones/2024/',
      },
    ])
  })
})
