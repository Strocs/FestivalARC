import type { GridData, Row, Cell } from '../types/grid'
import type { Event } from '../types/models'
import { generateTimeSlots } from '../utils'
import type { ProcessedSchedule } from './schedule'

export function buildGridData(processed: ProcessedSchedule): GridData {
  const {
    startMinutes,
    endMinutes,
    intervalMinutes,
    sortedTracks,
    eventsByTrack,
  } = processed

  const timeSlots = generateTimeSlots(
    formatMinutesToTime(startMinutes),
    formatMinutesToTime(endMinutes),
    intervalMinutes,
  )

  const rows: Row[] = sortedTracks.map((track) => {
    const events = eventsByTrack.get(track.id) || []
    const cells = buildCells(events, startMinutes, endMinutes, intervalMinutes)

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
  events: ReadonlyArray<Event>,
  startMinutes: number,
  endMinutes: number,
  intervalMinutes: number,
): Cell[] {
  if (startMinutes >= endMinutes) return []

  const cells: Cell[] = []

  const addEmptyCell = (fromMin: number, toMin: number) => {
    const cellCount = (toMin - fromMin) / intervalMinutes
    if (cellCount > 0) {
      cells.push({ cell: cellCount })
    }
  }

  let cursor = startMinutes

  for (const event of events) {
    addEmptyCell(cursor, event.time.startMinutes)

    cells.push({
      cell: (event.time.endMinutes - event.time.startMinutes) / intervalMinutes,
      data: event,
    })

    cursor = event.time.endMinutes
  }

  addEmptyCell(cursor, endMinutes)

  return cells
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
