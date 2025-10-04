import type { Event, Track } from './models'

export interface ScheduleInput {
  readonly time: {
    readonly start: string | number
    readonly end: string | number
    readonly intervalMinutes: number
  }

  readonly tracks: ReadonlyArray<Track>
  readonly events: ReadonlyArray<Event>
}
