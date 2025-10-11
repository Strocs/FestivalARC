import type { LayoutEvent, LayoutEventGroup } from '../../models/layout'
import type { ScheduleTrack } from '../../models/track'
import type { ScheduleData } from '../../core/schedule-data'
import type {
  UIColumn,
  UINestedColumn,
  UIColumnItem,
  UIGridLayout,
  UIHeaderItem,
} from '../types'

export type TrackPayloadMapper<TrackPayload> = (
  track: ScheduleTrack<TrackPayload>,
) => {
  id: string
  name: string
  color: string
  order: number
  category?: string
}

export type EventPayloadMapper<EventPayload> = (
  event: LayoutEvent<EventPayload>,
) => UIColumnItem

export function adaptScheduleDataToGrid<
  TrackPayload = Record<string, unknown>,
  EventPayload = Record<string, unknown>,
>(
  scheduleData: ScheduleData<TrackPayload, EventPayload>,
  mapTrack: TrackPayloadMapper<TrackPayload>,
  mapEvent: EventPayloadMapper<EventPayload>,
): UIGridLayout {
  const timeColumn = scheduleData.getTimeSlots()
  const columns = scheduleData.getColumns()
  const headerRow: UIHeaderItem[] = []

  const gridColumns = columns.map((column) => {
    const header = mapTrack(column.track)
    headerRow.push(header)
    return {
      header,
      column: column.events.map((item) => {
        if ('events' in item) {
          return adaptGroupEvent(item, mapEvent)
        }
        return adaptIndividualEvent(item, mapEvent)
      }),
    }
  })

  return { timeColumn, columns: gridColumns, headerRow }
}

// Position offset explanation:
// The core layer calculates positions starting from 0 (zero-based, array-like indexing).
// The UI grid has a header row at row 1, so data rows start at row 2.
// Therefore, we add +2 to convert: core position 0 → grid row 2 (first data row).
// For events inside groups, we only add +1 because the group's internal grid
// has no header row and uses 1-based indexing.

function adaptIndividualEvent<EventPayload>(
  event: LayoutEvent<EventPayload>,
  mapEvent: EventPayloadMapper<EventPayload>,
): UIColumn {
  return {
    type: 'individual',
    position: {
      start: event.position.start + 2,
      span: event.position.span,
    },
    columnData: mapEvent(event),
  }
}

function adaptGroupEvent<EventPayload>(
  group: LayoutEventGroup<EventPayload>,
  mapEvent: EventPayloadMapper<EventPayload>,
): UINestedColumn {
  return {
    type: 'group',
    position: {
      start: group.position.start + 2,
      span: group.position.span,
    },
    columnData: group.events.map((event) => ({
      position: {
        start: event.position.start + 1,
        span: event.position.span,
      },
      columnData: mapEvent(event),
    })),
  }
}
