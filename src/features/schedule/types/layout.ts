import type { ScheduleEvent, ScheduleTrack } from './models'

export interface GridLayout {
  readonly timeSlots: ReadonlyArray<string>
  readonly trackSlots: ReadonlyArray<ScheduleTrack>
  readonly rows: ReadonlyArray<LayoutRow>
}

export interface LayoutRow {
  readonly trackId: string
  readonly cells: ReadonlyArray<LayoutCell>
}

export type LayoutCell = {
  readonly cell: number
  readonly data?: ScheduleEvent
}
