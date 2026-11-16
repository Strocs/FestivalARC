// @vitest-environment jsdom
import { gsap } from 'gsap'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createModalMotion, type ModalMotion } from '../event-modal-motion'

const rect = (x: number, y: number, width: number, height: number) => new DOMRect(x, y, width, height)
let motion: ModalMotion | undefined

afterEach(() => {
  motion?.dispose()
  motion = undefined
  gsap.globalTimeline.clear()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

function setup(initiallyOpen = false) {
  document.body.innerHTML = `<dialog aria-labelledby="event-modal-title"><div data-modal-panel>
    <div data-artist-surface></div><button data-modal-close style="color: red">Cerrar detalle</button>
    <h2 id="event-modal-title" tabindex="-1"><span data-artist-name style="font-size: 36px">Name</span></h2>
    <p data-modal-meta>Meta</p><div data-modal-details>Body</div><footer>Entradas</footer>
  </div></dialog>`
  const dialog = document.querySelector('dialog')!
  const panel = dialog.querySelector<HTMLElement>('[data-modal-panel]')!
  const title = panel.querySelector<HTMLElement>('[data-artist-name]')!
  const close = panel.querySelector<HTMLElement>('[data-modal-close]')!
  panel.getBoundingClientRect = () => rect(200, 100, 600, 500)
  title.getBoundingClientRect = () => rect(230, 130, 400, 60)
  const source = { sourceRect: rect(20, 300, 100, 50), titleRect: rect(30, 305, 80, 30) }
  const metadata = document.createElement('span')
  metadata.innerHTML = '<time>Domingo 29</time><span>Ver más</span>'
  metadata.style.cssText = 'opacity:0;visibility:hidden;color:red'
  document.body.append(metadata)
  const sourceMetadata = { element: metadata, opacity: 0.6, visibility: 'visible' }
  const onClosed = vi.fn()
  const timelineSpy = vi.spyOn(gsap, 'timeline')
  motion = createModalMotion({ dialog, panel, ...source, sourceMetadata, titleSize: 20, initiallyOpen, onOpened: vi.fn(), onClosed })
  const timeline = timelineSpy.mock.results[0].value as gsap.core.Timeline
  timeline.pause()
  return { dialog, panel, title, close, source, timeline, onClosed, metadata }
}

// GSAP owns these inline paint declarations. Avoid a jsdom cascade walk at
// every seek; retain computed-style fallback for untouched/default opacity.
const opacity = (node: HTMLElement) => Number(node.style.opacity || getComputedStyle(node).opacity || '1')

describe('modal title and close-button paint with real GSAP', () => {
  it.each([false, true])('fades source metadata within the existing score and retains its hidden controller endpoint on disposal (initiallyOpen=%s)', initiallyOpen => {
    const { timeline, source, metadata, onClosed } = setup(initiallyOpen)
    expect(timeline.duration()).toBe(0.45)
    if (initiallyOpen) {
      expect(opacity(metadata)).toBe(0)
      expect(metadata.style.visibility).toBe('hidden')
    } else {
      expect(opacity(metadata)).toBe(0.6)
      timeline.time(0.075)
      expect(opacity(metadata)).toBeGreaterThan(0)
      expect(opacity(metadata)).toBeLessThan(0.6)
      expect(onClosed).not.toHaveBeenCalled()
    }
    timeline.time(0.15)
    expect(opacity(metadata)).toBe(0)
    expect(metadata.style.visibility).toBe('hidden')
    timeline.progress(1)
    motion!.reverse(source)
    timeline.pause().time(0.2)
    expect(opacity(metadata)).toBe(0)
    timeline.time(0.075)
    expect(opacity(metadata)).toBeGreaterThan(0)
    expect(opacity(metadata)).toBeLessThan(0.6)
    expect(getComputedStyle(metadata).visibility).toBe('visible')
    expect(onClosed).not.toHaveBeenCalled()
    timeline.time(0, false)
    expect(opacity(metadata)).toBe(0.6)
    expect(onClosed).toHaveBeenCalledOnce()
    metadata.style.color = 'blue'
    motion!.dispose()
    expect(opacity(metadata)).toBe(0)
    expect(metadata.style.visibility).toBe('hidden')
    expect(metadata.style.color).toBe('blue')
  })

  it('reverses partial source fade from its current opacity and keeps metadata hidden if opening is settled', () => {
    const { timeline, source, metadata, onClosed } = setup()
    timeline.time(0.06)
    const partial = opacity(metadata)
    expect(partial).toBeGreaterThan(0)
    expect(partial).toBeLessThan(0.6)
    motion!.reverse(source)
    timeline.pause()
    expect(opacity(metadata)).toBe(partial)
    timeline.time(0.03)
    expect(opacity(metadata)).toBeGreaterThan(partial)
    expect(onClosed).not.toHaveBeenCalled()
    timeline.progress(1, true)
    motion!.dispose()
    expect(opacity(metadata)).toBe(0)
    expect(metadata.style.visibility).toBe('hidden')
  })
  it('fades modal metadata, body and footer with the close button in both directions', () => {
    const { panel, close, timeline, source } = setup()
    const content = [...panel.querySelectorAll<HTMLElement>('[data-modal-meta], [data-modal-details], footer')]
    for (const node of content) {
      expect(opacity(node)).toBe(0)
      expect(getComputedStyle(node).visibility).toBe('hidden')
    }
    for (const time of [0.12, 0.22, 0.29]) {
      timeline.time(time)
      for (const node of content) expect(opacity(node)).toBe(0)
    }
    timeline.time(0.375)
    for (const node of content) {
      expect(opacity(node)).toBeGreaterThan(0)
      expect(opacity(node)).toBeLessThan(1)
      expect(opacity(node)).toBe(opacity(close))
    }
    timeline.progress(1)
    for (const node of content) expect(opacity(node)).toBe(1)
    motion!.reverse(source)
    timeline.pause().time(0.375)
    for (const node of content) expect(opacity(node)).toBe(opacity(close))
    timeline.time(0.3)
    for (const node of content) {
      expect(opacity(node)).toBe(0)
      expect(getComputedStyle(node).visibility).toBe('hidden')
    }
    motion!.dispose()
    for (const node of content) expect(node.getAttribute('style')).toBe(null)
  })

  it('reveals the close button only after the flight, then fades it before the return flight', () => {
    const { panel, title, close, timeline, source } = setup()
    expect(timeline.duration()).toBe(0.45)
    expect(getComputedStyle(close).visibility).toBe('hidden')
    timeline.time(0.29)
    expect(opacity(close)).toBe(0)
    timeline.time(0.3)
    expect(Number(gsap.getProperty(title, 'x'))).toBe(0)
    expect(Number(gsap.getProperty(title, 'y'))).toBe(0)
    expect(title.style.fontSize).toBe('36px')
    const surface = panel.querySelector<HTMLElement>('[data-artist-surface]')!
    for (const property of ['x', 'y']) expect(Number(gsap.getProperty(surface, property))).toBe(0)
    for (const property of ['scaleX', 'scaleY']) expect(Number(gsap.getProperty(surface, property))).toBe(1)
    timeline.time(0.375)
    expect(opacity(close)).toBeGreaterThan(0)
    expect(opacity(close)).toBeLessThan(1)
    timeline.progress(1)
    expect(opacity(close)).toBe(1)
    motion!.reverse(source)
    timeline.pause().time(0.375)
    expect(opacity(close)).toBeGreaterThan(0)
    expect(opacity(close)).toBeLessThan(1)
    timeline.time(0.3)
    expect(getComputedStyle(close).visibility).toBe('hidden')
    motion!.dispose()
    expect(close.getAttribute('style')).toBe('color: red')
  })

  it('keeps one visible title through opening, rest and the reverse flight', () => {
    const { dialog, title, source, timeline, onClosed } = setup()
    expect(opacity(title)).toBe(1)
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.closest('h2')!.id)
    expect(title.getAttribute('aria-hidden')).toBe(null)
    timeline.time(0.2)
    expect(opacity(title)).toBe(1)
    expect(Number(gsap.getProperty(title, 'x'))).toBeLessThan(0)
    timeline.progress(1)
    expect(opacity(title)).toBe(1)
    expect(Number(gsap.getProperty(title, 'x'))).toBe(0)
    motion!.reverse(source)
    timeline.pause().time(0.2)
    expect(opacity(title)).toBe(1)
    expect(Number(gsap.getProperty(title, 'x'))).toBeLessThan(0)
    timeline.time(0, false)
    expect(Number(gsap.getProperty(title, 'x'))).toBe(-200)
    expect(Number(gsap.getProperty(title, 'y'))).toBe(175)
    expect(onClosed).toHaveBeenCalledOnce()
    motion!.dispose()
    expect(title.getAttribute('style')).toBe('font-size: 36px')
  })

  it('keeps the title visible when rebuilding an open modal and remeasures its return destination', () => {
    const { title, timeline } = setup(true)
    expect(opacity(title)).toBe(1)
    motion!.reverse({ sourceRect: rect(40, 400, 100, 50), titleRect: rect(50, 405, 80, 30) })
    timeline.pause().time(0.2)
    expect(opacity(title)).toBe(1)
    timeline.time(0, false)
    expect(Number(gsap.getProperty(title, 'x'))).toBe(-180)
    expect(Number(gsap.getProperty(title, 'y'))).toBe(275)
  })
})
