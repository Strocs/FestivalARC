export interface Arc2025Event {
  id: string
  title: string
  subTitle: string
  description: string
  trackId: string
  time: {
    start: string
    end: string
  }
  metadata: {
    category: string
    duration: string
    galleryUrl?: string
  }
}

export interface Arc2025Stage {
  id: string
  name: string
  color: string
  order: number
}
