export interface ScheduleTrack<Payload = Record<string, unknown>> {
  id: string
  order: number
  payload?: Payload
}
