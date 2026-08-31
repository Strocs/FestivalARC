// import { describe, it, expect, beforeEach, vi } from 'vitest'
// import { renderHook, act } from '@testing-library/react'
// import type { UIColumns } from '../../types'
// import { trackSelectionStorage } from '../../../storage/track-selection-storage'
//
// vi.mock('../../../storage/track-selection-storage', () => ({
//   trackSelectionStorage: {
//     get: vi.fn(),
//     set: vi.fn(),
//     clear: vi.fn(),
//   },
//   getValidTrackIds: (
//     storedIds: string[] | null,
//     availableIds: string[],
//   ): string[] => {
//     if (!storedIds || storedIds.length === 0) return []
//     return storedIds.filter((id) => availableIds.includes(id))
//   },
// }))
//
// const createMockColumn = (id: string, name: string): UIColumns => ({
//   header: {
//     id,
//     name,
//     color: '#000000',
//     order: 0,
//     category: 'test',
//   },
//   column: [],
// })
//
// const mockColumns: UIColumns[] = [
//   createMockColumn('stage-1', 'Stage 1'),
//   createMockColumn('stage-2', 'Stage 2'),
//   createMockColumn('stage-3', 'Stage 3'),
// ]
//
// describe('useScheduleColumns hook', () => {
//   let useScheduleColumns: any
//   let resetScheduleColumnsStore: any
//
//   beforeEach(async () => {
//     vi.clearAllMocks()
//
//     if (resetScheduleColumnsStore) {
//       resetScheduleColumnsStore()
//     }
//
//     const storeModule = await import('../../stores/schedule-columns-store')
//     const hookModule = await import('../../hooks/use-schedule-columns')
//
//     useScheduleColumns = hookModule.useScheduleColumns
//     resetScheduleColumnsStore = storeModule.resetScheduleColumnsStore
//
//     if (resetScheduleColumnsStore) {
//       resetScheduleColumnsStore()
//     }
//   })
//
//   it('should initialize store on mount', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current.allColumns).toEqual(mockColumns)
//     expect(result.current.filteredColumns).toEqual(mockColumns)
//     expect(result.current.selectedStageIds).toEqual([
//       'stage-1',
//       'stage-2',
//       'stage-3',
//     ])
//     expect(result.current.isAllSelected).toBe(true)
//   })
//
//   it('should expose data properties', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(['stage-1'])
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current).toHaveProperty('filteredColumns')
//     expect(result.current).toHaveProperty('allColumns')
//     expect(result.current.filteredColumns).toHaveLength(1)
//     expect(result.current.allColumns).toHaveLength(3)
//   })
//
//   it('should expose selection properties', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current).toHaveProperty('selectedStageIds')
//     expect(result.current).toHaveProperty('isAllSelected')
//     expect(result.current).toHaveProperty('isNoneSelected')
//     expect(result.current).toHaveProperty('selectedCount')
//   })
//
//   it('should expose navigation properties', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current).toHaveProperty('currentIndex')
//     expect(result.current).toHaveProperty('canGoNext')
//     expect(result.current).toHaveProperty('canGoPrev')
//     expect(result.current).toHaveProperty('currentStage')
//   })
//
//   it('should expose filtering actions', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current).toHaveProperty('toggleStage')
//     expect(result.current).toHaveProperty('selectAll')
//     expect(result.current).toHaveProperty('deselectAll')
//     expect(result.current).toHaveProperty('toggleAll')
//     expect(typeof result.current.toggleStage).toBe('function')
//   })
//
//   it('should expose navigation actions', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current).toHaveProperty('selectStage')
//     expect(result.current).toHaveProperty('goToNext')
//     expect(result.current).toHaveProperty('goToPrev')
//     expect(result.current).toHaveProperty('goToIndex')
//     expect(result.current).toHaveProperty('resetPosition')
//     expect(typeof result.current.selectStage).toBe('function')
//   })
//
//   it('should react to store changes', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current.currentIndex).toBe(0)
//
//     act(() => {
//       result.current.goToNext()
//     })
//
//     expect(result.current.currentIndex).toBe(1)
//     expect(result.current.currentStage?.id).toBe('stage-2')
//   })
//
//   it('should update filteredColumns when toggling stages', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { result } = renderHook(() => useScheduleColumns(mockColumns))
//
//     expect(result.current.filteredColumns).toHaveLength(3)
//
//     act(() => {
//       result.current.toggleStage('stage-2')
//     })
//
//     expect(result.current.filteredColumns).toHaveLength(2)
//     expect(
//       result.current.filteredColumns.map(
//         (c: { header: { id: string } }) => c.header.id,
//       ),
//     ).toEqual(['stage-1', 'stage-3'])
//   })
//
//   it('should not re-initialize on re-render with same columns', () => {
//     vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//     const { rerender } = renderHook(() => useScheduleColumns(mockColumns))
//
//     vi.mocked(trackSelectionStorage.set).mockClear()
//
//     rerender()
//
//     expect(trackSelectionStorage.set).not.toHaveBeenCalled()
//   })
// })

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ColumnsProvider, useColumnsStore } from '../../stores/schedule-columns-store'
import type { UIColumns } from '../../types'

const columns: UIColumns[] = [
  { header: { id: 'stage-1', name: 'Stage 1', color: '#000', order: 0 }, column: [] },
  { header: { id: 'stage-2', name: 'Stage 2', color: '#fff', order: 1 }, column: [] },
]

function ColumnsProbe() {
  const selectedCount = useColumnsStore((state) => state.selectedCount)
  const toggleStage = useColumnsStore((state) => state.toggleStage)

  return (
    <button type='button' onClick={() => toggleStage('stage-2')}>
      {selectedCount}
    </button>
  )
}

describe('Columns selection hook API', () => {
  it('updates the selected stage count through the store hook', () => {
    render(
      <ColumnsProvider columns={columns}>
        <ColumnsProbe />
      </ColumnsProvider>,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveTextContent('1')
  })
})
