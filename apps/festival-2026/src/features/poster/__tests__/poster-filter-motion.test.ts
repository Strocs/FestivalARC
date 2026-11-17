// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFilterMotion } from '../poster-filter-motion'

const rect = (left: number, top: number) => ({ left, top, width: 100, height: 50 } as DOMRect)
const mockAnimation = (node: HTMLElement) => {
  let finish!: () => void
  let reject!: () => void
  const finished = new Promise<void>((resolve, fail) => { finish = resolve; reject = () => fail(new Error('cancelled')) })
  const animation = { finished, cancel: vi.fn(() => reject()) } as unknown as Animation
  const animate = vi.fn(() => animation)
  Object.assign(node, { animate })
  return { animate, finish }
}
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })
describe('manual FLIP presentation adapter', () => {
  it('coordinates exit, movement and entry without per-node computed-style reads', async () => {
    const retained = document.createElement('div'); const exit = document.createElement('div'); const entry = document.createElement('div')
    document.body.append(retained, exit, entry)
    retained.style.cssText = '--mobile-row:2;color:red'
    const animations = [retained, exit, entry].map(mockAnimation)
    const computed = vi.spyOn(window, 'getComputedStyle')
    const onComplete = vi.fn()
    const motion = createFilterMotion({ gridRect: rect(0, 20), items: [
      { node: retained, first: rect(10, 100), last: rect(20, 50) },
      { node: exit, first: rect(5, 300) },
      { node: entry, last: rect(0, 40) },
    ], onComplete })
    for (const [index, { animate }] of animations.entries()) {
      expect(animate).toHaveBeenCalledOnce()
      expect(animate.mock.calls[0]).toEqual([
        [
          { transform: index === 0 ? 'translate3d(-10px, 50px, 0)' : 'translate3d(0px, 0px, 0)', opacity: index === 2 ? 0 : 1 },
          { transform: 'translate3d(0px, 0px, 0)', opacity: index === 1 ? 0 : 1 },
        ],
        { delay: [40, 0, 100][index], duration: index === 1 ? 180 : 440, easing: 'cubic-bezier(0.333333, 1, 0.666667, 1)', fill: 'both' },
      ])
    }
    expect(computed).not.toHaveBeenCalled()
    animations.forEach(animation => animation.finish())
    await Promise.resolve()
    expect(onComplete).toHaveBeenCalledOnce()
    motion.dispose(); motion.dispose()
    expect(onComplete).toHaveBeenCalledOnce()
    expect(computed).not.toHaveBeenCalled()
  })
  it('cancels without delivering a stale completion or erasing endpoint variables', async () => {
    const node = document.createElement('div'); document.body.append(node)
    node.style.cssText = '--desktop-row:8;opacity:0.8'
    const animation = mockAnimation(node)
    const onComplete = vi.fn(); const motion = createFilterMotion({ gridRect: rect(0, 0), items: [{ node, first: rect(0, 20), last: rect(0, 5) }], onComplete })
    motion.dispose(); animation.finish()
    await Promise.resolve()
    expect(onComplete).not.toHaveBeenCalled(); expect(node.style.opacity).toBe('0.8'); expect(node.style.getPropertyValue('--desktop-row')).toBe('8')
  })
})
