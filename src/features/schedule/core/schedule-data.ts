import type {
  GridLayout,
  LayoutEvent,
  LayoutEventGroup,
} from '../models/layout'
import type { ScheduleTrack } from '../models/track'

export interface Column<
  TrackPayload = Record<string, unknown>,
  EventPayload = Record<string, unknown>,
> {
  track: ScheduleTrack<TrackPayload>
  events: ReadonlyArray<
    LayoutEvent<EventPayload> | LayoutEventGroup<EventPayload>
  >
}

export class ScheduleData<
  TrackPayload = Record<string, unknown>,
  EventPayload = Record<string, unknown>,
> {
  constructor(private layout: GridLayout<TrackPayload, EventPayload>) {}

  getTimeSlots(): ReadonlyArray<string> {
    return this.layout.timeSlots
  }

  getTracks(): ReadonlyArray<ScheduleTrack<TrackPayload>> {
    return this.layout.trackSlots
  }

  getEventsByTrack(
    trackId: string,
  ): ReadonlyArray<LayoutEvent<EventPayload> | LayoutEventGroup<EventPayload>> {
    return this.layout.eventsByTrack.get(trackId) ?? []
  }

  getColumns(): ReadonlyArray<Column<TrackPayload, EventPayload>> {
    return this.getTracks().map((track) => ({
      track,
      events: this.getEventsByTrack(track.id),
    }))
  }
}
