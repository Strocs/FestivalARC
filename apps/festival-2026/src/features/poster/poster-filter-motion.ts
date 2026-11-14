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

/** Manual FLIP: callers batch First, commit flow once, compensate scroll, batch Last.
 * Only presentation is owned here; endpoint variables and hover layers stay intact.
 */
export function createFilterMotion(input: FilterMotionInput): FilterMotion {
  const properties = ['transform', 'translate', 'scale', 'rotate', 'opacity', 'visibility', 'position', 'left', 'top', 'width', 'height', 'display', 'grid-area', 'will-change']
  const restores = input.items.map(({ node }) => {
    const absent = !node.hasAttribute('style')
    const saved = properties.map(key => [key, node.style.getPropertyValue(key), node.style.getPropertyPriority(key)] as const)
    return () => {
      // Public CSSPlugin cleanup invalidates its transform cache before restoring
      // the wrapper's original declarations; no private GSAP cache API is needed.
      gsap.set(node, { clearProps: 'transform' })
      for (const [key, value, priority] of saved) {
        if (value) node.style.setProperty(key, value, priority)
        else node.style.removeProperty(key)
      }
      if (absent && !node.style.cssText) node.removeAttribute('style')
    }
  })
  let disposed = false
  const timeline = gsap.timeline({ paused: true, defaults: { duration: 0.44, ease: 'power2.out' }, onComplete: input.onComplete })
  try {
    timeline.addLabel('exit', 0).addLabel('move', 0.04).addLabel('enter', 0.1)
    for (const { node, first, firstAlpha = 1, last } of input.items) {
      node.style.willChange = 'transform, opacity'
      if (!last && first) {
        // Real source node remains outgoing paint outside shrinking grid tracks.
        Object.assign(node.style, { position: 'absolute', gridArea: 'auto', left: `${first.left - input.gridRect.left}px`, top: `${first.top - input.gridRect.top}px`, width: `${first.width}px`, height: `${first.height}px`, display: 'block' })
        gsap.set(node, { x: 0, y: 0, autoAlpha: firstAlpha })
        timeline.to(node, { autoAlpha: 0, duration: 0.18 }, 'exit')
      } else if (last) {
        gsap.set(node, { x: first ? first.left - last.left : 0, y: first ? first.top - last.top : 0, autoAlpha: first ? firstAlpha : 0 })
        timeline.to(node, { x: 0, y: 0, autoAlpha: 1 }, first ? 'move' : 'enter')
      }
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
