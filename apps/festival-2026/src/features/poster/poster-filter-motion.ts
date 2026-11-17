export interface FilterPaint {
  node: HTMLElement
  first?: DOMRect
  firstAlpha?: number
  last?: DOMRect
}
export interface FilterMotionInput {
  items: FilterPaint[]
  gridRect: DOMRect
  onComplete: () => void
}
export interface FilterMotionSample { x: number; y: number; opacity: number }
export interface FilterMotion {
  dispose: () => void
  sample?: (node: HTMLElement) => FilterMotionSample | undefined
}

/** Manual FLIP over already measured paint; only the browser advances frames. */
export function createFilterMotion(input: FilterMotionInput): FilterMotion {
  if (input.items.some(({ node }) => typeof node.animate !== 'function')) {
    input.onComplete()
    return { dispose() {} }
  }
  const properties = ['transform', 'opacity', 'visibility', 'position', 'left', 'top', 'width', 'height', 'display', 'grid-area', 'will-change']
  const restores = input.items.map(({ node }) => {
    const absent = !node.hasAttribute('style')
    const saved = properties.map(key => [key, node.style.getPropertyValue(key), node.style.getPropertyPriority(key)] as const)
    return () => {
      for (const [key, value, priority] of saved) {
        if (value) node.style.setProperty(key, value, priority)
        else node.style.removeProperty(key)
      }
      if (absent && !node.style.cssText) node.removeAttribute('style')
    }
  })
  const tracks = new Map<HTMLElement, { animation: Animation; x: number; y: number; fromAlpha: number; toAlpha: number }>()
  let disposed = false
  let completed = false
  let settingUp = true
  let remaining = 0
  const complete = () => {
    if (disposed || completed || settingUp || remaining !== 0) return
    completed = true
    input.onComplete()
  }
  const dispose = () => {
    if (disposed) return
    disposed = true
    for (const { animation } of tracks.values()) animation.cancel()
    restores.forEach(restore => restore())
  }
  try {
    // Commit outgoing geometry together before starting any animations.
    for (const { node, first, last } of input.items) if (first && !last) {
      Object.assign(node.style, { position: 'absolute', gridArea: 'auto', left: `${first.left - input.gridRect.left}px`, top: `${first.top - input.gridRect.top}px`, width: `${first.width}px`, height: `${first.height}px`, display: 'block' })
    }
    for (const { node, first, firstAlpha = 1, last } of input.items) {
      const kind = last ? first ? 'move' : 'enter' : 'exit'
      const x = first && last ? first.left - last.left : 0
      const y = first && last ? first.top - last.top : 0
      const fromAlpha = kind === 'enter' ? 0 : firstAlpha
      const toAlpha = kind === 'exit' ? 0 : 1
      node.style.willChange = 'transform, opacity'
      node.style.visibility = 'inherit'
      const animation = node.animate([
        { transform: `translate3d(${x}px, ${y}px, 0)`, opacity: fromAlpha },
        { transform: 'translate3d(0px, 0px, 0)', opacity: toAlpha },
      ], {
        duration: kind === 'exit' ? 180 : 440,
        delay: kind === 'exit' ? 0 : kind === 'move' ? 40 : 100,
        easing: 'cubic-bezier(0.333333, 1, 0.666667, 1)',
        fill: 'both',
      })
      tracks.set(node, { animation, x, y, fromAlpha, toAlpha })
      remaining++
      // Attach rejection handlers immediately, including during partial setup.
      void animation.finished.then(() => { remaining--; complete() }, () => {})
    }
    settingUp = false
    complete()
  } catch (error) {
    dispose()
    throw error
  }
  return {
    dispose,
    sample(node) {
      if (disposed) return undefined
      const track = tracks.get(node)
      if (!track) return undefined
      // Computed timing includes easing and backwards/forwards fill. No layout
      // or computed-style read is needed, and this runs only on interruption.
      const progress = track.animation.effect?.getComputedTiming().progress ?? 0
      return { x: track.x * (1 - progress), y: track.y * (1 - progress),
        opacity: track.fromAlpha + (track.toAlpha - track.fromAlpha) * progress }
    },
  }
}
