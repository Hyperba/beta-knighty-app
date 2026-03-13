'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function getSessionId(): string {
  const key = 'kb_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function hasViewedInSession(path: string): boolean {
  const key = 'kb_viewed_pages'
  try {
    const viewed = JSON.parse(sessionStorage.getItem(key) || '[]') as string[]
    return viewed.includes(path)
  } catch {
    return false
  }
}

function markViewedInSession(path: string): void {
  const key = 'kb_viewed_pages'
  try {
    const viewed = JSON.parse(sessionStorage.getItem(key) || '[]') as string[]
    if (!viewed.includes(path)) {
      viewed.push(path)
      sessionStorage.setItem(key, JSON.stringify(viewed))
    }
  } catch {
    // Silently ignore storage failures
  }
}

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    // Don't track admin routes
    if (pathname.startsWith('/admin')) return

    // Don't track if already viewed in this session (prevents refresh duplication)
    if (hasViewedInSession(pathname)) return

    const track = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        await supabase.rpc('record_page_view', {
          p_page_path: pathname,
          p_referrer: document.referrer || null,
          p_session_id: getSessionId(),
        })
        
        // Mark as viewed only after successful tracking
        markViewedInSession(pathname)
      } catch {
        // Silently ignore tracking failures
      }
    }

    track()
  }, [pathname])

  return null
}
