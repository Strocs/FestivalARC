export interface ScheduleTrack<Payload = Record<string, unknown>> {
  id: string
  order: number
  payload?: Payload
}

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

export interface ScheduleTime<T = string> {
  start: T
  end: T
  intervalMinutes: number
}
