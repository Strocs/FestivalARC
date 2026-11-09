import { describe, expect, it } from 'vitest'
import { calculatePosterLayout, type GridColumns, type SlotRect } from '../lib/poster-grid'
import { lineup } from '../data/lineup'
import { posterPresets } from '../data/poster'

const ids = (count: number) => Array.from({ length: count }, (_, index) => `artist-${index}`)
const overlaps = (a: SlotRect, b: SlotRect) => a.column < b.column + b.width
  && a.column + a.width > b.column && a.row < b.row + b.height && a.row + a.height > b.row
const desktopTitle: SlotRect[] = [
  { column: 0, row: 0, width: 3, height: 4 },
  { column: 3, row: 1, width: 1, height: 2 },
]

describe('poster slot layout', () => {
  it.each([
    [10, [[0, 0], [4, 0], [8, 0], [2, 1], [6, 1], [0, 2], [4, 2], [8, 2]]],
    [6, [[0, 0], [4, 0], [2, 1], [0, 2], [4, 2], [2, 3], [0, 4], [4, 4]]],
    [2, [[0, 0], [0, 2], [0, 4], [0, 6], [0, 8], [0, 10], [0, 12], [0, 14]]],
  ] as const)('uses the exact cadence for %i columns', (columns, starts) => {
    const result = calculatePosterLayout(ids(8), columns)
    expect(result.artists.map(({ column, row }) => [column, row])).toEqual(starts)
    expect(result.artists.map(({ id }) => id)).toEqual(ids(8))
    expect(result.artists.every(({ width, height }) => width === 2 && height === 1)).toBe(true)
  })

  it('skips information obstacles without packing another column or restarting parity', () => {
    const blocks = [...desktopTitle, { column: 6, row: 5, width: 3, height: 2 }]
    const result = calculatePosterLayout(ids(11), 10, blocks)
    expect(result.artists.map(({ column, row }) => [column, row])).toEqual([
      [4, 0], [8, 0], [6, 1], [4, 2], [8, 2], [6, 3],
      [0, 4], [4, 4], [2, 5], [0, 6], [4, 6],
    ])
  })

  it.each([2, 6, 10] as const)('keeps every two-cell lower reservation free at %i columns', columns => {
    const blocks = [{ column: 0, row: 8, width: 2, height: 2 }]
    const result = calculatePosterLayout(ids(46), columns, blocks)
    for (const artist of result.artists) {
      const envelope = { ...artist, height: 2 }
      expect(blocks.some(block => overlaps(block, envelope))).toBe(false)
      expect(result.artists.some(other => other !== artist && overlaps(other, envelope))).toBe(false)
      for (const column of [artist.column, artist.column + 1]) {
        expect(result.motifs).toContainEqual({ column, row: artist.row + 1, width: 1, height: 1 })
      }
    }
  })

  it('grows only to contain information and reserved artist envelopes', () => {
    expect(calculatePosterLayout([], 10)).toEqual({ columns: 10, rows: 0, artists: [], motifs: [] })
    expect(calculatePosterLayout(ids(1), 10).rows).toBe(2)
    expect(calculatePosterLayout(ids(6), 10).rows).toBe(4)
    expect(calculatePosterLayout([], 10, [{ column: 0, row: 3, width: 2, height: 2 }]).rows).toBe(5)
  })

  it('fills every other cell exactly once, including lower reserves', () => {
    const blocks = desktopTitle
    const result = calculatePosterLayout(ids(12), 10, blocks)
    for (let row = 0; row < result.rows; row++) {
      for (let column = 0; column < result.columns; column++) {
        const cell = { column, row, width: 1, height: 1 }
        const owners = [...blocks, ...result.artists, ...result.motifs].filter(block => overlaps(block, cell))
        expect(owners, `${column},${row}`).toHaveLength(1)
      }
    }
  })

  it('honors explicit artist positions without changing the allowed cadence', () => {
    const result = calculatePosterLayout(ids(6), 10, desktopTitle, [{ id: 'artist-0', column: 0, row: 6 }])
    expect(result.artists.find(artist => artist.id === 'artist-0')).toMatchObject({ column: 0, row: 6 })
    expect(result.artists.find(artist => artist.id === 'artist-1')).toMatchObject({ column: 4, row: 0 })
    expect(new Set(result.artists.map(artist => artist.id)).size).toBe(6)
    const positioned = result.artists.find(artist => artist.id === 'artist-0')!
    for (const other of result.artists.filter(artist => artist !== positioned)) {
      expect(overlaps({ ...positioned, height: 2 }, other)).toBe(false)
    }
  })

  it.each([
    [{ id: 'unknown', column: 0, row: 4 }],
    [{ id: 'artist-0', column: 1, row: 4 }],
    [{ id: 'artist-0', column: 0, row: 0 }],
    [{ id: 'artist-0', column: 0, row: 4 }, { id: 'artist-1', column: 0, row: 4 }],
  ])('rejects invalid explicit positions without mutating them', (...anchors) => {
    const before = JSON.stringify(anchors)
    expect(() => calculatePosterLayout(ids(6), 10, desktopTitle, anchors)).toThrow('Invalid artist anchor')
    expect(JSON.stringify(anchors)).toBe(before)
  })

  it('provides valid information footprints for every responsive range', () => {
    expect(Object.values(posterPresets).map(preset => preset.columns)).toEqual([10, 6, 2])
    for (const preset of Object.values(posterPresets)) {
      const result = calculatePosterLayout(lineup.map(artist => artist.id), preset.columns, preset.blocks)
      expect(result.artists).toHaveLength(46)
      expect(result.rows).toBeGreaterThan(0)
    }
  })

  it('is deterministic and does not mutate frozen inputs', () => {
    const artists = Object.freeze(ids(6))
    const blocks = Object.freeze(desktopTitle.map(block => Object.freeze({ ...block })))
    const before = JSON.stringify({ artists, blocks })
    expect(calculatePosterLayout(artists, 10, blocks)).toEqual(calculatePosterLayout(artists, 10, blocks))
    expect(JSON.stringify({ artists, blocks })).toBe(before)
  })

  it.each([
    ['duplicate IDs', ['a', 'a'], 10, [], 'Artist IDs must be non-empty and unique'],
    ['blank ID', [' '], 10, [], 'Artist IDs must be non-empty and unique'],
    ['unsupported columns', ['a'], 4, [], 'Grid columns must be 2, 6 or 10'],
    ['outside columns', ['a'], 6, [{ column: 5, row: 0, width: 2, height: 1 }], 'Invalid information footprint'],
    ['negative row', ['a'], 6, [{ column: 0, row: -1, width: 2, height: 1 }], 'Invalid information footprint'],
    ['fractional size', ['a'], 6, [{ column: 0, row: 0, width: 2, height: 1.5 }], 'Invalid information footprint'],
    ['overlapping info', ['a'], 6, [{ column: 0, row: 0, width: 2, height: 2 }, { column: 1, row: 1, width: 2, height: 2 }], 'Information footprints overlap'],
  ])('rejects %s without changing input', (_, artists, columns, blocks, message) => {
    const before = JSON.stringify({ artists, blocks })
    expect(() => calculatePosterLayout(artists as string[], columns as GridColumns, blocks as SlotRect[])).toThrow(message as string)
    expect(JSON.stringify({ artists, blocks })).toBe(before)
  })
})

describe('confirmed artist roster', () => {
  it('retains 46 unique stable identities without creating demonstration bookings', () => {
    expect(lineup).toHaveLength(46)
    expect(new Set(lineup.map(artist => artist.id)).size).toBe(46)
    expect(lineup.filter(artist => artist.group === 'national')).toHaveLength(18)
    expect(lineup.filter(artist => artist.group === 'regional')).toHaveLength(12)
    expect(lineup.filter(artist => artist.group === 'stage')).toHaveLength(16)
    expect(lineup.filter(artist => artist.company)).toHaveLength(16)
    for (const artist of lineup) {
      expect(artist.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(Object.keys(artist).every(key => ['id', 'name', 'group', 'company'].includes(key))).toBe(true)
    }
    expect(lineup.find(artist => artist.id === 'nino-cohete')?.name).toBe('Niño Cohete')
    expect(lineup.find(artist => artist.id === 'innundaremos')?.name).toBe('Innundaremos')
    expect(lineup.find(artist => artist.id === 'lobas')?.company).toBe('Circo Kaleidoscopio')
    expect(lineup.find(artist => artist.id === 'trans-humante')?.company).toBe('Espacio La Isla (Ovalle)')
    expect(lineup.find(artist => artist.id === 'absurdo')?.company).toBe('Circo Kalendero')
  })
})
