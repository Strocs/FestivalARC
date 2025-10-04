// Repository like to parse data from data-source to schedule input (Just an example, data can actually pass directly if came well )
import { createScheduleGrid, type Event, type ScheduleInput, type Track } from '@/features/schedule'

import stages from './stages.json' with { type: 'json' }
import day1Config from './day1/config.json' with { type: 'json' }
import day2Config from './day2/config.json' with { type: 'json' }

import { day1Events } from './day1'
import { day2Events } from './day2'

interface Arc2025Data {
  time: {
    start: string
    end: string
    interval: number
  }
  stages: Track[]
  events: Event[]
}

export function Arc2025ScheduleRepository(data: Arc2025Data): ScheduleInput {
  // get data from data source and parse to ScheduleInput
  return {
    time: {
      start: data.time.start,
      end: data.time.end,
      intervalMinutes: data.time.interval
    },
    tracks: data.stages,
    events: data.events
  }
}

const scheduleDay1 = Arc2025ScheduleRepository({
  time: {
    start: day1Config.startTime,
    end: day1Config.endTime,
    interval: day1Config.scheduleInterval
  },
  stages: stages,
  events: day1Events
})

const scheduleDay2 = Arc2025ScheduleRepository({
  time: {
    start: day2Config.startTime,
    end: day2Config.endTime,
    interval: day2Config.scheduleInterval
  },
  stages: stages,
  events: day2Events
})


export const scheduleDay1GridData = createScheduleGrid(scheduleDay1);
export const scheduleDay2GridData = createScheduleGrid(scheduleDay2);
