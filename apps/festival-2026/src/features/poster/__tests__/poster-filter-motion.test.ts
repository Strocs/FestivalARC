// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gsap } from 'gsap'
import { createFilterMotion } from '../poster-filter-motion'

const rect = (left: number, top: number) => ({ left, top, width: 100, height: 50 } as DOMRect)
afterEach(() => { gsap.globalTimeline.clear(); document.body.innerHTML = ''; vi.restoreAllMocks() })
describe('manual FLIP presentation adapter', () => {
  it('uses labelled overlapping transforms/autoAlpha and retains outgoing paint outside shrinking tracks', () => {
    const retained = document.createElement('div'); const exit = document.createElement('div'); const entry = document.createElement('div')
    document.body.append(retained, exit, entry)
    retained.style.cssText = '--mobile-row:2;color:red'
    const timeline = vi.spyOn(gsap, 'timeline'); const set = vi.spyOn(gsap, 'set')
    const onComplete = vi.fn()
    const motion = createFilterMotion({ gridRect: rect(0, 20), items: [
      { node: retained, first: rect(10, 100), last: rect(20, 50) },
      { node: exit, first: rect(5, 300) },
      { node: entry, last: rect(0, 40) },
    ], onComplete })
    const score = timeline.mock.results[0].value as gsap.core.Timeline
    expect(score.labels).toEqual({ exit: 0, move: 0.04, enter: 0.1 })
    expect(set).toHaveBeenCalledWith(retained, expect.objectContaining({ x: -10, y: 50, autoAlpha: 1 }))
    expect(set).toHaveBeenCalledWith(entry, expect.objectContaining({ x: 0, y: 0, autoAlpha: 0 }))
    expect(exit.style.position).toBe('absolute'); expect(exit.style.top).toBe('280px')
    expect(exit.style.width).toBe('100px'); expect(exit.style.gridArea).toBe('auto')
    score.progress(1)
    expect(onComplete).toHaveBeenCalledOnce()
    motion.dispose(); motion.dispose()
    expect(retained.style.getPropertyValue('--mobile-row')).toBe('2'); expect(retained.style.color).toBe('red')
    expect(retained.style.transform).toBe(''); expect(exit.style.position).toBe('')
    expect(entry.hasAttribute('style')).toBe(false)
  })
  it('cancels without delivering a stale completion or erasing endpoint variables', () => {
    const node = document.createElement('div'); document.body.append(node)
    node.style.cssText = '--desktop-row:8;opacity:0.8'
    const onComplete = vi.fn(); const motion = createFilterMotion({ gridRect: rect(0, 0), items: [{ node, first: rect(0, 20), last: rect(0, 5) }], onComplete })
    motion.dispose(); gsap.globalTimeline.progress(1)
    expect(onComplete).not.toHaveBeenCalled(); expect(node.style.opacity).toBe('0.8'); expect(node.style.getPropertyValue('--desktop-row')).toBe('8')
  })
})
