import { cn } from '@/features/shared/utils'
import { useEffect, useRef } from 'react'

export function ShowHint({ isDragging }: { isDragging: boolean }) {
  const hintHidden = useRef(false)
  const hintVisible = useRef(true)

  useEffect(() => {
    if (!hintVisible.current) return
    if (!isDragging) return
    hintVisible.current = false

    const temporizer = setTimeout(() => {
      hintHidden.current = true
    }, 300)

    return () => {
      if (temporizer) clearTimeout(temporizer)
    }
  }, [isDragging])

  return (
    <p
      hidden={hintHidden.current}
      className={cn(
        'font-dk absolute -top-3 right-4 text-end text-xl leading-none text-white opacity-100 transition-opacity duration-300 md:-top-8 md:right-8 md:text-3xl',
        !hintVisible.current && 'opacity-0',
      )}>
      Arrastra hacia la izquierda para ver más
    </p>
  )
}
