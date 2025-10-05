// Repository like to parse data from data-source to schedule input (Just an example, data can actually pass directly if came well )

import stages from './stages.json' with { type: 'json' }
import day1Config from './day1/config.json' with { type: 'json' }
import day2Config from './day2/config.json' with { type: 'json' }

import { day1Events } from './day1'
import { day2Events } from './day2'
import type { Arc2025Event, Arc2025Stage } from '../types'
import { createScheduleLayout, type ScheduleInput } from '@/features/schedule'

interface Arc2025Data {
  time: {
    start: string
    end: string
    interval: number
  }
  stages: Arc2025Stage[]
  events: Arc2025Event[]
}

export function mapArc2025DataToScheduleInput(
  data: Arc2025Data,
): ScheduleInput {
  // get data from data source and parse to ScheduleInput
  return {
    scheduleTime: {
      start: data.time.start,
      end: data.time.end,
      intervalMinutes: data.time.interval,
    },
    tracks: data.stages.map((stage) => ({
      id: stage.id,
      order: stage.order,
      payload: {
        name: stage.name,
        color: stage.color,
      },
    })),
    events: data.events.map((event) => ({
      id: event.id,
      trackId: event.trackId,
      time: {
        start: event.time.start,
        end: event.time.end,
      },
      payload: {
        title: event.title,
        subTitle: event.subTitle,
        description: event.description,
        category: event.metadata.category,
        duration: event.metadata.duration,
        galleryUrl: event.metadata.galleryUrl,
      },
    })),
  } satisfies ScheduleInput
}

const arc2025Day1InputData = mapArc2025DataToScheduleInput({
  time: {
    start: day1Config.startTime,
    end: day1Config.endTime,
    interval: day1Config.scheduleInterval,
  },
  stages: stages,
  events: day1Events,
})

const arc2025Day2InputData = mapArc2025DataToScheduleInput({
  time: {
    start: day2Config.startTime,
    end: day2Config.endTime,
    interval: day2Config.scheduleInterval,
  },
  stages: stages,
  events: day2Events,
})

export const arc2025Day1ScheduleLayout =
  createScheduleLayout(arc2025Day1InputData)
export const arc2025Day2ScheduleLayout =
  createScheduleLayout(arc2025Day2InputData)
