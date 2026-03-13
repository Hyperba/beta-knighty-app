"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number>(0)
  const pathname = usePathname()

  // Debounced resize helper
  const debounce = useCallback((fn: () => void, ms: number) => {
    let timer: NodeJS.Timeout
    return () => {
      clearTimeout(timer)
      timer = setTimeout(fn, ms)
    }
  }, [])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      infinite: false,
      autoResize: true,
    })
    lenisRef.current = lenis
    ;(window as any).__lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    // Debounced resize function for performance
    const debouncedResize = debounce(() => {
      lenis.resize()
    }, 100)

    // ResizeObserver on document.body for general size changes
    const ro = new ResizeObserver(debouncedResize)
    ro.observe(document.body)

    // MutationObserver to catch dynamic DOM changes (async content, lazy images, etc.)
    const mo = new MutationObserver(debouncedResize)
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    // Resize when images finish loading
    const handleImageLoad = () => debouncedResize()
    document.addEventListener('load', handleImageLoad, true)

    // Resize on window resize
    window.addEventListener('resize', debouncedResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener('load', handleImageLoad, true)
      window.removeEventListener('resize', debouncedResize)
      ;(window as any).__lenis = null
      lenis.destroy()
      lenisRef.current = null
    }
  }, [debounce])

  // On route change: recalculate dimensions
  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    // Recalculate dimensions after a short delay to allow new page content to render
    const timeouts = [
      setTimeout(() => lenis.resize(), 50),
      setTimeout(() => lenis.resize(), 150),
      setTimeout(() => lenis.resize(), 300),
      setTimeout(() => lenis.resize(), 600),
      setTimeout(() => lenis.resize(), 1000),
    ]

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [pathname])

  return children
}
