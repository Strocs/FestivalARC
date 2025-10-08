import { useState, useEffect } from 'react'
import type { UIHeaderItem } from '../../types'
import { cn } from '@/features/shared/utils'

interface TrackSidebarProps {
  stages: ReadonlyArray<UIHeaderItem>
  selectedStageIds: string[]
  onStageSelectionChange: (stageIds: string[]) => void
  navigation?: React.ReactNode
}

const STORAGE_KEY = 'festivalarc-sidebar-expanded'

export function TrackSidebar({
  stages,
  selectedStageIds,
  onStageSelectionChange,
  navigation,
}: TrackSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : true
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isExpanded))
    }
  }, [isExpanded])

  const handleToggleStage = (stageId: string) => {
    if (selectedStageIds.includes(stageId)) {
      onStageSelectionChange(selectedStageIds.filter((id) => id !== stageId))
    } else {
      onStageSelectionChange([...selectedStageIds, stageId])
    }
  }

  const handleSelectAll = () => {
    onStageSelectionChange(stages.map((stage) => stage.id))
  }

  const handleDeselectAll = () => {
    onStageSelectionChange([])
  }

  const handleToggleAllStages = () => {
    if (selectedStageIds.length === stages.length) {
      handleDeselectAll()
    } else {
      handleSelectAll()
    }
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return (
    <aside
      className={cn(
        'bg-25-black ml-4 flex h-fit shrink-0 flex-col gap-2 px-4 pb-4 transition-all duration-300 ease-in-out',
        isExpanded ? 'w-60' : 'w-21',
      )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='text-25-white hover:text-25-accent flex cursor-pointer items-center justify-center pt-4 transition-colors duration-200'
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
          className='transition-transform duration-300'>
          {isExpanded ? (
            <path d='M15 18l-6-6 6-6' />
          ) : (
            <path d='M9 18l6-6-6-6' />
          )}
        </svg>
      </button>

      <section className='flex flex-col'>
        {sortedStages.map((stage) => (
          <label
            key={stage.id}
            className={cn(
              'hover:bg-25-white/10 flex h-13 cursor-pointer items-center gap-2 rounded p-2 transition-all duration-200',
            )}>
            <input
              type='checkbox'
              checked={selectedStageIds.includes(stage.id)}
              onChange={() => handleToggleStage(stage.id)}
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

        <div
          className={cn(
            'flex items-center justify-center gap-2 transition-all duration-300',
            isExpanded
              ? 'visible h-fit opacity-100 delay-150'
              : 'invisible h-0 w-0 overflow-hidden opacity-0',
          )}>
          <button
            onClick={handleSelectAll}
            className='hover:text-25-white cursor-pointer text-sm text-gray-400'
            type='button'>
            Todos
          </button>
          <span className='text-gray-600'>|</span>
          <button
            onClick={handleDeselectAll}
            className='hover:text-25-white cursor-pointer text-sm text-gray-400'
            type='button'>
            Ninguno
          </button>
        </div>

        {!isExpanded && (
          <div className='flex h-6 items-center'>
            <button
              onClick={handleToggleAllStages}
              className='hover:text-25-accent text-25-white mx-auto flex size-8 cursor-pointer items-center justify-center rounded transition-colors duration-200'
              type='button'
              aria-label={
                selectedStageIds.length === stages.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'
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
                {selectedStageIds.length === stages.length ? (
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

        {navigation}
      </section>
    </aside>
  )
}
