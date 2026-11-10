import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { selectedDetail } from '../stores/selection'

gsap.registerPlugin(MorphSVGPlugin)

export function enhanceMotion(mosaic: HTMLElement): () => void {
  const preference = matchMedia('(prefers-reduced-motion: reduce)')
  const originals = new Map([...mosaic.querySelectorAll<SVGPathElement>('svg path')].map(path => [path, path.getAttribute('d')!]))
  const shapes = [...originals.values()]
  const visited = new Set<Element>()
  const morphs = new Set<gsap.core.Tween>()
  let opening: gsap.core.Tween | undefined
  let restoreOpacity: (() => void) | undefined

  function finishOpening() {
    opening?.kill()
    opening = undefined
    restoreOpacity?.()
    restoreOpacity = undefined
  }

  function finishMorphs() {
    morphs.forEach(tween => tween.kill())
    morphs.clear()
    originals.forEach((shape, path) => path.setAttribute('d', shape))
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || visited.has(entry.target)) continue
      visited.add(entry.target)
      observer.unobserve(entry.target)
      if (preference.matches) continue
      entry.target.querySelectorAll<SVGPathElement>('path').forEach(path => {
        const destination = originals.get(path)!
        const source = shapes.find(shape => shape !== destination)!
        const tween = gsap.fromTo(path, { morphSVG: source }, {
          morphSVG: destination,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            path.setAttribute('d', destination)
            morphs.delete(tween)
          },
        })
        morphs.add(tween)
      })
    }
  }, { threshold: 0.1 })
  mosaic.querySelectorAll('svg').forEach(tile => observer.observe(tile))

  const unsubscribe = selectedDetail.subscribe(dialog => {
    finishOpening()
    if (!dialog || preference.matches) return
    const value = dialog.style.getPropertyValue('opacity')
    const priority = dialog.style.getPropertyPriority('opacity')
    restoreOpacity = () => {
      if (value) dialog.style.setProperty('opacity', value, priority)
      else dialog.style.removeProperty('opacity')
    }
    // Content, focus and the URL are already available; only the surface fades.
    opening = gsap.fromTo(dialog, { opacity: 0.7 }, {
      opacity: 1, duration: 0.25, ease: 'power2.out', onComplete: finishOpening,
    })
  })

  function onPreferenceChange() {
    if (!preference.matches) return
    finishOpening()
    finishMorphs()
  }
  preference.addEventListener('change', onPreferenceChange)

  return () => {
    observer.disconnect()
    unsubscribe()
    preference.removeEventListener('change', onPreferenceChange)
    finishOpening()
    finishMorphs()
  }
}
