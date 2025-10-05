import { buildScheduleLayout } from './lib/layout'
import { normalizeScheduleInput } from './lib/schedule'
import type { GridLayout } from './types/layout'
import type { ScheduleInput } from './types/services'

export type { GridLayout, LayoutCell, LayoutRow } from './types/layout'
export type { ScheduleInput, NormalizedScheduleInput } from './types/services'
export type {
  ScheduleEvent,
  ScheduleTrack,
  NormalizedEvent,
} from './types/models'

export function createScheduleLayout(input: ScheduleInput): GridLayout {
  const normalizedInput = normalizeScheduleInput(input)
  return buildScheduleLayout(normalizedInput)
}
