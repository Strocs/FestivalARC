export interface ScheduleTime<T = string> {
  start: T
  end: T
  intervalMinutes: number
}
