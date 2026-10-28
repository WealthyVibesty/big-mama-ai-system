import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, supabaseConfigured } from './supabase'

/*
  /admin auth.
  - Supabase configured: real Supabase Auth (email + password).
  - Local/demo mode: credentials come ONLY from environment variables
    (VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD). Nothing is hardcoded here.
    If VITE_ADMIN_PASSWORD is unset, the login screen says so instead of
    letting anyone in.
*/

interface AuthState {
  signedIn: boolean
  email: string | null
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const SESSION_KEY = 'big-mama-ai-admin-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (supabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setSignedIn(Boolean(data.session))
        setEmail(data.session?.user.email ?? null)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(Boolean(session))
        setEmail(session?.user.email ?? null)
      })
      return () => sub.subscription.unsubscribe()
    }
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      setSignedIn(true)
      setEmail(saved)
    }
  }, [])

  async function signIn(inputEmail: string, password: string) {
    if (supabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: inputEmail, password })
      if (error) return { ok: false, error: error.message }
      return { ok: true }
    }
    const expectedEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined
    if (!expectedPassword) {
      return { ok: false, error: 'Admin password is not set. Add VITE_ADMIN_PASSWORD to your .env file, then reload.' }
    }
    if (inputEmail.trim().toLowerCase() === (expectedEmail ?? '').toLowerCase() && password === expectedPassword) {
      sessionStorage.setItem(SESSION_KEY, inputEmail)
      setSignedIn(true)
      setEmail(inputEmail)
      return { ok: true }
    }
    return { ok: false, error: 'Email or password did not match.' }
  }

  async function signOut() {
    if (supabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    sessionStorage.removeItem(SESSION_KEY)
    setSignedIn(false)
    setEmail(null)
  }

  return (
    <AuthContext.Provider value={{ signedIn, email, demoMode: !supabaseConfigured, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
