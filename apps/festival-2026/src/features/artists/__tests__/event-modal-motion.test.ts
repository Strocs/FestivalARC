// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({
  timelines: [] as Array<Record<string, ReturnType<typeof vi.fn>>>,
  callbacks: [] as Array<{ onComplete?: () => void, onReverseComplete?: () => void }>,
}))
vi.mock('gsap', () => ({ gsap: { timeline: vi.fn((callbacks: { onComplete?: () => void, onReverseComplete?: () => void }) => {
  const timeline: Record<string, ReturnType<typeof vi.fn>> = {}
  for (const key of ['addLabel', 'fromTo', 'to', 'play', 'pause', 'reverse', 'invalidate', 'kill', 'revert', 'eventCallback']) timeline[key] = vi.fn(() => timeline)
  let progress = 0.37
  timeline.progress = vi.fn((value?: number, suppressEvents = false) => {
    if (value === undefined) return progress
    progress = value
    // Deterministic endpoint renderer, not a timer or native/browser animation claim.
    for (const [targets, from, to] of timeline.fromTo.mock.calls) {
      for (const target of Array.isArray(targets) ? targets : [targets]) {
        const vars = value === 0 ? from : value === 1 ? to : null
        if (!vars) continue
        for (const [key, raw] of Object.entries(vars)) {
          const result = typeof raw === 'function' ? raw() : raw
          if (key.startsWith('--')) target.style.setProperty(key, String(result))
          else if (key === 'opacity' || key === 'fontSize') target.style[key] = String(result)
          else if (key === 'autoAlpha') { target.style.opacity = String(result); target.style.visibility = result === 0 ? 'hidden' : 'inherit' }
        }
      }
    }
    if (!suppressEvents && value === 1) callbacks.onComplete?.()
    if (!suppressEvents && value === 0) callbacks.onReverseComplete?.()
    return timeline
  })
  mock.timelines.push(timeline); mock.callbacks.push(callbacks)
  return timeline
}) } }))
import { createModalMotion } from '../event-modal-motion'
const rect = (x: number, y: number, width: number, height: number) => ({ x, y, left: x, top: y, right: x + width, bottom: y + height, width, height, toJSON() {} })
afterEach(() => { mock.timelines.length = 0; mock.callbacks.length = 0; document.body.innerHTML = '' })
describe('GSAP modal score', () => {
  it('coordinates a separate surface, title, metadata and details using viewport deltas, labels and overlap', () => {
    document.body.innerHTML = '<dialog><div data-modal-panel><div data-modal-surface></div><h2 id="event-modal-title">Name</h2><p data-modal-meta>Meta</p><div data-modal-details>Body</div></div></dialog>'
    const dialog = document.querySelector('dialog')!
    const panel = dialog.querySelector<HTMLElement>('[data-modal-panel]')!
    panel.getBoundingClientRect = () => rect(200, 100, 600, 500)
    dialog.querySelector('h2')!.getBoundingClientRect = () => rect(230, 130, 400, 60)
    const onOpened = vi.fn(); const onClosed = vi.fn()
    const motion = createModalMotion({ dialog, panel, sourceRect: rect(20, 300, 100, 50), titleRect: rect(30, 305, 80, 30), titleSize: 30, onOpened, onClosed })
    const timeline = mock.timelines[0]
    expect(timeline.addLabel.mock.calls.map(call => call[0])).toEqual(expect.arrayContaining(['surface', 'header', 'reveal']))
    const calls = timeline.fromTo.mock.calls
    const surface = calls.find(call => call[0] === panel.querySelector('[data-modal-surface]'))!
    expect(surface).toBeDefined()
    expect(surface[1].x()).toBe(-180); expect(surface[1].y()).toBe(200)
    expect(surface[1].scaleX()).toBeCloseTo(1 / 6); expect(surface[1].scaleY()).toBe(0.1)
    expect(surface[2]).toMatchObject({ x: 0, y: 0, scaleX: 1, scaleY: 1 })
    expect(calls.some(call => call[0] === panel)).toBe(false)
    const title = calls.find(call => call[0] === dialog.querySelector('[data-modal-title-proxy]'))!
    expect(title[1].x()).toBe(-200); expect(title[1].y()).toBe(175)
    expect(title[1]).not.toHaveProperty('scale')
    expect(calls.find(call => Array.isArray(call[0]) && call[0].includes(dialog.querySelector('[data-modal-details]')))?.[3]).toBe('reveal')
    expect(timeline.play).toHaveBeenCalledOnce()
    timeline.progress(1)
    expect(onOpened).toHaveBeenCalledOnce()
    expect(dialog.style.getPropertyValue('--event-backdrop')).toBe('1')
    expect(dialog.querySelector<HTMLElement>('[data-modal-details]')!.style.opacity).toBe('1')
    expect(dialog.querySelector('h2')!.style.opacity).toBe('1')
    motion.reverse({ sourceRect: rect(20, 300, 100, 50), titleRect: rect(30, 305, 80, 30) })
    timeline.progress(0)
    expect(onClosed).toHaveBeenCalledOnce()
    expect(dialog.style.getPropertyValue('--event-backdrop')).toBe('0')
    expect(dialog.querySelector<HTMLElement>('[data-modal-details]')!.style.visibility).toBe('hidden')
    motion.dispose(); expect(timeline.revert).toHaveBeenCalledOnce()
    expect(dialog.getAttribute('style')).toBe(null)
    mock.callbacks[0].onComplete?.(); mock.callbacks[0].onReverseComplete?.()
    expect(onOpened).toHaveBeenCalledOnce(); expect(onClosed).toHaveBeenCalledOnce()
  })
  it('keeps real title typography in flow and animates only a nonsemantic title proxy, then removes it on disposal', () => {
    document.body.innerHTML = '<dialog><div data-modal-panel><div data-modal-surface></div><h2 id="event-modal-title" tabindex="-1">Name</h2></div></dialog>'
    const dialog = document.querySelector('dialog')!
    const panel = dialog.querySelector<HTMLElement>('[data-modal-panel]')!
    const title = dialog.querySelector('h2')!
    title.getBoundingClientRect = () => rect(230, 130, 400, 60)
    panel.getBoundingClientRect = () => rect(200, 100, 600, 500)
    const motion = createModalMotion({ dialog, panel, sourceRect: rect(10, 10, 100, 50), titleRect: rect(10, 10, 100, 30), titleSize: 60, onOpened: vi.fn(), onClosed: vi.fn() })
    const proxy = panel.querySelector<HTMLElement>('[data-modal-title-proxy]')
    expect(proxy?.getAttribute('aria-hidden')).toBe('true')
    expect(proxy?.textContent).toBe('Name'); expect(proxy?.id).toBe('')
    expect(proxy?.style.position).toBe('absolute')
    expect(mock.timelines[0].fromTo.mock.calls.filter(call => call[0] === title).every(call => !('fontSize' in call[1]))).toBe(true)
    motion.dispose(); expect(panel.querySelector('[data-modal-title-proxy]')).toBe(null)
  })
  it('reverses the current playhead without seeking the endpoint, remeasures and uses a fade for missing origin', () => {
    document.body.innerHTML = '<dialog><div data-modal-panel><div data-modal-surface></div><h2 id="event-modal-title">Name</h2></div></dialog>'
    const dialog = document.querySelector('dialog')!
    const panel = dialog.querySelector<HTMLElement>('[data-modal-panel]')!
    panel.getBoundingClientRect = () => rect(200, 100, 600, 500)
    const motion = createModalMotion({ dialog, panel, sourceRect: rect(10, 10, 100, 50), titleRect: null, titleSize: 30, onOpened: vi.fn(), onClosed: vi.fn() })
    motion.reverse({ sourceRect: rect(40, 400, 100, 50), titleRect: null })
    expect(mock.timelines[0].reverse).toHaveBeenCalledWith()
    expect(mock.timelines[0].progress.mock.calls.every(call => call[0] !== 1)).toBe(true)
    const surface = mock.timelines[0].fromTo.mock.calls[0]
    expect(surface[1].x()).toBe(-160); expect(surface[1].y()).toBe(300)
    motion.dispose()
    const missing = createModalMotion({ dialog, panel, sourceRect: null, titleRect: null, titleSize: 30, onOpened: vi.fn(), onClosed: vi.fn() })
    missing.reverse({ sourceRect: null, titleRect: null })
    expect(mock.timelines.at(-1)!.to).toHaveBeenCalled()
    missing.dispose()
  })
})
