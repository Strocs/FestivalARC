export interface Arc2025Event {
  id: string
  title: string
  subTitle: string
  description: string
  category: string
  duration?: string
  galleryUrl?: string
  time: {
    start: string
    end: string
  }
  trackId: string
}

export interface Arc2025Stage {
  id: string
  name: string
  color: string
  order: number
  category?: string
}

export type Arc2025EventPayload = Omit<Arc2025Event, 'id' | 'time' | 'trackId'>

export type Arc2025StagePayload = Omit<Arc2025Stage, 'id' | 'order'>
