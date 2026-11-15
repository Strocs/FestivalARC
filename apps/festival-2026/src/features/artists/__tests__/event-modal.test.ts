// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountEventModal } from '../event-modal'
import type { ModalMotion, MotionInput } from '../event-modal-motion'

let root: HTMLElement
let dialog: HTMLDialogElement
let source: HTMLAnchorElement
let media: EventTarget & { matches: boolean }
let inputs: MotionInput[]
let motions: ModalMotion[]
let navigate: ReturnType<typeof vi.fn>
let destroy: () => void
const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts')
const rect = (x = 10, y = 100) => ({ x, y, left: x, top: y, right: x + 100, bottom: y + 50, width: 100, height: 50, toJSON() {} })
const click = (target: Element = source, init: MouseEventInit = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
  target.dispatchEvent(event)
  return event
}
const pointer = (type: string, target: Element, x: number, y: number) => target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }))
function mount() {
  destroy = mountEventModal(root, {
    navigate,
    createMotion: input => {
      inputs.push(input)
      const motion: ModalMotion = { reverse: vi.fn(), dispose: vi.fn() }
      motions.push(motion)
      return motion
    },
  })
}
beforeEach(() => {
  document.body.innerHTML = `<main data-event-scope="music"><section style="--rows:4"><i data-motif style="--column:2"></i><a data-event-trigger data-event-id="a" href="/musica/a/"><span data-artist-surface></span><span data-artist-name>A</span></a><a data-event-trigger data-event-id="b" href="/musica/b/">B</a></section><dialog aria-labelledby="event-modal-title"><div data-modal-panel><div data-modal-surface></div><button data-modal-close>Cerrar detalle</button><div data-modal-content></div></div></dialog><template data-event-template="a"><header data-modal-header><h2 id="event-modal-title" tabindex="-1">A</h2><p data-modal-meta>Schedule</p></header><div data-modal-details>Biography</div></template><template data-event-template="b"><h2 id="event-modal-title" tabindex="-1">B</h2></template></main>`
  root = document.querySelector('main')!
  source = root.querySelector('a')!
  dialog = root.querySelector('dialog')!
  dialog.showModal = vi.fn(() => { dialog.open = true })
  dialog.close = vi.fn(() => { dialog.open = false; dialog.dispatchEvent(new Event('close')) })
  for (const node of root.querySelectorAll('*')) node.getBoundingClientRect = vi.fn(() => rect())
  Object.defineProperty(document, 'fonts', { configurable: true, get: () => undefined })
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal('matchMedia', vi.fn(() => media))
  vi.stubGlobal('scrollTo', vi.fn())
  inputs = []; motions = []; navigate = vi.fn(); destroy = () => {}
  mount()
})
afterEach(() => { destroy(); document.body.innerHTML = ''; document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); vi.unstubAllGlobals(); vi.restoreAllMocks(); if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts); else Reflect.deleteProperty(document, 'fonts') })

describe('scoped modal enhancement', () => {
  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }, { button: 1 }])('preserves ordinary modified link intent %o', init => {
    expect(click(source, init).defaultPrevented).toBe(false)
    expect(dialog.showModal).not.toHaveBeenCalled()
    expect(inputs).toHaveLength(0)
  })
  it('leaves unknown IDs, missing templates and alternate targets to normal anchors', () => {
    source.dataset.eventId = 'unknown'
    expect(click().defaultPrevented).toBe(false)
    source.dataset.eventId = 'a'; source.target = '_blank'
    expect(click().defaultPrevented).toBe(false)
    expect(dialog.open).toBe(false)
  })
  it('opens one named native dialog, focuses its heading, blocks synthetic background requests and never writes URL/history', () => {
    const push = vi.spyOn(history, 'pushState'); const replace = vi.spyOn(history, 'replaceState')
    const url = location.href
    expect(click().defaultPrevented).toBe(true)
    expect(dialog.showModal).toHaveBeenCalledOnce()
    expect(dialog.querySelector('h2')?.textContent).toBe('A')
    expect(document.activeElement).toBe(dialog.querySelector('h2'))
    expect(source.style.visibility).toBe('hidden')
    expect(click(root.querySelectorAll('a')[1]).defaultPrevented).toBe(true)
    expect(inputs).toHaveLength(1)
    expect(navigate).not.toHaveBeenCalled()
    expect(location.href).toBe(url); expect(push).not.toHaveBeenCalled(); expect(replace).not.toHaveBeenCalled()
  })
  it('captures source geometry before showModal and keeps grid, motifs and source href unchanged', () => {
    const surface = source.querySelector<HTMLElement>('[data-artist-surface]')!
    surface.getBoundingClientRect = vi.fn(() => rect(20, 300))
    const grid = root.querySelector('section')!; const before = grid.getAttribute('style'); const markup = grid.innerHTML
    click()
    expect(inputs[0].sourceRect?.top).toBe(300)
    expect(surface.getBoundingClientRect).toHaveBeenCalledBefore(vi.mocked(dialog.showModal))
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(dialog.open).toBe(true)
    inputs[0].onClosed()
    expect(grid.getAttribute('style')).toBe(before)
    expect(grid.innerHTML).toBe(markup)
    expect(source.getAttribute('href')).toBe('/musica/a/')
    expect(source.getAttribute('style')).toBe(null)
  })
  it('freezes the card composition before modal focus and refreshes it after a settled resize', () => {
    const name = source.querySelector<HTMLElement>('[data-artist-name]')!
    name.id = 'source-title'
    name.style.cssText = 'font-family: sans-serif; font-size: 20px; line-height: 20px; text-align: center; white-space: nowrap'
    name.innerHTML = 'Juan<span data-gap="1" style="display:none"> </span><br data-break="1" style="display:block">Manotas'
    const createRange = document.createRange.bind(document)
    vi.spyOn(document, 'createRange').mockImplementation(() => {
      const range = createRange()
      range.getBoundingClientRect = () => rect(range.toString().trim() === 'Manotas' ? 30 : 10, 100)
      return range
    })
    dialog.showModal = vi.fn(() => {
      dialog.open = true
      name.style.fontSize = '30px'
      name.querySelector<HTMLElement>('[data-gap]')!.style.display = 'inline'
      name.querySelector<HTMLElement>('br')!.style.display = 'none'
    })
    click()
    const snapshot = inputs[0].sourceTitle
    expect(snapshot).toBeDefined()
    expect(snapshot!.element.isConnected).toBe(false)
    expect(snapshot!.element.id).toBe('')
    expect(snapshot!.element.hasAttribute('data-artist-name')).toBe(false)
    expect(snapshot!.fontSize).toBe(20)
    expect(snapshot!.element.style.fontSize).toBe('20px')
    expect(snapshot!.element.style.lineHeight).toBe('1')
    expect(snapshot!.element.style.textAlign).toBe('center')
    expect(snapshot!.lineOffsets).toEqual([0, 20])
    expect(snapshot!.element.querySelectorAll('[data-modal-title-line]')).toHaveLength(2)
    expect(snapshot!.element.querySelector<HTMLElement>('br')!.style.display).toBe('block')
    expect(snapshot!.element.querySelector<HTMLElement>('[data-gap]')!.style.display).toBe('none')
    const heading = dialog.querySelector<HTMLElement>('h2')!
    expect(heading.style.textAlign).toBe('left')
    expect(heading.style.width).toBe('fit-content')
    expect(heading.style.maxWidth).toBe('100%')
    expect(heading.style.whiteSpace).toBe('nowrap')
    expect(heading.querySelector<HTMLElement>('br')?.style.display).toBe('block')
    expect(heading.querySelector<HTMLElement>('[data-gap]')?.style.display).toBe('none')
    window.dispatchEvent(new Event('resize'))
    expect(motions[0].dispose).not.toHaveBeenCalled()
    expect(heading.querySelector<HTMLElement>('br')?.style.display).toBe('block')
    name.style.fontSize = '32px'
    inputs[0].onOpened()
    expect(motions[0].dispose).toHaveBeenCalledOnce()
    expect(heading.querySelector<HTMLElement>('br')?.style.display).toBe('none')
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    const refreshed = inputs.at(-1)!
    expect(refreshed.initiallyOpen).toBe(true)
    expect(refreshed.sourceTitle?.fontSize).toBe(32)
    expect(refreshed.sourceTitle?.element.querySelectorAll('[data-modal-title-line]')).toHaveLength(1)
    expect(refreshed.sourceTitle?.element.querySelector<HTMLElement>('br')!.style.display).toBe('none')
    expect(refreshed.sourceTitle?.element.querySelector<HTMLElement>('[data-gap]')!.style.display).toBe('inline')
    expect(heading.querySelector<HTMLElement>('br')?.style.display).toBe('none')
    expect(snapshot!.element.querySelector<HTMLElement>('br')!.style.display).toBe('block')
  })
  it('fits the intrinsic modal title before the close control without changing the source card', () => {
    root.insertAdjacentHTML('beforeend', '<style>#event-modal-title { font-size: 24px }</style>')
    const name = source.querySelector<HTMLElement>('[data-artist-name]')!
    name.style.cssText = 'font-size: 20px; line-height: 20px; text-align: center'
    const original = name.outerHTML
    root.querySelector<HTMLElement>('[data-modal-close]')!.getBoundingClientRect = () => rect(80, 100)
    dialog.showModal = vi.fn(() => {
      dialog.open = true
      // The heading is cloned from template content after the shared fixture reads.
      dialog.querySelector<HTMLElement>('h2')!.getBoundingClientRect = () => rect(10, 100)
    })
    click()
    const title = dialog.querySelector<HTMLElement>('h2')!
    expect(title.style.maxWidth).toBe('58px')
    expect(title.style.fontSize).toBe('11.6px')
    expect(title.style.textAlign).toBe('left')
    expect(name.outerHTML).toBe(original)
  })
  it.each(['button', 'cancel', 'backdrop'])('keeps modality through controlled %s close and restores focus only after reverse', method => {
    click()
    if (method === 'button') root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    if (method === 'cancel') {
      const event = new Event('cancel', { cancelable: true }); dialog.dispatchEvent(event); expect(event.defaultPrevented).toBe(true)
    }
    if (method === 'backdrop') { pointer('pointerdown', dialog, 0, 0); pointer('pointerup', dialog, 0, 0) }
    expect(motions[0].reverse).toHaveBeenCalledOnce()
    expect(dialog.open).toBe(true)
    expect(source.style.visibility).toBe('hidden')
    inputs[0].onClosed()
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(source)
    expect(source.style.visibility).toBe('')
  })
  it('does not dismiss inside-to-outside drags or clicks inside the panel', () => {
    click()
    pointer('pointerdown', dialog, 20, 110); pointer('pointerup', dialog, 0, 0)
    pointer('pointerdown', dialog, 20, 110); pointer('pointerup', dialog, 20, 110)
    expect(motions[0].reverse).not.toHaveBeenCalled()
  })
  it('does not dismiss after backdrop pointer intent is cancelled', () => {
    click()
    pointer('pointerdown', dialog, 0, 0)
    dialog.dispatchEvent(new Event('pointercancel'))
    pointer('pointerup', dialog, 0, 0)
    expect(motions[0].reverse).not.toHaveBeenCalled()
    expect(dialog.open).toBe(true)
  })
  it('reverses during opening once, measures current origin, and rejects stale completion after a new open', () => {
    click()
    source.querySelector('[data-artist-surface]')!.getBoundingClientRect = () => rect(40, 400)
    const close = root.querySelector<HTMLElement>('[data-modal-close]')!
    close.click(); close.click()
    expect(motions[0].reverse).toHaveBeenCalledOnce()
    expect(vi.mocked(motions[0].reverse).mock.calls[0][0]?.sourceRect?.top).toBe(400)
    inputs[0].onOpened(); expect(dialog.open).toBe(true)
    inputs[0].onClosed(); click(root.querySelectorAll('a')[1])
    inputs[0].onClosed()
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('h2')?.textContent).toBe('B')
  })
  it('preserves existing scroll styles and offsets, and focuses without scrolling', () => {
    document.body.style.color = 'red'
    document.body.style.setProperty('overflow', 'auto', 'important')
    document.body.style.setProperty('padding-right', '7px', 'important')
    document.documentElement.style.setProperty('overflow', 'scroll', 'important')
    document.documentElement.style.setProperty('scroll-behavior', 'smooth', 'important')
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000)
    vi.stubGlobal('scrollX', 5); vi.stubGlobal('scrollY', 730)
    const focus = vi.spyOn(source, 'focus')
    click(); expect(document.body.style.overflow).toBe('clip')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('31px')
    root.querySelector<HTMLElement>('[data-modal-close]')!.click(); inputs[0].onClosed()
    expect(document.body.style.overflow).toBe('auto'); expect(document.body.style.paddingRight).toBe('7px')
    expect(document.body.style.color).toBe('red'); expect(document.documentElement.style.overflow).toBe('scroll')
    expect(document.documentElement.style.scrollBehavior).toBe('smooth')
    expect(scrollTo).toHaveBeenCalledWith(5, 730)
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })
  it('uses immediate equivalent reduced-motion endpoints before opening and on a mid-flight preference change', () => {
    media.matches = true
    click(); expect(dialog.open).toBe(true); expect(inputs).toHaveLength(0)
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(dialog.open).toBe(false)
    media.matches = false; click()
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    media.matches = true; media.dispatchEvent(new Event('change'))
    expect(dialog.open).toBe(false); expect(motions[0].dispose).toHaveBeenCalled()
    inputs[0].onOpened(); expect(dialog.open).toBe(false)
  })
  it.each(['window', 'visualViewport', 'observer', 'load', 'fonts'])('defers and coalesces %s settlement until opening completes, then still settles while open', notification => {
    destroy()
    const viewport = new EventTarget()
    const fonts = Object.assign(new EventTarget(), { ready: Promise.resolve() })
    let observeResize: () => void = () => {}
    vi.stubGlobal('visualViewport', viewport)
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { observeResize = callback }
      observe() {}
      disconnect() {}
    })
    // The controller consumes only EventTarget and ready from this font-set stub.
    vi.spyOn(document, 'fonts', 'get').mockReturnValue(fonts as unknown as FontFaceSet)
    mount()
    const notify = () => {
      if (notification === 'window') window.dispatchEvent(new Event('resize'))
      if (notification === 'visualViewport') viewport.dispatchEvent(new Event('resize'))
      if (notification === 'observer') observeResize()
      if (notification === 'load') dialog.querySelector('[data-modal-content]')!.dispatchEvent(new Event('load'))
      if (notification === 'fonts') fonts.dispatchEvent(new Event('loadingdone'))
    }
    click()
    notify(); notify()
    expect(motions[0].dispose).not.toHaveBeenCalled()
    expect(dialog.open).toBe(true)
    expect(source.style.visibility).toBe('hidden')
    expect(inputs).toHaveLength(1)
    inputs[0].onOpened()
    expect(motions[0].dispose).toHaveBeenCalledOnce()
    const name = source.querySelector<HTMLElement>('[data-artist-name]')!
    name.style.fontSize = '35px'
    notify()
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(inputs.at(-1)?.initiallyOpen).toBe(true)
    expect(inputs.at(-1)?.sourceTitle?.fontSize).toBe(35)
    inputs.at(-1)!.onClosed()
    expect(dialog.open).toBe(false)
    expect(source.style.visibility).toBe('')
  })
  it('discards deferred settlement when close reverses opening and does not leak into another opening or reduced motion', () => {
    click(); window.dispatchEvent(new Event('resize'))
    const close = root.querySelector<HTMLElement>('[data-modal-close]')!
    close.click()
    expect(inputs).toHaveLength(1)
    expect(motions[0].reverse).toHaveBeenCalledOnce()
    expect(motions[0].dispose).not.toHaveBeenCalled()
    inputs[0].onOpened()
    expect(motions[0].dispose).not.toHaveBeenCalled()
    expect(dialog.open).toBe(true)
    inputs[0].onClosed()
    expect(dialog.open).toBe(false)
    expect(source.style.visibility).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(source)
    click(); inputs[0].onOpened(); inputs[1].onOpened()
    expect(motions[1].dispose).not.toHaveBeenCalled()
    close.click(); inputs[1].onClosed()
    media.matches = true; click()
    window.dispatchEvent(new Event('resize'))
    expect(inputs).toHaveLength(2)
    close.click()
    expect(dialog.open).toBe(false)
  })
  it('settles immediately when reduced motion is enabled during a deferred opening', () => {
    click(); window.dispatchEvent(new Event('resize'))
    expect(motions[0].dispose).not.toHaveBeenCalled()
    media.matches = true; media.dispatchEvent(new Event('change'))
    expect(motions[0].dispose).toHaveBeenCalledOnce()
    expect(dialog.open).toBe(true)
    inputs[0].onOpened()
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(dialog.open).toBe(false)
    expect(source.style.visibility).toBe('')
    expect(document.body.style.overflow).toBe('')
  })
  it('settles geometry changes, fades missing origins and focuses the nearest remaining link', () => {
    click(); inputs[0].onOpened(); window.dispatchEvent(new Event('resize'))
    expect(motions[0].dispose).toHaveBeenCalled()
    source.remove()
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(inputs.at(-1)?.sourceRect).toBe(null)
    inputs.at(-1)!.onClosed()
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(root.querySelector('a'))
  })
  it('releases resources on native close and disconnect, ignores stale callbacks and supports reconnect', async () => {
    click(); dialog.close(); expect(document.body.style.overflow).toBe('')
    expect(source.style.visibility).toBe('')
    click(); root.remove(); await Promise.resolve()
    expect(dialog.open).toBe(false); expect(document.body.style.overflow).toBe('')
    expect(motions.at(-1)?.dispose).toHaveBeenCalled()
    inputs.at(-1)!.onClosed(); destroy()
    document.body.append(root); mount(); expect(click().defaultPrevented).toBe(true)
    expect(dialog.open).toBe(true)
  })
  it('retains the backdrop at settled and reduced endpoints and restores its original inline declaration', () => {
    dialog.style.setProperty('--event-backdrop', '0.25')
    media.matches = true; click()
    expect(dialog.style.getPropertyValue('--event-backdrop')).toBe('1')
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(dialog.style.getPropertyValue('--event-backdrop')).toBe('0.25')
    media.matches = false; click(); inputs[0].onOpened(); window.dispatchEvent(new Event('resize'))
    expect(dialog.style.getPropertyValue('--event-backdrop')).toBe('1')
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    expect(inputs.at(-1)?.initiallyOpen).toBe(true)
    expect(inputs.at(-1)?.sourceRect?.top).toBe(100)
    inputs.at(-1)!.onClosed()
    expect(dialog.style.getPropertyValue('--event-backdrop')).toBe('0.25')
  })
  it('mounts idempotently without duplicate listeners or motions', () => {
    const duplicate = mountEventModal(root, { navigate })
    click()
    expect(dialog.showModal).toHaveBeenCalledOnce()
    duplicate(); expect(dialog.open).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(click().defaultPrevented).toBe(false)
  })
  it('navigates the same fallback after an opening failure, with no abandoned locks or hidden source', () => {
    dialog.showModal = vi.fn(() => { throw new Error('Unsupported') })
    expect(click().defaultPrevented).toBe(true)
    expect(navigate).toHaveBeenCalledWith(source.href)
    expect(dialog.open).toBe(false); expect(document.body.style.overflow).toBe(''); expect(source.style.visibility).toBe('')
  })
  it.each(['native', 'motion'])('cleans partial %s opening before canonical fallback navigation', failure => {
    destroy()
    if (failure === 'native') dialog.showModal = vi.fn(() => {
      dialog.open = true
      throw new Error('Partial native open')
    })
    const observed: Array<{ href: string, open: boolean, overflow: string, visibility: string, contentChildren: number }> = []
    navigate = vi.fn((href: string) => {
      observed.push({
        href,
        open: dialog.open,
        overflow: document.body.style.overflow,
        visibility: source.style.visibility,
        contentChildren: dialog.querySelector('[data-modal-content]')!.childNodes.length,
      })
    })
    destroy = mountEventModal(root, {
      navigate,
      createMotion: () => { throw new Error('Partial motion open') },
    })
    expect(click().defaultPrevented).toBe(true)
    expect(observed).toEqual([{ href: source.href, open: false, overflow: '', visibility: '', contentChildren: 0 }])
  })
  it('falls back after motion initialization failure and leaves anchors ordinary after failed setup', () => {
    destroy()
    destroy = mountEventModal(root, { navigate, createMotion: () => { throw new Error('GSAP unavailable') } })
    click(); expect(navigate).toHaveBeenCalledWith(source.href)
    expect(dialog.open).toBe(false); expect(source.style.visibility).toBe(''); expect(document.body.style.overflow).toBe('')
    destroy(); vi.stubGlobal('matchMedia', () => { throw new Error('Unavailable') })
    destroy = mountEventModal(root, { navigate })
    expect(click().defaultPrevented).toBe(false)
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() { throw new Error('Media setup failed') }, removeEventListener() {} }))
    destroy = mountEventModal(root, { navigate })
    expect(click().defaultPrevented).toBe(false)
    expect(dialog.open).toBe(false)
  })
})
