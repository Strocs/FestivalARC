import {
  configurationDigest,
  configurationDigestInput,
  validatePublicationConfig,
} from '@festivalarc/editions'

const rawPublicationConfig = {
  schemaVersion: 1,
  siteOrigin: 'https://festivalarc.com',
  active: {
    kind: 'calls',
    id: 'calls-2026',
    year: 2026,
    packageName: 'calls-2026',
    expiresWhenFinalPublished: true,
  },
  archives: [{
    kind: 'final',
    id: 'festival-2023',
    year: 2023,
    packageName: 'festival-arc-2023',
    base: '/ediciones/2023',
  }, {
    kind: 'final',
    id: 'festival-2024',
    year: 2024,
    packageName: 'festival-arc-2024',
    base: '/ediciones/2024',
  }, {
    kind: 'final',
    id: 'festival-2025',
    year: 2025,
    packageName: 'festivalarc-2025',
    base: '/ediciones/2025',
  }],
  global: {
    notFound: 'distribution',
    robots: 'distribution',
    sitemap: 'distribution',
  },
} as const

export const publicationConfig = validatePublicationConfig(
  rawPublicationConfig,
  {
    knownWorkspacePackages: ['festivalarc-2025', 'festival-arc-2023', 'festival-arc-2024', 'calls-2026'],
  },
)

export const publicationConfigDigestInput =
  configurationDigestInput(publicationConfig)
export const publicationConfigDigest = configurationDigest(publicationConfig)
export default publicationConfig
