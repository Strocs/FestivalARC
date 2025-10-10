import { cn } from '@/features/shared/utils'
import type { UIHeaderItem } from '../../types'
import { useStageSelector } from '../../hooks/use-stage-selector'
import { useColumnsStore } from '../../stores/schedule-columns-store'

interface StageSelectorProps {
  stages: ReadonlyArray<UIHeaderItem>
}

export function StageSelector({ stages }: StageSelectorProps) {
  const { isOpen, toggle, dropdownRef } = useStageSelector()

  const currentIndex = useColumnsStore((state) => state.currentIndex)
  const selectStage = useColumnsStore((state) => state.selectStage)

  const currentStage = stages[currentIndex]

  return (
    <div
      ref={dropdownRef}
      className='font-neris relative flex h-[var(--header-height)] rounded-xs text-center capitalize md:top-4 md:hidden'
      style={{ backgroundColor: currentStage.color }}>
      <button
        onClick={toggle}
        type='button'
        className='hover:bg-25-white/10 flex w-full items-center justify-between gap-2 px-6 py-3 transition-colors duration-200'>
        <div className='mx-auto flex w-fit flex-col items-center'>
          <h3 className='text-25-white text-xl leading-none font-bold'>
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

      <div
        className={cn(
          'absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-sm p-2 transition-all duration-200',
          isOpen
            ? 'bg-25-black visible max-h-fit opacity-100 shadow-lg'
            : 'invisible max-h-0 opacity-0',
        )}>
        <div>
          {stages.map((stage) => {
            const isActive = stage.id === currentStage.id
            return (
              <button
                key={stage.id}
                onClick={() => selectStage(stage.id)}
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
    </div>
  )
}
