// Repository like to parse data from data-source to schedule input (Just an example, data can actually pass directly if came well )
import { createScheduleGrid, type ScheduleInput } from '@/features/schedule'
import rawData from './schedule.json'

interface RawScheduleData {
  timeSlot: {
    startTime: string
    endTime: string
    interval: number
  }
  categories: Array<{
    id: string
    name: string
    color: string
    order: number
  }>
  events: Array<{
    id: string
    title: string
    description: string
    categoryId: string
    startTime: string
    endTime: string
    metadata?: Record<string, unknown>
  }>
}

export function transformScheduleData(data: RawScheduleData): ScheduleInput {
  return {
    timeConfig: {
      startTime: data.timeSlot.startTime,
      endTime: data.timeSlot.endTime,
      intervalMinutes: data.timeSlot.interval
    },
    categories: data.categories,
    events: data.events
  }
}

export function getScheduleInput(): ScheduleInput {
  return transformScheduleData(rawData)
}

const scheduleInput = getScheduleInput();
export const gridData = createScheduleGrid(scheduleInput);
