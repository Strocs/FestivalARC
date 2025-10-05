export interface ScheduleTrack {
  id: string
  order: number
  payload?: {
    name: string
    color: string
  }
}

export interface ScheduleEvent {
  id: string
  trackId: string
  time: {
    start: string
    end: string
  }
  payload?: {
    title: string
    subTitle?: string
    description?: string
    category: string
    duration: string
    galleryUrl?: string
  }
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
