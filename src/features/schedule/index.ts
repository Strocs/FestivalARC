import { buildScheduleLayout } from './lib/layout'
import { normalizeScheduleInput } from './lib/schedule'
import type { GridLayout } from './types/layout'
import type { ScheduleInput } from './types/services'

export type { GridLayout, LayoutEvent, LayoutEventGroup } from './types/layout'
export type { ScheduleInput, NormalizedScheduleInput } from './types/services'
export type {
  ScheduleEvent,
  ScheduleTrack,
  NormalizedEvent,
} from './types/models'
export type { EventGroup } from './lib/grouping'

export function createScheduleLayout<T, E>(
  input: ScheduleInput<T, E>,
): GridLayout<T, E> {
  const normalizedInput = normalizeScheduleInput(input as ScheduleInput)
  return buildScheduleLayout(normalizedInput) as GridLayout<T, E>
}
