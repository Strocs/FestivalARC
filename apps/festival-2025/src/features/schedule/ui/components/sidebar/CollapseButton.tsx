import { cn } from '@/features/shared/utils'

interface CollapseButtonProps {
  isExpanded: boolean
  onToggle: () => void
}

export function CollapseButton({ isExpanded, onToggle }: CollapseButtonProps) {
  return (
    <button
      onClick={onToggle}
      className='text-25-white/80 hover:text-25-accent flex w-full cursor-pointer items-center justify-center gap-2 transition-colors duration-200'
      type='button'
      aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='shrink-0'>
        {isExpanded ? (
          <>
            <path d='M12 18l-6-6 6-6' />
            <path d='M17 18l-6-6 6-6' />
          </>
        ) : (
          <>
            <path d='M11 18l6-6-6-6' />
            <path d='M16 18l6-6-6-6' />
          </>
        )}
      </svg>
      <span
        className={cn(
          'inline-block w-fit text-sm transition-all duration-300',
          isExpanded
            ? 'visible opacity-100 delay-150'
            : 'invisible w-0 overflow-hidden opacity-0',
        )}>
        Colapsar
      </span>
    </button>
  )
}
