import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const sprite = readFileSync(new URL('../poster-motifs.svg', import.meta.url), 'utf8')
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

describe('poster cyan orbits', () => {
  it('uses true circles and reuses one symmetric shape for both cyan contours', async () => {
    const orbits = sprite.match(/<symbol id="orbits-cyan"[^>]*>([\s\S]*?)<\/symbol>/)?.[1]
    expect(orbits).toBeDefined()
    expect(orbits!.match(/<circle\b/g)).toHaveLength(3)
    expect(orbits!.match(/<path\b/g)).toHaveLength(1)
    expect(orbits).toContain('rotate(90 50 50)')
    expect(orbits).toContain('href="#orbits-cyan-contour"')
    const pixels = await render(orbits!, 100, 100)
    const pixel = (x: number, y: number) => [...pixels.subarray((y * 100 + x) * 4, (y * 100 + x) * 4 + 4)]
    expect(pixel(0, 0)).toEqual([0, 255, 255, 255])
    expect(pixel(50, 50)).toEqual([255, 0, 138, 255])
    expect(pixel(50, 3)).toEqual([255, 0, 138, 255])
    expect(pixel(50, 8)).toEqual([0, 255, 255, 255])
    expect(pixel(50, 18)).toEqual([255, 0, 138, 255])
    expect(pixel(50, 24)).toEqual([0, 255, 255, 255])
  })

  it('widens the outer cyan band at the diagonal by reducing only the middle circle', async () => {
    const orbits = sprite.match(/<symbol id="orbits-cyan"[^>]*>([\s\S]*?)<\/symbol>/)?.[1]
    const pixels = await render(orbits!, 400, 400)
    for (const [x, y] of [[99, 111], [288, 99], [300, 288], [111, 300]]) {
      const offset = (y * 400 + x) * 4
      expect([...pixels.subarray(offset, offset + 4)]).toEqual([0, 255, 255, 255])
    }
  })

  it('keeps the tighter diagonal shoulders instead of inflating the upper sides', async () => {
    const orbits = sprite.match(/<symbol id="orbits-cyan"[^>]*>([\s\S]*?)<\/symbol>/)?.[1]
    const pixels = await render(orbits!, 400, 400)
    const pixel = (x: number, y: number) => [...pixels.subarray((y * 400 + x) * 4, (y * 400 + x) * 4 + 4)]
    // At this shoulder the original contour is magenta, not cyan.
    expect(pixel(108, 80)).toEqual([255, 0, 138, 255])
    expect(pixel(291, 80)).toEqual([255, 0, 138, 255])
  })
})

describe('poster rose orbits', () => {
  it('renders the approved cyan geometry with the rose palette', async () => {
    const cyan = sprite.match(/<symbol id="orbits-cyan"[^>]*>([\s\S]*?)<\/symbol>/)![1]
    const rose = sprite.match(/<symbol id="orbits-rose"[^>]*>([\s\S]*?)<\/symbol>/)![1]
    const expected = cyan.replaceAll('#00ffff', '#ff64cf').replaceAll('orbits-cyan-contour', 'orbits-rose-contour')
    const actualPixels = await render(rose, 400, 400)
    const expectedPixels = await render(expected, 400, 400)
    expect(actualPixels.equals(expectedPixels), 'rose palette with the approved orbit geometry').toBe(true)
  })
})

describe('poster concentric rings', () => {
  it.each([[160, 152], [640, 608]])('renders matching concentric families at %i × %i', async (width, height) => {
    const rings = sprite.match(/<symbol id="rings"[^>]*>([\s\S]*?)<\/symbol>/)![1]
    const radii = [35, 42, 49, 56.5, 64.5, 73, 82.5, 92]
    const widths = [0.7, 1.3, 1.9, 2.5, 3.2, 3.8, 4.4, 5]
    const circles = [-1.5, 214.5].map(cx => radii.map((r, index) =>
      `<circle cx="${cx}" cy="102" r="${r}" stroke-width="${widths[index]}"/>`,
    ).join('')).join('')
    const expected = `<rect width="100" height="100" fill="#ff008a"/><g transform="scale(0.469483568 0.492610837)" fill="none" stroke="#ff64cf" stroke-opacity="0.9">${circles}</g>`
    const actualPixels = await render(rings, width, height)
    const expectedPixels = await render(expected, width, height)
    expect(actualPixels.equals(expectedPixels), 'two matching concentric ring families').toBe(true)
  })
})

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
