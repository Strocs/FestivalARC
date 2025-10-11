export interface ScheduleEvent<Payload = Record<string, unknown>> {
  id: string
  trackId: string
  time: {
    start: string
    end: string
  }
  payload?: Payload
}

export interface NormalizedEvent {
  event: ScheduleEvent
  time: {
    start: number
    end: number
  }
}
