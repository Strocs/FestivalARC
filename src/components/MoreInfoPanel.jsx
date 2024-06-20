import { useStore } from '@nanostores/react'
import { closePanel, infoPanel, isPanelOpen } from '@store/MoreInfoStore'

export const MoreInfoPanel = () => {
  const isOpen = useStore(isPanelOpen)
  const info = useStore(infoPanel)

  if (!isOpen) return null

  return (
    <div class='h-[calc(100vh-(var(--footer-height))*2)] w-full bg-black/90 bg-blend-overlay sticky top-[calc(var(--footer-height)+2rem)] p-6 text-secondary'>
      <h2 class='text-4xl font-bold'>{info.title}</h2>
      <p>{info.description}</p>
      <button onClick={closePanel}>Close</button>
    </div>
  )
}
