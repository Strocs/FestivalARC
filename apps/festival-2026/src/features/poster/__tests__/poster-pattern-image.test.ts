// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import sprite from '../poster-motifs.svg?raw'
import { motifSequence, type PosterMotif } from '../poster'
import { createPosterPatternImage } from '../poster-pattern-image'

const parse = (xml: string) => new DOMParser().parseFromString(xml, 'image/svg+xml')

describe('isolated canonical motif documents', () => {
  it.each(motifSequence)('retains exact canonical definitions, dependencies and selected drawing for %s', motif => {
    const document = parse(createPosterPatternImage(motif))
    const root = document.documentElement
    expect(document.querySelector('parsererror')).toBe(null)
    expect(root.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(root.getAttribute('viewBox')).toBe('0 0 100 100')
    expect(root.getAttribute('preserveAspectRatio')).toBe('none')
    expect(root.querySelector('defs')!.outerHTML).toBe(parse(sprite).querySelector('defs')!.outerHTML)
    const drawing = root.lastElementChild!
    expect(drawing.tagName).toBe('use')
    expect(drawing.getAttribute('href')).toBe(`#${motif}`)
    expect(drawing.getAttribute('width')).toBe('100')
    expect(drawing.getAttribute('height')).toBe('100')
    for (const use of root.querySelectorAll('use')) {
      const href = use.getAttribute('href')!
      expect(href.startsWith('#')).toBe(true)
      expect(document.getElementById(href.slice(1))).not.toBe(null)
    }
    expect(root.querySelector('script, image, foreignObject')).toBe(null)
  })
  it('rejects identifiers outside the finite artwork before generating XML', () => {
    expect(() => createPosterPatternImage('bad"/><script/>' as PosterMotif)).toThrow('Unknown poster motif')
  })
})
