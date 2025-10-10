import { cn } from '@/features/shared/utils'
import { useColumnsStore } from '../../stores/schedule-columns-store'
interface ScheduleNavigationButtonsProps {
  className?: string
}

export function NavigationButtons({
  className,
}: ScheduleNavigationButtonsProps) {
  const canGoNext = useColumnsStore((state) => state.canGoNext)
  const canGoPrev = useColumnsStore((state) => state.canGoPrev)
  const goToNext = useColumnsStore((state) => state.goToNext)
  const goToPrev = useColumnsStore((state) => state.goToPrev)

  return (
    <nav
      className={cn(
        '-mr-24 flex h-[var(--header-height)] items-center justify-between gap-4',
        className,
      )}>
      <button
        onClick={goToPrev}
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
        onClick={goToNext}
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
