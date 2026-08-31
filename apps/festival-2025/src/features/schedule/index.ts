import { buildScheduleLayout } from './core/layout/build-layout'
import { normalizeScheduleInput } from './core/layout/normalize-schedule'
import { ScheduleData } from './core/schedule-data'
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
export type { Column } from './core/schedule-data'

export type {
  UIGridLayout,
  UIColumn,
  UINestedColumn,
  UIHeaderItem,
  UIColumns,
  UIColumnItem,
  UIScheduleDay,
} from './ui/types'

export type {
  TrackPayloadMapper,
  EventPayloadMapper,
} from './ui/adapters/grid-adapter'

export function createScheduleLayout<T, E>(
  input: ScheduleInput<T, E>,
): GridLayout<T, E> {
  const normalizedInput = normalizeScheduleInput(input as ScheduleInput)
  return buildScheduleLayout(normalizedInput) as GridLayout<T, E>
}

export function createScheduleData<T, E>(
  input: ScheduleInput<T, E>,
): ScheduleData<T, E> {
  const layout = createScheduleLayout(input)
  return new ScheduleData(layout)
}

export { ScheduleData } from './core/schedule-data'
export { adaptScheduleDataToGrid } from './ui/adapters/grid-adapter'
export { ScheduleLayout } from './ui/components/grid/ScheduleLayout'
