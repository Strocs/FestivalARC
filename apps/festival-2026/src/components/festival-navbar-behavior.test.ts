// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ts from 'typescript'
import source from '../../../../packages/ui/src/FestivalNavbar.astro?raw'

let root: HTMLElement
let panel: HTMLDialogElement
let header: HTMLElement
let toggle: HTMLButtonElement
let desktop: EventTarget & { matches: boolean }
let reduced: boolean
let motions: Array<{ onfinish: (() => void) | null, cancel: ReturnType<typeof vi.fn> }>
beforeAll(() => {
  const script = source.match(/<script>([\s\S]*?)<\/script>/)![1]
  new Function(ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText)()
})
beforeEach(() => {
  reduced = true
  desktop = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal('matchMedia', (query: string) => query.includes('64rem') ? desktop : { matches: reduced })
  motions = []
  vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(() => [{ width: 20, height: 20 }] as unknown as DOMRectList)
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => motions })
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: () => {
    const motion = { onfinish: null, cancel: vi.fn() }
    motions.push(motion)
    return motion
  } })
  document.body.innerHTML = '<main><button id="background">Background</button></main><aside inert="existing">Prior inert</aside><div id="wrapper"><span id="sibling">Other content</span></div>'
  document.documentElement.style.overflow = 'scroll'
})
afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('style')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
function mount(mode = 'layered') {
  root = document.createElement('festival-navbar')
  if (mode === 'layered') root.dataset.mobilePanelMode = mode
  root.innerHTML = '<header data-festival-header><a href="/">Brand</a><nav hidden><button>Hidden desktop</button></nav><button data-header-toggle aria-expanded="false">Toggle</button></header><dialog data-header-panel><div data-header-surface><a href="#first">First</a><button disabled>Disabled</button><a href="#last">Last</a></div></dialog>'
  panel = root.querySelector('dialog')!
  header = root.querySelector('header')!
  toggle = root.querySelector('[data-header-toggle]')!
  panel.show = vi.fn(() => { panel.open = true })
  panel.showModal = vi.fn(() => { panel.open = true })
  panel.close = vi.fn(() => { if (!panel.open) return; panel.open = false; panel.dispatchEvent(new Event('close')) })
  document.querySelector('#wrapper')!.append(root)
}
function key(target: Element, key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}
function expectStationary() {
  expect(header.parentElement).toBe(root)
  expect(header.nextElementSibling).toBe(panel)
  expect(root.children).toHaveLength(2)
}
function expectReleased() {
  expect(panel.open).toBe(false)
  expect(document.querySelector('main')!.hasAttribute('inert')).toBe(false)
  expect(document.querySelector('#sibling')!.hasAttribute('inert')).toBe(false)
  expect(document.querySelector('aside')!.getAttribute('inert')).toBe('existing')
  expect(document.documentElement.style.overflow).toBe('scroll')
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
}
describe('stationary mobile navigation', () => {
  it('keeps the original header and siblings before, during and after animated close, with balanced background and scroll ownership', () => {
    mount(); reduced = false
    expectStationary()
    toggle.click()
    expectStationary()
    expect(panel.show).toHaveBeenCalledOnce()
    expect(panel.showModal).not.toHaveBeenCalled()
    expect(panel.getAttribute('aria-modal')).toBe('true')
    for (const selector of ['main', 'aside', '#sibling']) expect(document.querySelector(selector)!.hasAttribute('inert')).toBe(true)
    expect(header.closest('[inert]')).toBe(null)
    expect(panel.closest('[inert]')).toBe(null)
    expect(document.body.hasAttribute('inert')).toBe(false)
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(toggle)
    toggle.click(); toggle.click()
    expect(panel.open).toBe(true)
    expectStationary()
    expect(document.querySelector('main')!.hasAttribute('inert')).toBe(true)
    motions.at(-1)!.onfinish!()
    expectReleased(); expectStationary()
    expect(panel.hasAttribute('aria-modal')).toBe(false)
    expect(document.activeElement).toBe(toggle)
  })
  it('contains focus across header and panel, skips unavailable controls and closes on Escape', () => {
    mount(); toggle.click()
    const brand = header.querySelector('a')!
    const last = panel.querySelectorAll('a')[1]
    last.focus(); expect(key(last, 'Tab').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(brand)
    expect(key(brand, 'Tab', true).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
    document.querySelector<HTMLButtonElement>('#background')!.focus()
    expect(document.activeElement).toBe(toggle)
    expect(key(toggle, 'Escape').defaultPrevented).toBe(true)
    expectReleased(); expect(document.activeElement).toBe(toggle)
  })
  it.each(['desktop', 'disconnect', 'swap'])('releases owned state on %s and ignores obsolete animation completion after reconnect/reopen', method => {
    mount(); reduced = false; toggle.click(); toggle.click()
    const stale = motions.at(-1)!.onfinish!
    if (method === 'desktop') { desktop.matches = true; desktop.dispatchEvent(new Event('change')); motions.at(-1)!.onfinish!() }
    if (method === 'disconnect') root.remove()
    if (method === 'swap') document.dispatchEvent(new Event('astro:before-swap'))
    expectReleased(); expectStationary()
    if (method === 'swap') root.remove()
    if (!root.isConnected) document.querySelector('#wrapper')!.append(root)
    desktop.matches = false
    toggle.click(); stale()
    expect(panel.open).toBe(true)
    expectStationary()
    reduced = true; toggle.click(); expectReleased()
  })
  it('retains default native modal reparenting, cancel, focus return and scroll restoration', () => {
    mount('modal'); toggle.click()
    expect(panel.showModal).toHaveBeenCalledOnce()
    expect(panel.show).not.toHaveBeenCalled()
    expect(header.parentElement).toBe(panel)
    expect(document.querySelector('main')!.hasAttribute('inert')).toBe(false)
    expect(document.activeElement).toBe(toggle)
    const cancel = new Event('cancel', { cancelable: true })
    panel.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expectReleased(); expectStationary()
    expect(document.activeElement).toBe(toggle)
  })
})
