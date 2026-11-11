export type GridColumns = 2 | 3 | 6 | 10

export interface SlotRect {
  column: number
  row: number
  width: number
  height: number
}

export interface ArtistPlacement extends SlotRect {
  id: string
}

export interface ArtistAnchor {
  id: string
  column: number
  row: number
}

export interface PosterLayout {
  columns: GridColumns
  rows: number
  artists: ArtistPlacement[]
  motifs: SlotRect[]
}

const intersects = (a: SlotRect, b: SlotRect) =>
  a.column < b.column + b.width && a.column + a.width > b.column
  && a.row < b.row + b.height && a.row + a.height > b.row

function startsForRow(columns: GridColumns, row: number): readonly number[] {
  if (columns === 2 || columns === 3) return row % 2 ? [] : [0]
  if (row % 2) return columns === 10 ? [2, 6] : [2]
  return columns === 10 ? [0, 4, 8] : [0, 4]
}

/** Pure slot geometry: information wins, and blocked starts never change parity. */
export function calculatePosterLayout(
  artistIds: readonly string[],
  columns: GridColumns,
  information: readonly SlotRect[] = [],
  anchors: readonly ArtistAnchor[] = [],
  artistStartRow = 0,
): PosterLayout {
  if (![2, 3, 6, 10].includes(columns)) throw new Error('Grid columns must be 2, 3, 6 or 10')
  if (!Number.isSafeInteger(artistStartRow) || artistStartRow < 0) {
    throw new Error('Invalid artist start row')
  }
  const artistWidth = columns === 3 ? 3 : 2
  if (artistIds.some(id => typeof id !== 'string' || !id.trim())
    || new Set(artistIds).size !== artistIds.length) {
    throw new Error('Artist IDs must be non-empty and unique')
  }
  for (const block of information) {
    if (![block.column, block.row, block.width, block.height].every(Number.isSafeInteger)
      || block.column < 0 || block.row < 0 || block.width < 1 || block.height < 1
      || block.column + block.width > columns) {
      throw new Error('Invalid information footprint')
    }
  }
  for (let index = 0; index < information.length; index++) {
    if (information.slice(index + 1).some(other => intersects(information[index], other))) {
      throw new Error('Information footprints overlap')
    }
  }

  const artists: ArtistPlacement[] = []
  for (const anchor of anchors) {
    const envelope = { ...anchor, width: artistWidth, height: 2 }
    if (!artistIds.includes(anchor.id) || !Number.isSafeInteger(anchor.column)
      || !Number.isSafeInteger(anchor.row) || anchor.row < artistStartRow
      || !startsForRow(columns, anchor.row).includes(anchor.column)
      || artists.some(artist => artist.id === anchor.id || intersects({ ...artist, height: 2 }, envelope))
      || information.some(block => intersects(block, envelope))) {
      throw new Error('Invalid artist anchor')
    }
    artists.push({ ...envelope, height: 1 })
  }
  const positioned = new Set(anchors.map(anchor => anchor.id))
  const remaining = artistIds.filter(id => !positioned.has(id))
  let nextArtist = 0
  for (let row = artistStartRow; nextArtist < remaining.length; row++) {
    for (const column of startsForRow(columns, row)) {
      const envelope = { column, row, width: artistWidth, height: 2 }
      if (information.some(block => intersects(block, envelope))
        || artists.some(artist => intersects({ ...artist, height: 2 }, envelope))) continue
      artists.push({ ...envelope, height: 1, id: remaining[nextArtist++] })
      if (nextArtist === remaining.length) break
    }
  }
  artists.sort((a, b) => a.row - b.row || a.column - b.column)
  const rows = Math.max(0,
    ...information.map(block => block.row + block.height),
    ...artists.map(artist => artist.row + 2),
  )
  const motifs: SlotRect[] = []
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const cell = { column, row, width: 1, height: 1 }
      if (information.some(block => intersects(block, cell))
        || artists.some(artist => intersects(artist, cell))) continue
      motifs.push(cell)
    }
  }
  return { columns, rows, artists, motifs }
}
