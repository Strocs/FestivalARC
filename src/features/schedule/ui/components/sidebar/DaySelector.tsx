import { cn } from '@/features/shared/utils'
import { useDaysStore } from '../../stores/days-store'

interface DaySelectorProps {
  isExpanded?: boolean
}

export function DaySelector({ isExpanded = true }: DaySelectorProps) {
  const currentDayIndex = useDaysStore((state) => state.currentDayIndex)
  const canGoPrevDay = useDaysStore((state) => state.canGoPrevDay)
  const canGoNextDay = useDaysStore((state) => state.canGoNextDay)
  const prevDay = useDaysStore((state) => state.prevDay)
  const nextDay = useDaysStore((state) => state.nextDay)
  const days = useDaysStore((state) => state.days)

  const handlePrevious = () => {
    if (canGoPrevDay) {
      // TODO: link columnsStore with dayStore
      // Here we need to trigger a columnStore change setting the new columns
      prevDay()
    }
  }

  const handleNext = () => {
    if (canGoNextDay) {
      // Here we need to trigger a columnStore change setting the new columns
      nextDay()
    }
  }

  // Techincal Doubt: this information must came from the implementation of the schedule.
  const currentLabel = days[currentDayIndex]
  const dayParts = currentLabel.split(' ')
  const dayName = dayParts[0] || ''
  const dayNumber = dayParts[1] || ''

  return (
    <div className='bg-25-black flex items-center justify-center rounded-sm px-4 py-2'>
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevDay}
        type='button'
        aria-label='Día anterior'
        className={cn(
          'text-25-white hover:text-25-accent flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors duration-200',
          !canGoPrevDay && 'cursor-not-allowed opacity-30',
        )}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M15 18l-6-6 6-6' />
        </svg>
      </button>

      <p
        className={cn(
          'text-25-white relative mx-auto flex w-fit gap-1 text-center text-lg font-semibold',
        )}>
        <span
          className={cn(
            'transition-[opacity,width] duration-300',
            isExpanded
              ? 'visible opacity-100 delay-150'
              : 'invisible w-0 overflow-hidden opacity-0',
          )}>
          {dayName}
        </span>
        <span className=''>{dayNumber}</span>
      </p>

      <button
        onClick={handleNext}
        disabled={!canGoNextDay}
        type='button'
        aria-label='Día siguiente'
        className={cn(
          'text-25-white hover:text-25-accent flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors duration-200',
          !canGoNextDay && 'cursor-not-allowed opacity-30',
        )}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M9 18l6-6-6-6' />
        </svg>
      </button>
    </div>
  )
}
