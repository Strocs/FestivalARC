import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistDetail from '../ArtistDetail.astro'
import { artists } from '../artists'

async function render(override: Record<string, unknown> = {}) {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistDetail, { props: { artist: { ...artists[0], ...override } } })
}

describe('artist detail', () => {
  it('renders real data with no invented image, description or activities', async () => {
    const html = await render()
    expect(html).toContain('Polter')
    expect(html).toContain('Música')
    expect(html).toContain('Sábado 28 · 23:00')
    expect(html).not.toContain('<img')
    expect(html).not.toMatch(/demostración|ejemplo|Actividades/i)
  })

  it('renders supplied descriptions and companies', async () => {
    const html = await render({ description: 'Artist biography', company: 'Company' })
    expect(html).toContain('Artist biography')
    expect(html).toContain('Company')
  })

  it('resolves a local asset through the glob for Astro Image', async () => {
    const html = await render({ image: { url: '/src/assets/branding/arc26-logo.png', alt: 'Test asset' } })
    expect(html).toContain('<img')
    expect(html).toContain('alt="Test asset"')
    expect(html).toMatch(/width="\d+"/)
    expect(html).toMatch(/height="\d+"/)
    expect(html).not.toContain('src="/src/assets/')
  })

  it('fails clearly rather than silently displaying a broken local image', async () => {
    await expect(render({ image: { url: '/src/assets/missing.jpg', alt: '' } }))
      .rejects.toThrow('Artist image does not exist in src/assets: /src/assets/missing.jpg')
  })
})
