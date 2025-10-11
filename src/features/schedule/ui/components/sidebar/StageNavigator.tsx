import { cn } from '@/features/shared/utils'
import type { UIHeaderItem } from '../../types'

interface StageNavigatorProps {
  stages: ReadonlyArray<UIHeaderItem>
  currentStageIndex: number
  onStageClick: (stageId: string) => void
  isOpen: boolean
  onToggle: () => void
  dropdownRef: React.RefObject<HTMLDivElement | null>
}

export function StageNavigator({
  stages,
  currentStageIndex,
  onStageClick,
  isOpen,
  onToggle,
  dropdownRef,
}: StageNavigatorProps) {
  if (stages.length === 0) {
    return null
  }

  const currentStage = stages[currentStageIndex] || stages[0]
  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return (
    <div
      ref={dropdownRef}
      className='font-neris relative flex h-[var(--header-height)] rounded-xs text-center capitalize md:top-4 md:hidden'
      style={{ backgroundColor: currentStage.color }}>
      <div
        className={cn(
          'absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xs p-2 transition-all duration-200',
          isOpen
            ? 'bg-25-black visible max-h-fit opacity-100 shadow-lg'
            : 'invisible max-h-0 opacity-0',
        )}>
        <div>
          {sortedStages.map((stage) => {
            const isActive = stage.id === currentStage.id
            return (
              <button
                key={stage.id}
                onClick={() => onStageClick(stage.id)}
                type='button'
                className={cn(
                  'hover:bg-25-white/10 flex h-12 w-full items-center gap-2 px-4 text-left transition-colors duration-200',
                  isActive && 'bg-25-white/5',
                )}>
                <div
                  className='h-3 w-3 shrink-0 rounded-full'
                  style={{ backgroundColor: stage.color }}
                />
                <p
                  className={cn(
                    '-mt-1 leading-none',
                    isActive ? 'text-25-accent' : 'text-25-white',
                  )}>
                  {stage.name}
                  {stage.category && (
                    <>
                      <br />
                      <span className='text-25-white/70 text-sm capitalize'>
                        {stage.category}
                      </span>
                    </>
                  )}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={onToggle}
        type='button'
        className='hover:bg-25-white/10 flex w-full items-center justify-between gap-2 px-6 py-3 transition-colors duration-200'>
        <div className='mx-auto flex w-fit flex-col items-center'>
          <h3 className='text-xl leading-none font-bold text-[#f7f7f7]'>
            {currentStage.name}
          </h3>
          {currentStage.category && (
            <>
              <span className='text-25-white/90 block leading-none'>
                {currentStage.category}
              </span>
            </>
          )}
        </div>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={cn(
            'text-25-white shrink-0 transition-transform duration-200',
            !isOpen && 'rotate-180',
          )}>
          <path d='M6 9l6 6 6-6' />
        </svg>
      </button>
    </div>
  )
}
