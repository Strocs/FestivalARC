import { cn } from '@/features/shared/utils'
import type { UIHeaderItem } from '../../types'
import { useColumnsStore } from '../../stores/schedule-columns-store'

interface StageFilterProps {
  stages: ReadonlyArray<UIHeaderItem>
  isExpanded: boolean
}

export function StageFilter({ stages, isExpanded }: StageFilterProps) {
  const selectedStageIds = useColumnsStore((state) => state.selectedStageIds)

  const isAllSelected = useColumnsStore((state) => state.isAllSelected)
  const toggleStage = useColumnsStore((state) => state.toggleStage)
  const selectAll = useColumnsStore((state) => state.selectAll)
  const deselectAll = useColumnsStore((state) => state.deselectAll)
  const toggleAll = useColumnsStore((state) => state.toggleAll)

  return (
    <section className='bg-25-black hidden flex-col rounded-sm p-4 md:flex'>
      <div
        className={cn(
          'flex items-center justify-center gap-2 transition-all duration-300',
          isExpanded
            ? 'visible h-fit opacity-100 delay-150'
            : 'invisible h-0 w-0 overflow-hidden opacity-0',
        )}>
        <button
          onClick={selectAll}
          className='hover:text-25-white cursor-pointer text-sm text-gray-400'
          type='button'>
          Todos
        </button>
        <span className='text-gray-600'>|</span>
        <button
          onClick={deselectAll}
          className='hover:text-25-white cursor-pointer text-sm text-gray-400'
          type='button'>
          Ninguno
        </button>
      </div>

      {!isExpanded && (
        <div className='flex h-6 items-center'>
          <button
            onClick={toggleAll}
            className='hover:text-25-accent text-25-white mx-auto flex size-8 cursor-pointer items-center justify-center rounded-xs transition-colors duration-200'
            type='button'
            aria-label={
              isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'
            }>
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
              {isAllSelected ? (
                <>
                  <path d='M18 6L6 18' />
                  <path d='M6 6l12 12' />
                </>
              ) : (
                <>
                  <path d='M9 11l3 3L22 4' />
                  <path d='M2 11l3 3 7-7' />
                </>
              )}
            </svg>
          </button>
        </div>
      )}
      {stages.map((stage) => (
        <label
          key={stage.id}
          className={cn(
            'hover:bg-25-white/10 flex h-10 cursor-pointer items-center gap-2 rounded-xs px-2 transition-all duration-200 2xl:h-13',
          )}>
          <input
            type='checkbox'
            checked={selectedStageIds.includes(stage.id)}
            onChange={() => toggleStage(stage.id)}
            className='h-4 w-4 shrink-0 cursor-pointer'
          />
          <div
            className='h-3 w-3 shrink-0 rounded-full'
            style={{ backgroundColor: stage.color }}
          />
          <p
            className={cn(
              'text-25-white leading-none transition-all duration-300',
              isExpanded
                ? 'visible h-fit opacity-100 delay-150'
                : 'invisible w-0 overflow-hidden opacity-0',
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
        </label>
      ))}
    </section>
  )
}
