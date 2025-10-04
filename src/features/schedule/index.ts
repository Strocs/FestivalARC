import { processSchedule } from './lib/schedule'
import { buildGridData } from './lib/grid'
import type { ScheduleInput } from './types/services'
import type { GridData } from './types/grid'

export type { GridData, Row, Cell } from './types/grid'
export type { ScheduleInput } from './types/services'
export type { Event, Track, NormalizedEvent } from './types/models'

export function createScheduleGrid(input: ScheduleInput): GridData {
  const processed = processSchedule(input)
  return buildGridData(processed)
}
