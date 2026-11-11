import { describe, expect, it } from 'vitest'
import { calculatePosterLayout, type GridColumns, type SlotRect } from '../poster-grid'
import { lineup } from '../lineup'
import { posterPresets } from '../poster'

const ids = (count: number) => Array.from({ length: count }, (_, index) => `artist-${index}`)
const overlaps = (a: SlotRect, b: SlotRect) => a.column < b.column + b.width
  && a.column + a.width > b.column && a.row < b.row + b.height && a.row + a.height > b.row
const desktopTitle: SlotRect[] = [
  { column: 0, row: 0, width: 3, height: 4 },
  { column: 3, row: 1, width: 1, height: 2 },
]

describe('poster slot layout', () => {
  it('uses three proportional mobile slots with full-width artists', () => {
    const result = calculatePosterLayout(ids(4), 3)
    expect(result.columns).toBe(3)
    expect(result.artists.map(({ column, row, width, height }) => ({ column, row, width, height })))
      .toEqual([0, 2, 4, 6].map(row => ({ column: 0, row, width: 3, height: 1 })))
    for (const row of [1, 3, 5, 7]) {
      expect(result.motifs.filter(tile => tile.row === row))
        .toEqual([0, 1, 2].map(column => ({ column, row, width: 1, height: 1 })))
    }
  })

  it('starts the mobile artist sequence after two complete decorative rows below the hero', () => {
    const preset = posterPresets.mobile
    const result = calculatePosterLayout(lineup.map(artist => artist.id), preset.columns, preset.blocks, [], preset.artistStartRow)
    const hero = preset.blocks.find(block => block.id === 'hero')!
    expect(preset.columns).toBe(3)
    expect(hero).toMatchObject({ column: 0, row: 0, width: 3, height: 2 })
    expect(result.artists[0].row).toBe(hero.row + hero.height + 2)
    for (const row of [hero.row + hero.height, hero.row + hero.height + 1]) {
      expect(result.motifs.filter(tile => tile.row === row))
        .toEqual([0, 1, 2].map(column => ({ column, row, width: 1, height: 1 })))
    }
    expect(result.artists.map(artist => artist.id)).toEqual(lineup.map(artist => artist.id))
  })

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

  it.each([2, 3, 6, 10] as const)('keeps every lower reservation free at %i columns', columns => {
    const blocks = [{ column: 0, row: 8, width: 2, height: 2 }]
    const result = calculatePosterLayout(ids(17), columns, blocks)
    for (const artist of result.artists) {
      const envelope = { ...artist, height: 2 }
      expect(blocks.some(block => overlaps(block, envelope))).toBe(false)
      expect(result.artists.some(other => other !== artist && overlaps(other, envelope))).toBe(false)
      for (let column = artist.column; column < artist.column + artist.width; column++) {
        expect(result.motifs).toContainEqual({ column, row: artist.row + 1, width: 1, height: 1 })
      }
    }
  })

  it.each([-1, 0.5, Number.NaN])('rejects invalid artist start row %s without changing inputs', artistStartRow => {
    const artists = ids(2)
    const before = [...artists]
    expect(() => calculatePosterLayout(artists, 3, [], [], artistStartRow)).toThrow('Invalid artist start row')
    expect(artists).toEqual(before)
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
    const artistIds = lineup.map(artist => artist.id)
    for (const preset of Object.values(posterPresets)) {
      const before = structuredClone(preset)
      const result = calculatePosterLayout(artistIds, preset.columns, preset.blocks, [], preset.artistStartRow)
      expect(result.artists.map(({ id }) => id)).toEqual(artistIds)
      expect(result.artists).toHaveLength(lineup.length)
      expect(new Set(preset.blocks.map(({ id }) => id)).size).toBe(preset.blocks.length)
      for (const artist of result.artists) {
        expect(preset.blocks.some(block => overlaps(block, { ...artist, height: 2 }))).toBe(false)
      }
      expect(calculatePosterLayout(artistIds, preset.columns, preset.blocks, [], preset.artistStartRow)).toEqual(result)
      expect(preset).toEqual(before)
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
    ['unsupported columns', ['a'], 4, [], 'Grid columns must be 2, 3, 6 or 10'],
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

describe('configured artist identities', () => {
  it('provides unique valid IDs and nonempty names', () => {
    expect(lineup.length).toBeGreaterThan(0)
    expect(new Set(lineup.map(artist => artist.id)).size).toBe(lineup.length)
    for (const artist of lineup) {
      expect(artist.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(artist.name.trim().length).toBeGreaterThan(0)
    }
  })
})
