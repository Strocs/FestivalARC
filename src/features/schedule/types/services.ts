export interface ScheduleInput {
  readonly timeConfig: {
    readonly startTime: string
    readonly endTime: string
    readonly intervalMinutes: number
  }
  readonly categories: ReadonlyArray<{
    readonly id: string
    readonly name: string
    readonly color: string
    readonly order: number
  }>
  readonly events: ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly description: string
    readonly categoryId: string
    readonly startTime: string
    readonly endTime: string
    readonly metadata?: Record<string, unknown>
  }>
}
