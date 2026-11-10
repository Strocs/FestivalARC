import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8')

const components = [
  'components/Header.astro',
  'features/arc2026/components/ArtistDetail.astro',
  'features/arc2026/components/ArtistOverlay.astro',
] as const

describe('Tailwind shell presentation', () => {
  it.each(components)('%s has no local style block', path => {
    expect(source(path)).not.toMatch(/<style\b/i)
  })

  it('keeps the global entrypoint infrastructure-only', () => {
    const css = source('styles/global.css')
    const presentation = css
      .replace(/@(?:import|source)\s+[^;]+;/g, '')
      .replace(/@theme\s*\{[^}]*\}/g, '')
      .trim()
    expect(presentation).toBe('')
    expect(css).not.toContain('@apply')
  })

  it('retains Tailwind tokens and Astro font delivery', () => {
    const css = source('styles/global.css')
    expect(css).toContain("@import 'tailwindcss'")
    for (const token of ['background', 'foreground', 'primary', 'accent', 'arc-rose', 'arc-yellow']) {
      expect(css).toContain(`--color-${token}:`)
    }
    expect(css).toContain('--font-sans: var(--font-poppins), sans-serif')
    expect(css).toContain('--font-display: var(--font-anton), sans-serif')
    const document = source('layouts/Document.astro')
    expect(document).toContain("<Font cssVariable='--font-poppins' />")
    expect(document).toContain("<Font cssVariable='--font-anton' />")
  })

  it('retains dormant overlay identity and close contracts without integration', () => {
    const overlay = source('features/arc2026/components/ArtistOverlay.astro')
    expect(overlay).toMatch(/class='artist-overlay(?:\s|')/)
    expect(overlay).toContain('data-artist-url={publicPath(`/artistas/${artist.id}/`)}')
    expect(overlay).toContain('aria-labelledby={`overlay-${artist.id}`}')
    expect(overlay).toContain('autofocus data-close-artist')
    expect(overlay).toContain('headingId={`overlay-${artist.id}`} overlay')
    expect(source('pages/index.astro')).not.toMatch(/ArtistOverlay|enhance/)
  })
})
