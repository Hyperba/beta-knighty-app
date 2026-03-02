"use client"

import { useEffect, useRef } from "react"
import Lenis from "@studio-freight/lenis"

export default function LenisProvider({ children }:{children: React.ReactNode}) {
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, infinite: false })
    ;(window as any).__lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    // Auto-resize when page height changes (async content, images, etc.)
    const ro = new ResizeObserver(() => lenis.resize())
    ro.observe(document.body)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      ;(window as any).__lenis = null
      lenis.destroy()
    }
  }, [])

  return children
}
