import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, it } from 'vitest'
import Footer from '../Footer.astro'

it('renders three official social links as accessible icons', async () => {
  const container = await AstroContainer.create()
  const html = await container.renderToString(Footer)
  expect(html).toMatch(/<h2\b[^>]*>Redes Sociales<\/h2>/)
  expect(html.indexOf('Redes Sociales')).toBeLessThan(html.indexOf('Logotipos de organizadores'))
  const links = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? []
  expect(links).toHaveLength(3)

  for (const [index, [label, href]] of [
    ['Instagram', 'https://www.instagram.com/festival_arc'],
    ['Facebook', 'https://www.facebook.com/FestivalARC'],
    ['X', 'https://x.com/FestivalARC'],
  ].entries()) {
    expect(links[index]).toContain(`aria-label="${label}"`)
    expect(links[index]).toContain(`href="${href}"`)
    expect(links[index]).toMatch(/>\s*<svg\b[\s\S]*?<\/svg>\s*<\/a>$/)
    expect(links[index]).not.toContain('<use')
    expect(links[index]).toContain('hover:text-accent')
    expect(links[index]).not.toContain('hover:bg-')
  }
})
