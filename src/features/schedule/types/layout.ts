import type { ScheduleEvent, ScheduleTrack } from './models'

export interface GridLayout<
  TrackPayload = Record<string, unknown>,
  EventPayload = Record<string, unknown>,
> {
  readonly timeSlots: ReadonlyArray<string>
  readonly trackSlots: ScheduleTrack<TrackPayload>[]
  readonly eventsByTrack: Map<
    string,
    ReadonlyArray<LayoutEvent<EventPayload> | LayoutEventGroup<EventPayload>>
  >
}

export type LayoutEvent<EventPayload = Record<string, unknown>> = {
  readonly position: {
    start: number
    span: number
  }
  readonly event: ScheduleEvent<EventPayload>
}

export type LayoutEventGroup<EventPayload = Record<string, unknown>> = {
  readonly type: 'group'
  readonly position: {
    start: number
    span: number
  }
  readonly events: ReadonlyArray<{
    readonly position: {
      start: number
      span: number
    }
    readonly event: ScheduleEvent<EventPayload>
  }>
}
