import { selectedDetail } from '../stores/selection'

let dispose: (() => void) | undefined
let lastTrigger: HTMLAnchorElement | null = null

function initialize() {
  dispose?.()
  const mosaic = document.querySelector<HTMLElement>('.mosaic')
  const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog[data-artist-url]')]
  if (!mosaic || !dialogs.length || typeof dialogs[0].showModal !== 'function') return

  const events = new AbortController()
  const { signal } = events
  const home = mosaic.dataset.homeUrl!
  let active: HTMLDialogElement | null = null
  let unlock: (() => void) | undefined
  let stopMotion: (() => void) | undefined
  let alive = true

  function lockScroll() {
    const position = { left: scrollX, top: scrollY }
    const saved = [document.documentElement, document.body].map(element => ({
      element,
      value: element.style.getPropertyValue('overflow-y'),
      priority: element.style.getPropertyPriority('overflow-y'),
    }))
    saved.forEach(({ element }) => element.style.setProperty('overflow-y', 'hidden', 'important'))
    return () => {
      saved.forEach(({ element, value, priority }) => {
        if (value) element.style.setProperty('overflow-y', value, priority)
        else element.style.removeProperty('overflow-y')
      })
      window.scrollTo({ ...position, behavior: 'instant' })
    }
  }

  function hide() {
    if (!active) return
    const previous = active
    active = null
    selectedDetail.set(null)
    previous.close()
    unlock?.()
    unlock = undefined
    if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true })
  }

  // The address, not the store or an animation callback, decides what is open.
  function synchronize() {
    const next = dialogs.find(dialog => dialog.dataset.artistUrl === location.pathname) ?? null
    if (next === active) return
    hide()
    if (!next) return
    unlock = lockScroll()
    active = next
    next.scrollTop = 0
    next.showModal()
    next.querySelector<HTMLButtonElement>('[data-close-artist]')?.focus({ preventScroll: true })
    selectedDetail.set(next)
  }

  function dismiss() {
    hide() // Never wait for traversal or animation to dismiss or restore focus.
    if (history.state?.arc2026Overlay?.home === home) history.back()
  }

  mosaic.addEventListener('click', event => {
    if (!(event instanceof MouseEvent) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a') : null
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
    const url = new URL(link.href)
    if (url.origin !== location.origin || !dialogs.some(dialog => dialog.dataset.artistUrl === url.pathname)) return
    event.preventDefault()
    lastTrigger = link
    history.pushState({ ...history.state, arc2026Overlay: { home } }, '', url)
    synchronize()
  }, { signal })

  dialogs.forEach(dialog => {
    dialog.addEventListener('cancel', event => {
      event.preventDefault()
      dismiss()
    }, { signal })
    dialog.querySelector('[data-close-artist]')?.addEventListener('click', dismiss, { signal })
  })
  window.addEventListener('popstate', synchronize, { signal })
  synchronize()

  // Failed or late cosmetic downloads cannot prevent native navigation/dialog use.
  void import('./motion').then(({ enhanceMotion }) => {
    if (alive) stopMotion = enhanceMotion(mosaic)
  }).catch(() => { /* Static motifs and the native modal remain fully usable. */ })

  dispose = () => {
    alive = false
    events.abort()
    stopMotion?.()
    hide()
    dispose = undefined
  }
}

initialize()
document.addEventListener('astro:page-load', initialize)
document.addEventListener('astro:before-swap', () => dispose?.())
window.addEventListener('pagehide', () => dispose?.())
window.addEventListener('pageshow', event => {
  if (event.persisted) initialize()
})
