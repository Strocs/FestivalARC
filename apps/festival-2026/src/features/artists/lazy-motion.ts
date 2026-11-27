import type { ModalMotion, MotionInput } from './event-modal-motion'
import type { FilterMotion, FilterMotionInput } from '../poster/poster-filter-motion'

let modalMotion: typeof import('./event-modal-motion') | undefined
let filterMotion: typeof import('../poster/poster-filter-motion') | undefined
let loading: Promise<void> | undefined

/** Warm animations on intent without blocking controls or loading GSAP at startup. */
export function preloadMotion(): void {
  loading ??= Promise.all([
    import('./event-modal-motion'),
    import('../poster/poster-filter-motion'),
  ]).then(([modal, filter]) => {
    modalMotion = modal
    filterMotion = filter
  }).catch(() => {
    // Native controls and settled modal/filter endpoints remain available.
  })
}

export function isMotionReady(): boolean {
  return !!modalMotion && !!filterMotion
}

export function createLazyModalMotion(input: MotionInput): ModalMotion {
  if (modalMotion) return modalMotion.createModalMotion(input)
  preloadMotion()
  input.onOpened()
  return { reverse: () => input.onClosed(), dispose() {} }
}

export function createLazyFilterMotion(input: FilterMotionInput): FilterMotion {
  if (filterMotion) return filterMotion.createFilterMotion(input)
  preloadMotion()
  input.onComplete()
  return { dispose() {} }
}
