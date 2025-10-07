import { cn } from '@/features/shared/utils'

interface GridTimeSlotsProps {
  timeColumn: ReadonlyArray<string>
}

export function GridTimeSlots({ timeColumn }: GridTimeSlotsProps) {
  return timeColumn.map((time, index) => (
    <time
      key={time}
      dateTime={time}
      className={cn(
        'relative w-8 md:w-auto',
        'before:border-25-white/30 before:absolute before:mt-[3px] before:h-full before:w-screen before:border-b-3 before:border-dashed',
        index === timeColumn.length - 1 && 'before:border-b-0',
      )}>
      <span className='font-nerus text-25-white mt-7 block -rotate-90 text-2xl font-bold md:-mt-3 md:rotate-0'>
        {time}
      </span>
    </time>
  ))
}
