import type { GridLayout, LayoutCell, LayoutRow } from '../types/layout'
import type { NormalizedEvent, ScheduleTime } from '../types/models'
import type { NormalizedScheduleInput } from '../types/services'
import { calculateOcuppiedCells, generateTimeSlots } from '../utils'

export function buildScheduleLayout(
  normalizedInput: NormalizedScheduleInput,
): GridLayout {
  const { scheduleTime, sortedTracks, eventsByTrack } = normalizedInput

  const timeSlots = generateTimeSlots(
    scheduleTime.start,
    scheduleTime.end,
    scheduleTime.intervalMinutes,
  )

  const rows: LayoutRow[] = sortedTracks.map((track) => {
    const events = eventsByTrack.get(track.id) || []
    const cells = buildCells(events, scheduleTime)

    return {
      trackId: track.id,
      cells,
    }
  })

  return {
    timeSlots,
    trackSlots: sortedTracks,
    rows,
  }
}

function buildCells(
  normalizedEvents: ReadonlyArray<NormalizedEvent>,
  { start, end, intervalMinutes }: ScheduleTime<number>,
): LayoutCell[] {
  if (start >= end) return []

  const cells: LayoutCell[] = []

  const addEmptyCell = (fromMin: number, toMin: number) => {
    const cellCount = calculateOcuppiedCells(fromMin, toMin, intervalMinutes)
    if (cellCount > 0) {
      cells.push({ cell: cellCount })
    }
  }

  let cursor = start

  for (const { event, time } of normalizedEvents) {
    addEmptyCell(cursor, time.start)

    cells.push({
      cell: calculateOcuppiedCells(time.start, time.end, intervalMinutes),
      data: event,
    })

    cursor = time.end
  }

  addEmptyCell(cursor, end)

  return cells
}
