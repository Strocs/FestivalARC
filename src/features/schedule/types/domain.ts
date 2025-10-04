export interface Category {
  id: string
  name: string
  color: string
  order: number
}
export interface Event {
  id: string
  title: string
  description: string
  categoryId: string
  startTime: string
  endTime: string
  metadata?: EventMetadata
}
export interface EventMetadata {
  [key: string]: unknown
}
