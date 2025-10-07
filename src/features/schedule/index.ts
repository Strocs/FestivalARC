import { buildScheduleLayout } from './core/layout/build-layout'
import { normalizeScheduleInput } from './core/layout/normalize-schedule'
import type { GridLayout } from './models/layout'
import type { ScheduleInput } from './models/schedule-input'

export type { GridLayout, LayoutEvent, LayoutEventGroup } from './models/layout'
export type {
  ScheduleInput,
  NormalizedScheduleInput,
} from './models/schedule-input'
export type { ScheduleEvent, NormalizedEvent } from './models/event'
export type { ScheduleTrack } from './models/track'
export type { EventGroup } from './core/layout/group-events'

export function createScheduleLayout<T, E>(
  input: ScheduleInput<T, E>,
): GridLayout<T, E> {
  const normalizedInput = normalizeScheduleInput(input as ScheduleInput)
  return buildScheduleLayout(normalizedInput) as GridLayout<T, E>
}

export { ScheduleGrid } from './ui/components/grid/ScheduleGrid'
