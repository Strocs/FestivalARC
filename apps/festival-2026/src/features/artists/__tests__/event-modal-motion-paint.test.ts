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

function setup(initiallyOpen = false, composed = false) {
  document.body.innerHTML = `<dialog aria-labelledby="event-modal-title"><div data-modal-panel>
    <div data-modal-surface></div><button data-modal-close style="color: red">Cerrar detalle</button>
    <h2 id="event-modal-title" tabindex="-1" style="font-size: 36px">Name</h2>
    <p data-modal-meta>Meta</p><div data-modal-details>Body</div><footer>Entradas</footer>
  </div></dialog>`
  const dialog = document.querySelector('dialog')!
  const panel = dialog.querySelector<HTMLElement>('[data-modal-panel]')!
  const title = panel.querySelector<HTMLElement>('h2')!
  const close = panel.querySelector<HTMLElement>('[data-modal-close]')!
  panel.getBoundingClientRect = () => rect(200, 100, 600, 500)
  title.getBoundingClientRect = () => rect(230, 130, 400, 60)
  const source = { sourceRect: rect(20, 300, 100, 50), titleRect: rect(30, 305, 80, 30) }
  const element = document.createElement('span')
  element.innerHTML = '<span data-modal-title-line style="display:inline-block">RED LAMBE</span><br style="display:block"><span data-modal-title-line style="display:inline-block">NORTE</span>'
  Object.assign(element.style, { fontSize: '20.4px', lineHeight: '1', textAlign: 'center', whiteSpace: 'nowrap', width: 'max-content' })
  const sourceTitle = composed ? { element, width: 80, height: 40, fontSize: 20.4, lineOffsets: [0, 12] } : undefined
  if (composed) {
    title.replaceChildren(...element.cloneNode(true).childNodes)
    Object.assign(title.style, { textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1' })
  }
  const onClosed = vi.fn()
  const timelineSpy = vi.spyOn(gsap, 'timeline')
  motion = createModalMotion({ dialog, panel, ...source, sourceTitle, titleSize: 20, initiallyOpen, onOpened: vi.fn(), onClosed })
  const timeline = timelineSpy.mock.results[0].value as gsap.core.Timeline
  timeline.pause()
  const proxy = panel.querySelector<HTMLElement>('[data-modal-title-proxy]')!
  return { dialog, panel, title, close, source, sourceTitle, proxy, timeline, onClosed }
}

// GSAP owns these inline paint declarations. Avoid a jsdom cascade walk at
// every seek; retain computed-style fallback for untouched/default opacity.
const opacity = (node: HTMLElement) => Number(node.style.opacity || getComputedStyle(node).opacity || '1')

describe('modal title and close-button paint with real GSAP', () => {
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
    const { panel, proxy, close, timeline, source } = setup()
    expect(timeline.duration()).toBe(0.45)
    expect(getComputedStyle(close).visibility).toBe('hidden')
    timeline.time(0.29)
    expect(opacity(close)).toBe(0)
    timeline.time(0.3)
    expect(Number(gsap.getProperty(proxy, 'x'))).toBe(0)
    expect(Number(gsap.getProperty(proxy, 'y'))).toBe(0)
    expect(proxy.style.fontSize).toBe('36px')
    const surface = panel.querySelector<HTMLElement>('[data-modal-surface]')!
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
    const { dialog, title, proxy, source, timeline, onClosed } = setup()
    expect(opacity(title)).toBe(0)
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id)
    expect(title.getAttribute('aria-hidden')).toBe(null)
    expect(proxy.getAttribute('aria-hidden')).toBe('true')
    timeline.time(0.2)
    expect(opacity(title)).toBe(0)
    expect(opacity(proxy)).toBe(1)
    expect(Number(gsap.getProperty(proxy, 'x'))).toBeLessThan(0)
    timeline.progress(1)
    expect(opacity(title)).toBe(0)
    expect(opacity(proxy)).toBe(1)
    expect(Number(gsap.getProperty(proxy, 'x'))).toBe(0)
    motion!.reverse(source)
    timeline.pause().time(0.2)
    expect(opacity(title)).toBe(0)
    expect(opacity(proxy)).toBe(1)
    expect(Number(gsap.getProperty(proxy, 'x'))).toBeLessThan(0)
    timeline.time(0, false)
    expect(Number(gsap.getProperty(proxy, 'x'))).toBe(-200)
    expect(Number(gsap.getProperty(proxy, 'y'))).toBe(175)
    expect(onClosed).toHaveBeenCalledOnce()
    motion!.dispose()
    expect(title.getAttribute('style')).toBe('font-size: 36px')
    expect(dialog.querySelector('[data-modal-title-proxy]')).toBe(null)
  })

  it('left-aligns each line during the flight and recenters it during the reverse without changing breaks', () => {
    const { title, proxy, timeline, source, sourceTitle } = setup(false, true)
    const lines = [...proxy.querySelectorAll<HTMLElement>('[data-modal-title-line]')]
    expect(lines).toHaveLength(2)
    expect(proxy.querySelectorAll('br')).toHaveLength(1)
    expect(title.querySelectorAll('br')).toHaveLength(1)
    expect(proxy.style.textAlign).toBe('left')
    expect(proxy.style.fontSize).toBe('20.4px')
    expect(Number(gsap.getProperty(proxy, 'x'))).toBe(-200)
    expect(Number(gsap.getProperty(lines[0], 'x'))).toBe(0)
    expect(Number(gsap.getProperty(lines[1], 'x'))).toBe(12)
    expect(sourceTitle!.element.isConnected).toBe(false)
    expect(timeline.duration()).toBe(0.45)
    timeline.time(0.15)
    expect(Number(gsap.getProperty(lines[0], 'x'))).toBe(0)
    expect(Number(gsap.getProperty(lines[1], 'x'))).toBeCloseTo(6)
    expect(Number.parseFloat(proxy.style.fontSize)).toBeGreaterThan(20.4)
    expect(Number.parseFloat(proxy.style.fontSize)).toBeLessThan(36)
    for (const time of [0.3, 0.375, 0.45]) {
      timeline.time(time)
      expect(opacity(title)).toBe(0)
      expect(opacity(proxy)).toBe(1)
      expect(Number(gsap.getProperty(lines[1], 'x'))).toBe(0)
      expect(proxy.querySelector('br')!.style.display).toBe('block')
    }
    motion!.reverse(source)
    timeline.pause().time(0.3)
    expect(Number(gsap.getProperty(lines[1], 'x'))).toBe(0)
    timeline.time(0.15)
    expect(Number(gsap.getProperty(lines[1], 'x'))).toBeCloseTo(6)
    timeline.time(0, false)
    expect(Number(gsap.getProperty(lines[0], 'x'))).toBe(0)
    expect(Number(gsap.getProperty(lines[1], 'x'))).toBe(12)
    expect(proxy.style.fontSize).toBe('20.4px')
    expect(opacity(title)).toBe(0)
    expect(opacity(proxy)).toBe(1)
    motion!.dispose()
    expect(proxy.isConnected).toBe(false)
    expect(title.querySelector('br')!.style.display).toBe('block')
    expect(title.style.textAlign).toBe('left')
  })

  it('keeps the title visible when rebuilding an open modal and remeasures its return destination', () => {
    const { title, proxy, timeline } = setup(true)
    expect(opacity(title)).toBe(0)
    expect(opacity(proxy)).toBe(1)
    motion!.reverse({ sourceRect: rect(40, 400, 100, 50), titleRect: rect(50, 405, 80, 30) })
    timeline.pause().time(0.2)
    expect(opacity(proxy)).toBe(1)
    timeline.time(0, false)
    expect(Number(gsap.getProperty(proxy, 'x'))).toBe(-180)
    expect(Number(gsap.getProperty(proxy, 'y'))).toBe(275)
  })
})
