export interface StageSelectionState {
  selectedStageIds: Set<string>
  availableStageIds: string[]
}

export interface StageSelectionActions {
  toggleStage: (stageId: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleAll: () => void
  setStages: (stageIds: string[]) => void
}

export interface StageSelectionStore
  extends StageSelectionState,
    StageSelectionActions {
  isAllSelected: boolean
  isNoneSelected: boolean
  selectedCount: number
}

export interface ScrollState {
  offset: number
  isDragging: boolean
  currentColumnIndex: number
}

export interface ScrollActions {
  setOffset: (offset: number) => void
  setDragging: (isDragging: boolean) => void
  goToColumn: (index: number) => void
  goNext: () => void
  goPrev: () => void
  reset: () => void
}

export interface ScrollStore extends ScrollState, ScrollActions {
  canGoNext: boolean
  canGoPrev: boolean
}

export interface UIState {
  openModalId: string | null
  isStageNavigatorOpen: boolean
  isSidebarExpanded: boolean
}

export interface UIActions {
  openModal: (id: string) => void
  closeModal: () => void
  toggleStageNavigator: () => void
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
}

export interface UIStore extends UIState, UIActions {}
