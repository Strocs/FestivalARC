import type { SlotRect } from './poster-grid'

export interface FilterGridGeometry {
  rect: DOMRect
  contentLeft: number
  contentTop: number
  columnWidth: number
  columnGap: number
  rowGap: number
  rowOffsets: number[]
}

const pixels = (value: string): number => /^\d+(?:\.\d+)?px$/.test(value) ? Number.parseFloat(value) : Number.NaN

export function resolvedFilterTracks(template: string, rows: number): number[] | undefined {
  if (rows === 0 && template === 'none') return []
  const tracks = template.replace(/\[[^\]]*\]/g, ' ').trim().split(/\s+/).map(pixels)
  return tracks.length === rows && tracks.every(Number.isFinite) ? tracks : undefined
}

/** Auto/minmax rows need resolved track sizes, not a uniform module. Read the
 * grid only, once per endpoint. Unsupported/unresolved tracks settle safely.
 */
export function readFilterGridGeometry(grid: HTMLElement, columns: number, rows: number): FilterGridGeometry | undefined {
  const bounds = grid.getBoundingClientRect()
  const style = getComputedStyle(grid)
  // Resolved CSSOM tracks are pixel lists, optionally interspersed with line
  // names. Do not interpret unresolved repeat()/minmax() as track dimensions.
  const tracks = resolvedFilterTracks(style.gridTemplateRows, rows)
  const borderLeft = pixels(style.borderLeftWidth)
  const borderRight = pixels(style.borderRightWidth)
  const borderTop = pixels(style.borderTopWidth)
  const borderBottom = pixels(style.borderBottomWidth)
  const paddingLeft = pixels(style.paddingLeft)
  const paddingRight = pixels(style.paddingRight)
  const paddingTop = pixels(style.paddingTop)
  const columnGap = style.columnGap === 'normal' ? 0 : pixels(style.columnGap)
  const rowGap = style.rowGap === 'normal' ? 0 : pixels(style.rowGap)
  const contentWidth = bounds.width - borderLeft - borderRight - paddingLeft - paddingRight
  const columnWidth = (contentWidth - columnGap * (columns - 1)) / columns
  if (!tracks || ![borderLeft, borderRight, borderTop, borderBottom,
    paddingLeft, paddingRight, paddingTop, columnGap, rowGap, columnWidth, bounds.left, bounds.top,
    bounds.width, bounds.height].every(Number.isFinite) || columnWidth <= 0) return undefined
  const rowOffsets = [0]
  for (const track of tracks) rowOffsets.push(rowOffsets[rowOffsets.length - 1] + track)
  // Absolute exits use the grid's padding box as their containing block.
  const rect = new DOMRect(bounds.left + borderLeft, bounds.top + borderTop,
    bounds.width - borderLeft - borderRight, bounds.height - borderTop - borderBottom)
  return { rect, contentLeft: rect.left + paddingLeft, contentTop: rect.top + paddingTop,
    columnWidth, columnGap, rowGap, rowOffsets }
}

export function filterCellRect(geometry: FilterGridGeometry, cell?: SlotRect): DOMRect | undefined {
  if (!cell) return undefined
  const top = geometry.rowOffsets[cell.row]
  const bottom = geometry.rowOffsets[cell.row + cell.height]
  if (top === undefined || bottom === undefined) return undefined
  return new DOMRect(geometry.contentLeft + cell.column * (geometry.columnWidth + geometry.columnGap),
    geometry.contentTop + top + cell.row * geometry.rowGap,
    cell.width * geometry.columnWidth + (cell.width - 1) * geometry.columnGap,
    bottom - top + (cell.height - 1) * geometry.rowGap)
}

/** Use motion's sampled translation, or legacy inline paint, without layout or
 * computed-style reads, including outgoing paint absent from the current plan.
 */
export function filterPaintRect(node: HTMLElement, base: DOMRect, previousGrid: DOMRect, grid: DOMRect, sample?: { x: number; y: number }): DOMRect {
  const translation = sample ? null : /^translate3d\(([-\d.e+]+)px,\s*([-\d.e+]+)px,\s*0(?:px)?\)$/.exec(node.style.transform)
  const x = sample?.x ?? (translation ? Number(translation[1]) : 0)
  const y = sample?.y ?? (translation ? Number(translation[2]) : 0)
  return new DOMRect(base.left + grid.left - previousGrid.left + x,
    base.top + grid.top - previousGrid.top + y, base.width, base.height)
}
