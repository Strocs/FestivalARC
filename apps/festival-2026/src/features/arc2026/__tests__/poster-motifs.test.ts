import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const sprite = readFileSync(new URL('../../../assets/arc2026/poster-motifs.svg', import.meta.url), 'utf8')
const lightning = sprite.match(/<symbol id="lightning"[^>]*>([\s\S]*?)<\/symbol>/)?.[1]

const render = (content: string, width: number, height: number) => sharp(Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${width}" height="${height}" preserveAspectRatio="none">${content}</svg>`,
)).ensureAlpha().raw().toBuffer()

const straightLightning = `
  <rect width="100" height="100" fill="#ff008a"/>
  <g fill="#00ffff">
    <polygon points="20,0 40,0 20,50"/>
    <polygon points="60,0 80,0 60,50"/>
    <polygon points="40,50 40,100 20,100"/>
    <polygon points="80,50 80,100 60,100"/>
  </g>
`

describe('poster lightning', () => {
  it.each([[160, 152], [640, 608]])('renders straight edges at %i × %i without changing the palette or arrangement', async (width, height) => {
    expect(lightning).toBeDefined()
    const actual = await render(lightning!, width, height)
    const expected = await render(straightLightning, width, height)
    let differentPixels = 0
    for (let offset = 0; offset < actual.length; offset += 4) {
      if (!actual.subarray(offset, offset + 4).equals(expected.subarray(offset, offset + 4))) differentPixels++
    }
    expect(differentPixels, 'pixels differing from the straight-sided lightning reference').toBe(0)
  })
})
