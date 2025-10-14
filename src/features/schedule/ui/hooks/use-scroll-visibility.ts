import { useEffect, useState } from 'react'

export function useScrollVisibility(
  scrollThreshold: number | undefined = 1000,
) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop

      setIsVisible(
        scrollPosition > scrollThreshold &&
          scrollPosition <
            document.body.clientHeight - window.innerHeight - 100,
      )
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollThreshold])

  return isVisible
}
