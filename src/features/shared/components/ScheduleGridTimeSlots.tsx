import { cn } from '../utils'

interface ScheduleGridTimeSlotsProps {
  timeSlots: string[]
}

export function ScheduleGridTimeSlots({
  timeSlots,
}: ScheduleGridTimeSlotsProps) {
  return timeSlots.map((time, index) => (
    <time
      key={time}
      dateTime={time}
      className={cn(
        'font-nerus text-25-white relative -mt-3 text-2xl font-bold',
        'before:border-25-white/30 before:absolute before:mt-[3px] before:h-full before:w-screen before:border-b-3 before:border-dashed',
        index === timeSlots.length - 1 && 'before:border-b-0',
      )}>
      {time}
    </time>
  ))
}
