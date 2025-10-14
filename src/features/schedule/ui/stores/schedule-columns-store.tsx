import { createStore, useStore, type StoreApi } from 'zustand'
import type { UIColumns, UIHeaderItem } from '../types'
import {
  trackSelectionStorage,
  getValidTrackIds,
} from '../../storage/track-selection-storage'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react'

interface ColumnsState {
  columns: UIColumns[]
  selectedStageIds: string[]
  filteredColumns: UIColumns[]
  isAllSelected: boolean
  isNoneSelected: boolean
  selectedCount: number // This maybe is not necessary
  canGoNext: boolean
  canGoPrev: boolean
  currentStage: UIHeaderItem | null // i dont know wky this is necessary
  availableStageIds: string[]
  currentIndex: number
  shouldAnimate: boolean
}

interface ColumnsActions {
  toggleStage: (stageId: string) => void
  setColumns: (columns: UIColumns[]) => void

  selectAll: () => void
  deselectAll: () => void
  toggleAll: () => void // I dont have this feature

  selectStage: (stageId: string) => void

  goToNext: () => void
  goToPrev: () => void
  goToIndex: (index: number) => void

  resetPosition: () => void
}

type ColumnsStore = ColumnsState & ColumnsActions

const computeDerivedState = (
  columns: UIColumns[],
  selectedStageIds: string[],
  currentIndex: number,
): Omit<
  ColumnsState,
  | 'columns'
  | 'availableStageIds'
  | 'selectedStageIds'
  | 'currentIndex'
  | 'shouldAnimate'
> => {
  const filteredColumns = columns.filter((col) =>
    selectedStageIds.includes(col.header.id),
  )

  const availableCount = columns.length
  const selectedCount = selectedStageIds.length

  const isAllSelected = selectedCount === availableCount && availableCount > 0
  const isNoneSelected = selectedCount === 0

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < filteredColumns.length - 1

  const currentStage = filteredColumns[currentIndex]?.header ?? null

  return {
    filteredColumns,
    isAllSelected,
    isNoneSelected,
    selectedCount,
    canGoNext,
    canGoPrev,
    currentStage,
  }
}

const adjustIndexAfterFilter = (
  previousFilteredColumns: UIColumns[],
  newFilteredColumns: UIColumns[],
  currentIndex: number,
  toggledStageId: string,
  isAdding: boolean,
): number => {
  if (newFilteredColumns.length === 0) {
    return 0
  }

  if (isAdding) {
    const addedStageNewIndex = newFilteredColumns.findIndex(
      (col) => col.header.id === toggledStageId,
    )

    if (addedStageNewIndex === -1) {
      return currentIndex
    }

    const currentStageId = previousFilteredColumns[currentIndex]?.header.id
    const currentStageNewIndex = newFilteredColumns.findIndex(
      (col) => col.header.id === currentStageId,
    )

    if (addedStageNewIndex < currentStageNewIndex) {
      return addedStageNewIndex
    }

    return currentStageNewIndex !== -1 ? currentStageNewIndex : currentIndex
  }

  const currentStageId = previousFilteredColumns[currentIndex]?.header.id

  if (!currentStageId) {
    return Math.min(currentIndex, newFilteredColumns.length - 1)
  }

  const newIndex = newFilteredColumns.findIndex(
    (col) => col.header.id === currentStageId,
  )

  if (newIndex !== -1) {
    return newIndex
  }

  return Math.min(currentIndex, newFilteredColumns.length - 1)
}

export const createColumnsStore = (initialProps: ColumnsState) =>
  createStore<ColumnsStore>()((set, get) => ({
    ...initialProps,
    setColumns: (columns: UIColumns[]) =>
      set({
        columns,
        ...computeDerivedState(
          columns,
          get().selectedStageIds,
          get().currentIndex,
        ),
      }),

    toggleStage: (stageId: string) => {
      // TODO: optimize this method, PLEASE
      const selectedStageIds = get().selectedStageIds
      const filteredColumns = get().filteredColumns
      const currentIndex = get().currentIndex
      const columns = get().columns

      const isAdding = !selectedStageIds.includes(stageId)

      const newSelectedIds = isAdding
        ? [...selectedStageIds, stageId]
        : selectedStageIds.filter((id) => id !== stageId)

      trackSelectionStorage.set(newSelectedIds)

      const newFilteredColumns = columns.filter((col) =>
        newSelectedIds.includes(col.header.id),
      )

      const newIndex = adjustIndexAfterFilter(
        filteredColumns,
        newFilteredColumns,
        currentIndex,
        stageId,
        isAdding,
      )

      let shouldAnimate = true

      // Condition if we are removing a stage before or at the current index, we disable animation
      if (!isAdding) {
        const removedStageIndex = filteredColumns.findIndex(
          (col) => col.header.id === stageId,
        )

        if (removedStageIndex <= currentIndex) {
          shouldAnimate = false
        }
      }

      // Sepecial condition to correctly animate when adding a stage that ends up at the current index, forcing to move forward one place and then trigger the animation back
      if (isAdding && newIndex === currentIndex) {
        const currentStageId = filteredColumns[currentIndex].header.id
        const futureCurrentIndex = newFilteredColumns.findIndex(
          (col) => col.header.id === currentStageId,
        )

        set({
          selectedStageIds: newSelectedIds,
          currentIndex: futureCurrentIndex,
          shouldAnimate: false,
          ...computeDerivedState(columns, newSelectedIds, futureCurrentIndex),
        })

        setTimeout(() => {
          set({
            currentIndex: newIndex,
            shouldAnimate,
            ...computeDerivedState(columns, newSelectedIds, newIndex),
          })
        }, 0)

        // early return to no trigger the final set below
        return
      }

      set({
        selectedStageIds: newSelectedIds,
        currentIndex: newIndex,
        shouldAnimate,
        ...computeDerivedState(columns, newSelectedIds, newIndex),
      })
    },

    selectAll: () => {
      const { columns, availableStageIds } = get()

      trackSelectionStorage.set(availableStageIds)

      set({
        selectedStageIds: availableStageIds,
        currentIndex: 0,
        shouldAnimate: true,
        ...computeDerivedState(columns, availableStageIds, 0),
      })
    },

    deselectAll: () => {
      const { columns } = get()

      trackSelectionStorage.set([])

      set({
        selectedStageIds: [],
        currentIndex: 0,
        shouldAnimate: true,
        ...computeDerivedState(columns, [], 0),
      })
    },

    toggleAll: () => {
      const { isAllSelected } = get()

      if (isAllSelected) {
        get().deselectAll()
      } else {
        get().selectAll()
      }
    },

    goToNext: () => {
      const { currentIndex, canGoNext, columns, selectedStageIds } = get()

      if (!canGoNext) {
        return
      }

      const newIndex = currentIndex + 1

      set({
        currentIndex: newIndex,
        shouldAnimate: true,
        ...computeDerivedState(columns, selectedStageIds, newIndex),
      })
    },

    goToPrev: () => {
      const { currentIndex, canGoPrev, columns, selectedStageIds } = get()

      if (!canGoPrev) {
        return
      }

      const newIndex = currentIndex - 1

      set({
        currentIndex: newIndex,
        shouldAnimate: true,
        ...computeDerivedState(columns, selectedStageIds, newIndex),
      })
    },

    selectStage: (stageId: string) => {
      const { filteredColumns, columns, selectedStageIds } = get()

      const index = filteredColumns.findIndex(
        (col) => col.header.id === stageId,
      )

      if (index === -1) {
        return
      }

      set({
        currentIndex: index,
        shouldAnimate: true,
        ...computeDerivedState(columns, selectedStageIds, index),
      })
    },

    // go to specific column only with stageId, this can be infered in that method
    goToIndex: (index: number) => {
      const { filteredColumns, columns, selectedStageIds } = get()

      const clampedIndex = Math.max(
        0,
        Math.min(index, filteredColumns.length - 1),
      )

      set({
        currentIndex: clampedIndex,
        shouldAnimate: true,
        ...computeDerivedState(columns, selectedStageIds, clampedIndex),
      })
    },

    resetPosition: () => {
      const { columns, selectedStageIds } = get()

      set({
        currentIndex: 0,
        shouldAnimate: true,
        ...computeDerivedState(columns, selectedStageIds, 0),
      })
    },
  }))

const ColumnContext = createContext<StoreApi<ColumnsStore> | null>(null)

type ColumnProviderProps = PropsWithChildren<{ columns: UIColumns[] }>

export function ColumnsProvider({ children, columns }: ColumnProviderProps) {
  const storeRef = useRef<StoreApi<ColumnsStore>>(null)
  const availableTrackIds = columns.map((col) => col.header.id)

  if (!storeRef.current) {
    const derived = computeDerivedState(columns, availableTrackIds, 0)

    storeRef.current = createColumnsStore({
      columns,
      selectedStageIds: availableTrackIds,
      availableStageIds: availableTrackIds,
      currentIndex: 0,
      shouldAnimate: true,
      ...derived,
    })
  }

  useEffect(() => {
    const storedIds = trackSelectionStorage.get()

    if (!storedIds) {
      trackSelectionStorage.set(availableTrackIds)
      return
    }

    if (storedIds.length <= 0) return

    const validStoredIds = getValidTrackIds(storedIds, availableTrackIds)

    const derived = computeDerivedState(columns, validStoredIds, 0)
    storeRef.current?.setState({ selectedStageIds: validStoredIds, ...derived })
  }, [])

  return (
    <ColumnContext.Provider value={storeRef.current}>
      {children}
    </ColumnContext.Provider>
  )
}

export function useColumnsStore<T>(selector: (state: ColumnsStore) => T): T {
  const store = useContext(ColumnContext)

  if (!store) {
    throw new Error('useColumnsStore must be used within a ColumnsProvider')
  }
  return useStore(store, selector)
}
