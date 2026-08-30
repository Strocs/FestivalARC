import type { NormalizedEvent, ScheduleEvent } from './event'
import type { ScheduleTime } from './time'
import type { ScheduleTrack } from './track'
import type { EventGroup } from '../core/layout/group-events'

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
  readonly sortedEvents: Map<
    string,
    ReadonlyArray<NormalizedEvent | EventGroup>
  >
}
