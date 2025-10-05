import type {
  NormalizedEvent,
  ScheduleEvent,
  ScheduleTime,
  ScheduleTrack,
} from './models'

export interface ScheduleInput {
  readonly scheduleTime: ScheduleTime
  readonly tracks: ReadonlyArray<ScheduleTrack>
  readonly events: ReadonlyArray<ScheduleEvent>
}

export interface NormalizedScheduleInput {
  readonly scheduleTime: ScheduleTime<number>
  readonly sortedTracks: ReadonlyArray<ScheduleTrack>
  readonly eventsByTrack: Map<string, ReadonlyArray<NormalizedEvent>>
}
