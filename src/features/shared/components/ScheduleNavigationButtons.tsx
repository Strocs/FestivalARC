import { cn } from '../utils'

interface ScheduleNavigationButtonsProps {
  onNext: () => void
  onPrev: () => void
  canGoNext: boolean
  canGoPrev: boolean
  className?: string
}

export function ScheduleNavigationButtons({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  className,
}: ScheduleNavigationButtonsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={cn(
          'bg-25-black text-25-white hover:bg-25-primary flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
          !canGoPrev && 'cursor-not-allowed opacity-30',
        )}
        type='button'
        aria-label='Anterior'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M15 18l-6-6 6-6' />
        </svg>
      </button>
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          'bg-25-black text-25-white hover:bg-25-primary flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
          !canGoNext && 'cursor-not-allowed opacity-30',
        )}
        type='button'
        aria-label='Siguiente'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
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
