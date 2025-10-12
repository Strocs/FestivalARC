import { cn } from '@/features/shared/utils'

interface DaySelectorProps {
  days: ReadonlyArray<{ label: string }>
  currentDayIndex: number
  onDayChange: (index: number) => void
  isExpanded?: boolean
}

export function DaySelector({
  days,
  currentDayIndex,
  onDayChange,
  isExpanded = true,
}: DaySelectorProps) {
  const canGoPrev = currentDayIndex > 0
  const canGoNext = currentDayIndex < days.length - 1

  const handlePrevious = () => {
    if (canGoPrev) {
      onDayChange(currentDayIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onDayChange(currentDayIndex + 1)
    }
  }

  if (days.length <= 1) {
    return null
  }

  const currentLabel = days[currentDayIndex].label
  const dayParts = currentLabel.split(' ')
  const dayName = dayParts[0] || ''
  const dayNumber = dayParts[1] || ''
  return (
    <div className='bg-25-black flex items-center justify-center rounded-sm px-4 py-2'>
      <button
        onClick={handlePrevious}
        disabled={!canGoPrev}
        type='button'
        aria-label='Día anterior'
        className={cn(
          'text-25-white hover:text-25-accent flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors duration-200',
          !canGoPrev && 'cursor-not-allowed opacity-30',
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
        disabled={!canGoNext}
        type='button'
        aria-label='Día siguiente'
        className={cn(
          'text-25-white hover:text-25-accent flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors duration-200',
          !canGoNext && 'cursor-not-allowed opacity-30',
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
