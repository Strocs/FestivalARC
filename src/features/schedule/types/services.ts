import type {
  NormalizedEvent,
  ScheduleEvent,
  ScheduleTime,
  ScheduleTrack,
} from './models'

export interface ScheduleInput<
  TrackPayload = Record<string, unknown>,
  EventPayload = Record<string, unknown>,
> {
  readonly scheduleTime: ScheduleTime
  readonly tracks: ReadonlyArray<ScheduleTrack<TrackPayload>>
  readonly events: ReadonlyArray<ScheduleEvent<EventPayload>>
}

export interface NormalizedScheduleInput {
  readonly scheduleTime: ScheduleTime<number>
  readonly sortedTracks: ScheduleTrack[]
  readonly sortedEvents: Map<string, ReadonlyArray<NormalizedEvent>>
}
