// import { describe, it, expect, beforeEach } from 'vitest'
// import { renderHook, act } from '@testing-library/react'
// import { useNavigation } from '../../hooks/use-navigation'
// import {
//   initializeNavigation,
//   useNavigationStore,
// } from '../../stores/navigation-store'
//
// describe('useNavigation hook', () => {
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
//   it('should return current navigation state', () => {
//     initializeNavigation(3, 5, 1)
//     const { result } = renderHook(() => useNavigation())
//
//     expect(result.current.currentDayIndex).toBe(1)
//     expect(result.current.currentColumnIndex).toBe(0)
//     expect(result.current.canGoNextDay).toBe(true)
//     expect(result.current.canGoPrevDay).toBe(true)
//   })
//
//   it('should provide day navigation actions', () => {
//     initializeNavigation(3, 5)
//     const { result } = renderHook(() => useNavigation())
//
//     act(() => {
//       result.current.nextDay()
//     })
//
//     expect(result.current.currentDayIndex).toBe(1)
//   })
//
//   it('should provide column navigation actions', () => {
//     initializeNavigation(3, 5)
//     const { result } = renderHook(() => useNavigation())
//
//     act(() => {
//       result.current.goToColumn(2)
//     })
//
//     expect(result.current.currentColumnIndex).toBe(2)
//   })
// })
