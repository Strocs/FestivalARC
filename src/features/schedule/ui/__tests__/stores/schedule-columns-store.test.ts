// import { describe, it, expect, beforeEach, vi } from 'vitest'
// import { act } from '@testing-library/react'
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
//   createMockColumn('stage-4', 'Stage 4'),
// ]
//
// describe('Schedule Columns Store', () => {
//   let useScheduleColumnsStore: any
//   let resetScheduleColumnsStore: any
//
//   beforeEach(async () => {
//     vi.clearAllMocks()
//
//     if (resetScheduleColumnsStore) {
//       resetScheduleColumnsStore()
//     }
//
//     const module = await import('../../stores/schedule-columns-store')
//     useScheduleColumnsStore = module.useScheduleColumnsStore
//     resetScheduleColumnsStore = module.resetScheduleColumnsStore
//
//     if (resetScheduleColumnsStore) {
//       resetScheduleColumnsStore()
//     }
//   })
//
//   describe('Initialization', () => {
//     it('should initialize with empty localStorage (all selected)', () => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.allColumns).toEqual(mockColumns)
//       expect(state.availableStageIds).toEqual([
//         'stage-1',
//         'stage-2',
//         'stage-3',
//         'stage-4',
//       ])
//       expect(state.selectedStageIds).toEqual([
//         'stage-1',
//         'stage-2',
//         'stage-3',
//         'stage-4',
//       ])
//       expect(state.currentIndex).toBe(0)
//       expect(state.filteredColumns).toEqual(mockColumns)
//       expect(state.isAllSelected).toBe(true)
//       expect(state.isNoneSelected).toBe(false)
//       expect(state.selectedCount).toBe(4)
//       expect(trackSelectionStorage.set).toHaveBeenCalledWith([
//         'stage-1',
//         'stage-2',
//         'stage-3',
//         'stage-4',
//       ])
//     })
//
//     it('should initialize with valid localStorage IDs', () => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue([
//         'stage-1',
//         'stage-3',
//       ])
//
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual(['stage-1', 'stage-3'])
//       expect(state.filteredColumns).toHaveLength(2)
//       expect(state.filteredColumns[0].header.id).toBe('stage-1')
//       expect(state.filteredColumns[1].header.id).toBe('stage-3')
//       expect(state.isAllSelected).toBe(false)
//       expect(state.selectedCount).toBe(2)
//     })
//
//     it('should initialize with invalid localStorage IDs (filter out invalid)', () => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue([
//         'stage-1',
//         'invalid-id',
//         'stage-3',
//       ])
//
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual(['stage-1', 'stage-3'])
//       expect(state.filteredColumns).toHaveLength(2)
//       expect(trackSelectionStorage.set).toHaveBeenCalledWith([
//         'stage-1',
//         'stage-3',
//       ])
//     })
//
//     it('should not re-initialize if already initialized', () => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//
//       vi.mocked(trackSelectionStorage.set).mockClear()
//
//       act(() => initialize(mockColumns))
//
//       expect(trackSelectionStorage.set).not.toHaveBeenCalled()
//     })
//   })
//
//   describe('Filtering - toggleStage', () => {
//     beforeEach(() => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//       vi.mocked(trackSelectionStorage.set).mockClear()
//     })
//
//     it('should toggle stage off and update filteredColumns', () => {
//       const { toggleStage } = useScheduleColumnsStore.getState()
//       act(() => toggleStage('stage-2'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual(['stage-1', 'stage-3', 'stage-4'])
//       expect(state.filteredColumns).toHaveLength(3)
//       expect(
//         state.filteredColumns.map(
//           (c: { header: { id: string } }) => c.header.id,
//         ),
//       ).toEqual(['stage-1', 'stage-3', 'stage-4'])
//       expect(state.selectedCount).toBe(3)
//       expect(trackSelectionStorage.set).toHaveBeenCalledWith([
//         'stage-1',
//         'stage-3',
//         'stage-4',
//       ])
//     })
//
//     it('should toggle stage on and update filteredColumns', () => {
//       const { toggleStage } = useScheduleColumnsStore.getState()
//       act(() => toggleStage('stage-2'))
//       act(() => toggleStage('stage-2'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual([
//         'stage-1',
//         'stage-3',
//         'stage-4',
//         'stage-2',
//       ])
//       expect(state.filteredColumns).toHaveLength(4)
//       expect(state.selectedCount).toBe(4)
//     })
//
//     it('should adjust currentIndex when removing current stage', () => {
//       const { goToIndex, toggleStage } = useScheduleColumnsStore.getState()
//       act(() => goToIndex(2))
//
//       expect(useScheduleColumnsStore.getState().currentIndex).toBe(2)
//
//       act(() => toggleStage('stage-3'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(2)
//       expect(state.filteredColumns[state.currentIndex].header.id).toBe(
//         'stage-4',
//       )
//     })
//
//     it('should adjust currentIndex when removing stage before current', () => {
//       const { goToIndex, toggleStage } = useScheduleColumnsStore.getState()
//       act(() => goToIndex(2))
//
//       act(() => toggleStage('stage-1'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(1)
//       expect(state.filteredColumns[state.currentIndex].header.id).toBe(
//         'stage-3',
//       )
//     })
//
//     it('should maintain currentIndex when adding stage after current', () => {
//       const { goToIndex, toggleStage } = useScheduleColumnsStore.getState()
//       act(() => toggleStage('stage-4'))
//       act(() => goToIndex(1))
//
//       const currentStageId =
//         useScheduleColumnsStore.getState().filteredColumns[1].header.id
//
//       act(() => toggleStage('stage-4'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.filteredColumns[state.currentIndex].header.id).toBe(
//         currentStageId,
//       )
//     })
//
//     it('should adjust currentIndex when adding stage before current', () => {
//       const { toggleStage, goToIndex } = useScheduleColumnsStore.getState()
//       act(() => toggleStage('stage-1'))
//       act(() => goToIndex(1))
//
//       const currentStageId =
//         useScheduleColumnsStore.getState().filteredColumns[1].header.id
//
//       act(() => toggleStage('stage-1'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(2)
//       expect(state.filteredColumns[state.currentIndex].header.id).toBe(
//         currentStageId,
//       )
//     })
//   })
//
//   describe('Filtering - selectAll/deselectAll/toggleAll', () => {
//     beforeEach(() => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(['stage-1'])
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//       vi.mocked(trackSelectionStorage.set).mockClear()
//     })
//
//     it('should selectAll and reset position', () => {
//       const { goToIndex, selectAll } = useScheduleColumnsStore.getState()
//       act(() => goToIndex(1))
//       act(() => selectAll())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual([
//         'stage-1',
//         'stage-2',
//         'stage-3',
//         'stage-4',
//       ])
//       expect(state.filteredColumns).toHaveLength(4)
//       expect(state.currentIndex).toBe(0)
//       expect(state.isAllSelected).toBe(true)
//       expect(trackSelectionStorage.set).toHaveBeenCalledWith([
//         'stage-1',
//         'stage-2',
//         'stage-3',
//         'stage-4',
//       ])
//     })
//
//     it('should deselectAll and reset position', () => {
//       const { selectAll, goToIndex, deselectAll } =
//         useScheduleColumnsStore.getState()
//       act(() => selectAll())
//       act(() => goToIndex(2))
//       act(() => deselectAll())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual([])
//       expect(state.filteredColumns).toHaveLength(0)
//       expect(state.currentIndex).toBe(0)
//       expect(state.isNoneSelected).toBe(true)
//       expect(trackSelectionStorage.set).toHaveBeenCalledWith([])
//     })
//
//     it('should toggleAll from all to none', () => {
//       const { selectAll, toggleAll } = useScheduleColumnsStore.getState()
//       act(() => selectAll())
//       act(() => toggleAll())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual([])
//       expect(state.isNoneSelected).toBe(true)
//     })
//
//     it('should toggleAll from partial to all', () => {
//       const { toggleAll } = useScheduleColumnsStore.getState()
//       act(() => toggleAll())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.selectedStageIds).toEqual([
//         'stage-1',
//         'stage-2',
//         'stage-3',
//         'stage-4',
//       ])
//       expect(state.isAllSelected).toBe(true)
//     })
//   })
//
//   describe('Navigation - selectStage', () => {
//     beforeEach(() => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//     })
//
//     it('should navigate to specific stage by ID', () => {
//       const { selectStage } = useScheduleColumnsStore.getState()
//       act(() => selectStage('stage-3'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(2)
//       expect(state.currentStage?.id).toBe('stage-3')
//     })
//
//     it('should not navigate to non-existent stage', () => {
//       const { selectStage } = useScheduleColumnsStore.getState()
//       act(() => selectStage('invalid-id'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(0)
//     })
//
//     it('should not navigate to unselected stage', () => {
//       const { toggleStage, selectStage } = useScheduleColumnsStore.getState()
//       act(() => toggleStage('stage-3'))
//       act(() => selectStage('stage-3'))
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(0)
//     })
//   })
//
//   describe('Navigation - goToNext/goToPrev/goToIndex', () => {
//     beforeEach(() => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//     })
//
//     it('should goToNext within bounds', () => {
//       const { goToNext } = useScheduleColumnsStore.getState()
//       act(() => goToNext())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(1)
//       expect(state.canGoPrev).toBe(true)
//       expect(state.canGoNext).toBe(true)
//     })
//
//     it('should not goToNext beyond last column', () => {
//       const { goToIndex, goToNext } = useScheduleColumnsStore.getState()
//       act(() => goToIndex(3))
//       act(() => goToNext())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(3)
//       expect(state.canGoNext).toBe(false)
//     })
//
//     it('should goToPrev within bounds', () => {
//       const { goToIndex, goToPrev } = useScheduleColumnsStore.getState()
//       act(() => goToIndex(2))
//       act(() => goToPrev())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(1)
//       expect(state.canGoPrev).toBe(true)
//       expect(state.canGoNext).toBe(true)
//     })
//
//     it('should not goToPrev before first column', () => {
//       const { goToPrev } = useScheduleColumnsStore.getState()
//       act(() => goToPrev())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(0)
//       expect(state.canGoPrev).toBe(false)
//     })
//
//     it('should goToIndex with clamping', () => {
//       const { goToIndex } = useScheduleColumnsStore.getState()
//
//       act(() => goToIndex(-5))
//       expect(useScheduleColumnsStore.getState().currentIndex).toBe(0)
//
//       act(() => goToIndex(10))
//       expect(useScheduleColumnsStore.getState().currentIndex).toBe(3)
//
//       act(() => goToIndex(2))
//       expect(useScheduleColumnsStore.getState().currentIndex).toBe(2)
//     })
//
//     it('should resetPosition to 0', () => {
//       const { goToIndex, resetPosition } = useScheduleColumnsStore.getState()
//       act(() => goToIndex(3))
//       act(() => resetPosition())
//
//       const state = useScheduleColumnsStore.getState()
//       expect(state.currentIndex).toBe(0)
//       expect(state.canGoPrev).toBe(false)
//       expect(state.canGoNext).toBe(true)
//     })
//   })
//
//   describe('Derived States', () => {
//     beforeEach(() => {
//       vi.mocked(trackSelectionStorage.get).mockReturnValue(null)
//       const { initialize } = useScheduleColumnsStore.getState()
//       act(() => initialize(mockColumns))
//     })
//
//     it('should compute isAllSelected correctly', () => {
//       const { toggleStage } = useScheduleColumnsStore.getState()
//
//       expect(useScheduleColumnsStore.getState().isAllSelected).toBe(true)
//
//       act(() => toggleStage('stage-1'))
//       expect(useScheduleColumnsStore.getState().isAllSelected).toBe(false)
//     })
//
//     it('should compute isNoneSelected correctly', () => {
//       const { deselectAll, selectAll } = useScheduleColumnsStore.getState()
//
//       act(() => deselectAll())
//       expect(useScheduleColumnsStore.getState().isNoneSelected).toBe(true)
//
//       act(() => selectAll())
//       expect(useScheduleColumnsStore.getState().isNoneSelected).toBe(false)
//     })
//
//     it('should compute canGoNext and canGoPrev correctly', () => {
//       const { goToIndex } = useScheduleColumnsStore.getState()
//
//       expect(useScheduleColumnsStore.getState().canGoPrev).toBe(false)
//       expect(useScheduleColumnsStore.getState().canGoNext).toBe(true)
//
//       act(() => goToIndex(2))
//       expect(useScheduleColumnsStore.getState().canGoPrev).toBe(true)
//       expect(useScheduleColumnsStore.getState().canGoNext).toBe(true)
//
//       act(() => goToIndex(3))
//       expect(useScheduleColumnsStore.getState().canGoPrev).toBe(true)
//       expect(useScheduleColumnsStore.getState().canGoNext).toBe(false)
//     })
//
//     it('should compute currentStage correctly', () => {
//       const { goToIndex } = useScheduleColumnsStore.getState()
//
//       expect(useScheduleColumnsStore.getState().currentStage?.id).toBe(
//         'stage-1',
//       )
//
//       act(() => goToIndex(2))
//       expect(useScheduleColumnsStore.getState().currentStage?.id).toBe(
//         'stage-3',
//       )
//     })
//
//     it('should return null currentStage when no columns', () => {
//       const { deselectAll } = useScheduleColumnsStore.getState()
//       act(() => deselectAll())
//
//       expect(useScheduleColumnsStore.getState().currentStage).toBeNull()
//     })
//   })
// })
