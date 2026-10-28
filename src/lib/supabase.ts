import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * True when Supabase env vars are present. When false, the app runs on the
 * local demo store (src/lib/store.ts) so the funnel and CRM are fully
 * usable and reviewable before a project is connected.
 */
export const supabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null

export const DEFAULT_ORGANIZATION_ID =
  (import.meta.env.VITE_DEFAULT_ORGANIZATION_ID as string | undefined) ?? 'demo-org'
