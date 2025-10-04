import type { ScheduleInput, GridData } from './types'
import { processSchedule } from './lib/schedule'
import { buildGridData } from './lib/grid'

export type { ScheduleInput, GridData, GridRow, GridCell, GridCategory, GridEvent } from './types'

export function createScheduleGrid(input: ScheduleInput): GridData {
  const processed = processSchedule(input)
  return buildGridData(processed)
}
