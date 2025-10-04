export interface Track {
  id: string
  name: string
  type?: string
  color: string
  order: number
}

export interface Event {
  id: string
  title: string
  subTitle: string
  description: string
  trackId: string
  time: {
    start: string | number
    end: string | number
  }
  metadata?: EventMetadata
}

export interface EventMetadata {
  gallery: {
    src: string
    alt: string
    width: number
    height: number
  }[]
  category: string
  duration?: string
  place?: string
}
