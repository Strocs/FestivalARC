import { gsap } from 'gsap'

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
export interface FilterMotion { dispose: () => void }

/** Manual FLIP over already measured paint; GSAP never reads element transforms. */
export function createFilterMotion(input: FilterMotionInput): FilterMotion {
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
  const progress = { exit: 0, move: 0, enter: 0 }
  const groups: Record<keyof typeof progress, FilterPaint[]> = { exit: [], move: [], enter: [] }
  for (const item of input.items) groups[item.last ? item.first ? 'move' : 'enter' : 'exit'].push(item)
  const render = (kind: keyof typeof progress) => {
    const remaining = 1 - progress[kind]
    for (const { node, first, firstAlpha = 1, last } of groups[kind]) {
      const x = first && last ? (first.left - last.left) * remaining : 0
      const y = first && last ? (first.top - last.top) * remaining : 0
      const opacity = kind === 'exit' ? firstAlpha * remaining
        : kind === 'enter' ? progress[kind] : firstAlpha + (1 - firstAlpha) * progress[kind]
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`
      node.style.opacity = String(opacity)
      node.style.visibility = opacity === 0 ? 'hidden' : 'inherit'
    }
  }
  let disposed = false
  const timeline = gsap.timeline({ paused: true, defaults: { duration: 0.44, ease: 'power2.out' }, onComplete: input.onComplete })
  try {
    timeline.addLabel('exit', 0).addLabel('move', 0.04).addLabel('enter', 0.1)
    // Commit outgoing geometry together before any animation frames. No layout
    // reads or CSSPlugin initialization are needed to prepare or restore paint.
    for (const { node, first } of groups.exit) if (first) {
      Object.assign(node.style, { position: 'absolute', gridArea: 'auto', left: `${first.left - input.gridRect.left}px`, top: `${first.top - input.gridRect.top}px`, width: `${first.width}px`, height: `${first.height}px`, display: 'block' })
    }
    for (const { node } of input.items) node.style.willChange = 'transform, opacity'
    for (const kind of ['exit', 'move', 'enter'] as const) if (groups[kind].length) {
      render(kind)
      // Three numeric tracks at most, independent of the number of tiles.
      timeline.to(progress, { [kind]: 1, duration: kind === 'exit' ? 0.18 : 0.44, onUpdate: () => render(kind) }, kind)
    }
    timeline.play()
  } catch (error) {
    timeline.kill(); restores.forEach(restore => restore()); throw error
  }
  return { dispose() {
    if (disposed) return
    disposed = true; timeline.kill(); restores.forEach(restore => restore())
  } }
}
