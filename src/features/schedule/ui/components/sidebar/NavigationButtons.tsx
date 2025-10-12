import { cn } from '@/features/shared/utils'

interface ScheduleNavigationButtonsProps {
  onNext: () => void
  onPrev: () => void
  canGoNext: boolean
  canGoPrev: boolean
  className?: string
}

export function NavigationButtons({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  className,
}: ScheduleNavigationButtonsProps) {
  return (
    <nav
      className={cn(
        '-mr-24 flex h-[var(--header-height)] items-center justify-between gap-4',
        className,
      )}>
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={cn(
          'bg-25-black hover:bg-25-primary text-25-white flex h-full w-full cursor-pointer items-center justify-center rounded-sm transition-colors duration-200',
          !canGoPrev && 'cursor-not-allowed opacity-50',
        )}
        type='button'
        aria-label='Anterior'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='34'
          height='34'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M15 18l-6-6 6-6' />
        </svg>
      </button>
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          'bg-25-black hover:bg-25-primary text-25-white flex h-full w-full cursor-pointer items-center justify-center rounded-sm transition-colors duration-200',
          !canGoNext && 'cursor-not-allowed opacity-50',
        )}
        type='button'
        aria-label='Siguiente'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='34'
          height='34'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M9 18l6-6-6-6' />
        </svg>
      </button>
    </nav>
  )
}
