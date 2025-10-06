import { Fragment } from 'react'

interface ScheduleGridTimeSlotsProps {
  timeSlots: string[]
}

export function ScheduleGridTimeSlots({
  timeSlots,
}: ScheduleGridTimeSlotsProps) {
  return (
    <>
      {timeSlots.map((time, index) => {
        const timeRowIndex = index * 2 + 2

        return (
          <Fragment key={time + index}>
            <time
              dateTime={time}
              className='font-nerus text-25-white border-t-25-white/30 col-span-full flex items-center border-t-3 border-dashed text-2xl font-bold'
              style={{
                gridRow: timeRowIndex,
              }}>
              {time}
            </time>
          </Fragment>
        )
      })}
    </>
  )
}
