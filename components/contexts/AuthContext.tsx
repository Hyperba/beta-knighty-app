'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export type UserTier = 'explorer' | 'access' | 'builder' | 'architect' | 'admin'

export interface UserProfile {
  id: string
  handle: string
  display_name: string
  bio: string
  avatar_url: string
  cover_url: string
  tier: UserTier
  handle_changed_at: string | null
  email_notifications: boolean
  newsletter_opt_in: boolean
  deletion_requested_at: string | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, handle?: string, displayName?: string, redirectTo?: string, avatarUrl?: string) => Promise<{ error: AuthError | Error | null }>
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = getSupabaseBrowserClient()

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return data as UserProfile | null
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    setProfile(await fetchProfile(user.id))
  }, [user, fetchProfile])

  // Auth state listener — MUST be synchronous (no Supabase calls).
  // Making async Supabase calls inside onAuthStateChange deadlocks the
  // singleton client because the callback holds an internal auth lock.
  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT' || !newSession) {
          setUser(null)
          setProfile(null)
          setSession(null)
          setLoading(false)
          return
        }

        setSession(newSession)
        // Keep the same object reference if the user ID hasn't changed.
        // This prevents every useEffect([user]) across the app from
        // re-firing on routine TOKEN_REFRESHED events.
        setUser(prev => (prev?.id === newSession.user.id ? prev : newSession.user))
        setLoading(false)
      }
    )

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getUser()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [supabase])

  // Fetch profile reactively when user changes — separate from the auth
  // listener so we never make Supabase calls inside onAuthStateChange.
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    let cancelled = false
    fetchProfile(user.id).then(p => {
      if (!cancelled) setProfile(p)
    })
    return () => { cancelled = true }
  }, [user, fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
    handle?: string,
    displayName?: string,
    redirectTo?: string,
    avatarUrl?: string
  ): Promise<{ error: AuthError | Error | null }> => {
    const callbackUrl = redirectTo
      ? `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/api/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl },
    })

    if (error) return { error }

    if (data.user) {
      const { data: result, error: rpcErr } = await supabase.rpc('create_user_profile', {
        p_user_id: data.user.id,
        p_email: email,
        p_handle: handle || null,
        p_display_name: displayName || null,
        p_avatar_url: avatarUrl || null,
      })
      if (rpcErr) return { error: new Error(rpcErr.message) }
      if (result?.status === 'error') return { error: new Error(result.message) }
    }

    return { error: null }
  }

  const signInWithGoogle = async (redirectTo?: string) => {
    const callbackUrl = redirectTo
      ? `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/api/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {})
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
