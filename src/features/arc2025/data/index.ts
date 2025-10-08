// Repository like to parse data from data-source to schedule input (Just an example, data can actually pass directly if came well )

import stagesData from './stages.json' with { type: 'json' }
import day1Config from './day1/config.json' with { type: 'json' }
import day2Config from './day2/config.json' with { type: 'json' }

import { day1Events } from './day1'
import { day2Events } from './day2'

import type {
  Arc2025Event,
  Arc2025EventPayload,
  Arc2025Stage,
  Arc2025StagePayload,
} from '../types'
import { createScheduleData, type ScheduleInput } from '@/features/schedule'

interface Arc2025Data {
  time: {
    start: string
    end: string
    interval: number
  }
  stages: Arc2025Stage[]
  events: Arc2025Event[]
}

type Arc2025ScheduleInput = ScheduleInput<
  Arc2025StagePayload,
  Arc2025EventPayload
> // specify payload type hereScheduleInput<

export function mapArc2025DataToScheduleInput({
  time,
  stages,
  events,
}: Arc2025Data): Arc2025ScheduleInput {
  // get data from data source and parse to ScheduleInput
  return {
    scheduleTime: {
      ...time,
      intervalMinutes: time.interval,
    },
    tracks: stages.map((stage) => ({
      id: stage.id,
      order: stage.order,
      payload: {
        name: stage.name,
        color: stage.color,
        category: stage.category,
      },
    })),
    events: events.map((event) => ({
      id: event.id,
      trackId: event.trackId,
      time: event.time,
      payload: {
        title: event.title,
        subTitle: event.subTitle,
        description: event.description,
        category: event.category,
        duration: event.duration,
        galleryUrl: event.galleryUrl,
      },
    })),
  }
}

// Remove specific Stage
function disableStage(stageId: string | string[], stages: Arc2025Stage[]) {
  return stages.filter((stage) =>
    Array.isArray(stageId) ? !stageId.includes(stage.id) : stage.id !== stageId,
  )
}

const stages = disableStage(['stage-h', 'stage-g'], stagesData)

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

export const arc2025Day1ScheduleData = createScheduleData(arc2025Day1InputData)
export const arc2025Day2ScheduleData = createScheduleData(arc2025Day2InputData)
