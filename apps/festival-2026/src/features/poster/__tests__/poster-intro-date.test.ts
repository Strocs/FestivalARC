import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterIntro from '../PosterIntro.astro'

describe('PosterIntro dates', () => {
  it('renders both festival dates as semantic time elements without changing visible labels', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterIntro, {
      props: { mobile: { column: 0, row: 0, width: 4, height: 2 } },
    })
    expect(html).toContain('<time datetime="2026-11-28">28.11</time>')
    expect(html).toContain('<time datetime="2026-11-29">29.11</time>')
    expect(html).toContain('aria-label="28 y 29 de noviembre de 2026"')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('EL ')
    expect(html).toContain('DE HABITAR')
  })
})
