// import { describe, it, expect, beforeEach } from 'vitest'
// import { act } from '@testing-library/react'
// import {
//   useDaysStore,
// } from '../../stores/days-store.tsx'
//
// describe('Navigation Store - Zustand implementation', () => {
//   beforeEach(() => {
//     useNavigationStore.setState({
//       currentDayIndex: 0,
//       currentColumnIndex: 0,
//       totalDays: 1,
//       totalColumns: 0,
//       canGoNextDay: false,
//       canGoPrevDay: false,
//       canGoNextColumn: false,
//       canGoPrevColumn: false,
//     })
//   })
//
//   describe('Initialization', () => {
//     it('should initialize with default values', () => {
//       initializeNavigation(3, 5)
//       const state = useNavigationStore.getState()
//
//       expect(state.currentDayIndex).toBe(0)
//       expect(state.currentColumnIndex).toBe(0)
//       expect(state.totalDays).toBe(3)
//       expect(state.totalColumns).toBe(5)
//       expect(state.canGoNextDay).toBe(true)
//       expect(state.canGoPrevDay).toBe(false)
//       expect(state.canGoNextColumn).toBe(true)
//       expect(state.canGoPrevColumn).toBe(false)
//     })
//
//     it('should initialize with custom initialDay', () => {
//       initializeNavigation(3, 5, 1)
//       const state = useNavigationStore.getState()
//
//       expect(state.currentDayIndex).toBe(1)
//       expect(state.canGoNextDay).toBe(true)
//       expect(state.canGoPrevDay).toBe(true)
//     })
//   })
//
//   describe('Day navigation', () => {
//     beforeEach(() => {
//       initializeNavigation(3, 5)
//     })
//
//     it('should navigate to next day', () => {
//       const { nextDay } = useNavigationStore.getState()
//       act(() => nextDay())
//
//       const state = useNavigationStore.getState()
//       expect(state.currentDayIndex).toBe(1)
//       expect(state.canGoNextDay).toBe(true)
//       expect(state.canGoPrevDay).toBe(true)
//     })
//
//     it('should navigate to previous day', () => {
//       const { setDay, prevDay } = useNavigationStore.getState()
//       act(() => setDay(1))
//       act(() => prevDay())
//
//       const state = useNavigationStore.getState()
//       expect(state.currentDayIndex).toBe(0)
//       expect(state.canGoNextDay).toBe(true)
//       expect(state.canGoPrevDay).toBe(false)
//     })
//
//     it('should set day directly', () => {
//       const { setDay } = useNavigationStore.getState()
//       act(() => setDay(2))
//
//       const state = useNavigationStore.getState()
//       expect(state.currentDayIndex).toBe(2)
//       expect(state.canGoNextDay).toBe(false)
//       expect(state.canGoPrevDay).toBe(true)
//     })
//
//     it('should not go beyond last day', () => {
//       const { setDay, nextDay } = useNavigationStore.getState()
//       act(() => setDay(2))
//       act(() => nextDay())
//
//       const state = useNavigationStore.getState()
//       expect(state.currentDayIndex).toBe(2)
//       expect(state.canGoNextDay).toBe(false)
//     })
//
//     it('should not go before first day', () => {
//       const { prevDay } = useNavigationStore.getState()
//       act(() => prevDay())
//
//       const state = useNavigationStore.getState()
//       expect(state.currentDayIndex).toBe(0)
//       expect(state.canGoPrevDay).toBe(false)
//     })
//
//     it('should ignore invalid setDay calls', () => {
//       const { setDay } = useNavigationStore.getState()
//
//       act(() => setDay(-1))
//       expect(useNavigationStore.getState().currentDayIndex).toBe(0)
//
//       act(() => setDay(5))
//       expect(useNavigationStore.getState().currentDayIndex).toBe(0)
//     })
//   })
//
//   describe('Column navigation', () => {
//     beforeEach(() => {
//       initializeNavigation(3, 5)
//     })
//
//     it('should navigate to specific column', () => {
//       const { goToColumn } = useNavigationStore.getState()
//       act(() => goToColumn(2))
//
//       const state = useNavigationStore.getState()
//       expect(state.currentColumnIndex).toBe(2)
//       expect(state.canGoNextColumn).toBe(true)
//       expect(state.canGoPrevColumn).toBe(true)
//     })
//
//     it('should reset column to 0', () => {
//       const { goToColumn, resetColumn } = useNavigationStore.getState()
//       act(() => goToColumn(3))
//       act(() => resetColumn())
//
//       const state = useNavigationStore.getState()
//       expect(state.currentColumnIndex).toBe(0)
//       expect(state.canGoNextColumn).toBe(true)
//       expect(state.canGoPrevColumn).toBe(false)
//     })
//
//     it('should clamp column index to valid range', () => {
//       const { goToColumn } = useNavigationStore.getState()
//
//       act(() => goToColumn(-5))
//       expect(useNavigationStore.getState().currentColumnIndex).toBe(0)
//
//       act(() => goToColumn(10))
//       expect(useNavigationStore.getState().currentColumnIndex).toBe(4)
//     })
//   })
// })
