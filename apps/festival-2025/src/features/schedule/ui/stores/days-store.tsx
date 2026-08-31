import {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from 'react'
import { createStore, useStore, type StoreApi } from 'zustand'

export interface DaysProps {
  days: string[]
}

export interface DaysStore extends DaysProps {
  currentDayIndex: number
  canGoNextDay: boolean
  canGoPrevDay: boolean

  setDay: (index: number) => void
  nextDay: () => void
  prevDay: () => void
}

// Techincal doubt: we should create a more generic and conceptual naming for this feature, something like a group of schedules (like multi day events, conferences, etc)
const createDaysStore = (days: string[]) =>
  createStore<DaysStore>()((set, get) => ({
    currentDayIndex: 0,
    days,
    canGoNextDay: days.length > 1,
    canGoPrevDay: false,

    setDay: (index: number) => {
      const totalDays = get().days?.length
      if (index >= 0 && index < totalDays) {
        set({
          currentDayIndex: index,
          canGoNextDay: index < totalDays - 1,
          canGoPrevDay: index > 0,
        })
      }
    },

    nextDay: () => {
      const currentDayIndex = get().currentDayIndex
      const totalDays = get().days.length
      const newIndex = Math.min(currentDayIndex + 1, totalDays - 1)
      set({
        currentDayIndex: newIndex,
        canGoNextDay: newIndex < totalDays - 1,
        canGoPrevDay: newIndex > 0,
      })
    },

    prevDay: () => {
      const currentDayIndex = get().currentDayIndex
      const totalDays = get().days.length
      const newIndex = Math.max(currentDayIndex - 1, 0)
      set({
        currentDayIndex: newIndex,
        canGoNextDay: newIndex < totalDays - 1,
        canGoPrevDay: newIndex > 0,
      })
    },
  }))

const DaysContext = createContext<StoreApi<DaysStore> | null>(null)

type DaysProviderProps = PropsWithChildren<DaysProps>

export function DaysProvider({ children, days }: DaysProviderProps) {
  const storeRef = useRef<StoreApi<DaysStore>>(null)

  if (!storeRef.current) {
    storeRef.current = createDaysStore(days)
  }

  return (
    <DaysContext.Provider value={storeRef.current}>
      {children}
    </DaysContext.Provider>
  )
}

export function useDaysStore<T>(selector: (state: DaysStore) => T): T {
  const store = useContext(DaysContext)

  if (!store) {
    throw new Error('useDaysStore must be used within a DaysStoreProvider')
  }
  return useStore(store, selector)
}
