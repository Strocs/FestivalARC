import { cn } from '@/features/shared/utils'

interface FloatingButtonProps {
  isVisible: boolean
  onClick?: () => void
  label?: string
  icon?: React.ReactNode
  className?: string
}

export function FloatingButton({
  isVisible,
  onClick,
  label,
  icon,
  className,
}: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'font-neris fixed top-4 right-4 z-50 md:top-auto md:bottom-4',
        'bg-25-primary cursor-pointer rounded-full px-3 pt-1 pb-1.5 shadow-lg',
        'text-25-white font-bold',
        'transition-all duration-300 ease-in-out',
        'hover:scale-105 hover:shadow-xl',
        'active:scale-95',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
        className,
      )}
      aria-hidden={!isVisible}>
      <div className='flex items-center gap-2'>
        {icon && <span className='flex items-center'>{icon}</span>}
        {label && <span>{label}</span>}
      </div>
    </button>
  )
}
