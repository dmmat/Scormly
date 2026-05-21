import { useEffect, useRef, useState } from 'react'

// Reveal-on-scroll: returns a ref and a visibility flag. When the element
// enters the viewport, the flag becomes true (once). Used to animate the
// appearance of landing page sections.
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible, options])

  return { ref, visible }
}
