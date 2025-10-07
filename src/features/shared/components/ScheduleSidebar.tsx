import { useState, useEffect } from 'react'
import {
  stageSelectionStorage,
  getValidStageIds,
} from '@/features/schedule/lib/stageSelectionStorage'

export interface Stage {
  id: string
  name: string
  color: string
  order: number
  category?: string
}

interface ScheduleSidebarProps {
  stages: Stage[]
  selectedStageIds: string[]
  onStageSelectionChange: (stageIds: string[]) => void
}

export function ScheduleSidebar({
  stages,
  selectedStageIds,
  onStageSelectionChange,
}: ScheduleSidebarProps) {
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

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return (
    <aside className='bg-25-black sticky top-4 flex h-fit max-w-62 shrink-0 flex-col gap-4 p-4'>
      <div className='flex items-center gap-4'>
        <h3 className='text-25-white font-bold'>Escenarios</h3>
        <div className='mt-1 flex gap-2'>
          <button
            onClick={handleSelectAll}
            className='hover:text-25-white cursor-pointer text-xs text-gray-400'
            type='button'>
            Todos
          </button>
          <span className='text-gray-600'>|</span>
          <button
            onClick={handleDeselectAll}
            className='hover:text-25-white cursor-pointer text-xs text-gray-400'
            type='button'>
            Ninguno
          </button>
        </div>
      </div>

      <div className='flex flex-col'>
        {sortedStages.map((stage) => (
          <label
            key={stage.id}
            className='hover:bg-25-white/10 flex min-h-13 cursor-pointer items-center gap-3 rounded p-2'>
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
            <p className='text-25-white leading-none'>
              {stage.name}
              {stage.category && (
                <>
                  <br />{' '}
                  <span className='text-25-white/70 text-sm capitalize'>
                    {stage.category}
                  </span>
                </>
              )}
            </p>
          </label>
        ))}
      </div>
    </aside>
  )
}

export function useStageSelection(stages: Stage[]) {
  const stagesIds = stages.map((s) => s.id)

  const initialSelectedIds = [
    stagesIds[0],
    stagesIds[1],
    stagesIds[2],
    stagesIds[3],
  ]

  const [selectedStageIds, setSelectedStageIds] =
    useState<string[]>(initialSelectedIds)

  useEffect(() => {
    const storedIds = stageSelectionStorage.get()
    const validStoredIds = getValidStageIds(storedIds, stagesIds)

    if (validStoredIds.length > 0) {
      setSelectedStageIds(validStoredIds)
    }
  }, [])

  useEffect(() => {
    stageSelectionStorage.set(selectedStageIds)
  }, [selectedStageIds])

  return {
    selectedStageIds,
    setSelectedStageIds,
  }
}
