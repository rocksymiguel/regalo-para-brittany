import { createClient, type Session, type User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

export interface AnonymousSessionResult {
  user: User
  session: Session
}

let sessionPromise: Promise<AnonymousSessionResult | null> | null = null

const report = (message: string, error?: unknown) => {
  if (!import.meta.env.DEV) return
  if (error) console.warn(`[Supabase] ${message}`, error)
  else console.warn(`[Supabase] ${message}`)
}

async function createOrReuseAnonymousSession(): Promise<AnonymousSessionResult | null> {
  if (!supabase) {
    report('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY; continuing without Supabase.')
    return null
  }

  try {
    const { data: existing, error: existingError } = await supabase.auth.getSession()
    if (existingError) throw existingError
    if (existing.session?.user) {
      if (import.meta.env.DEV) console.info(`[Supabase] Anonymous session ready: ${existing.session.user.id}`)
      return { user: existing.session.user, session: existing.session }
    }

    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    if (!data.user || !data.session) {
      report('Anonymous authentication returned no user/session.')
      return null
    }
    if (import.meta.env.DEV) console.info(`[Supabase] Anonymous session ready: ${data.user.id}`)
    return { user: data.user, session: data.session }
  } catch (error) {
    report('Anonymous session unavailable; continuing without Supabase.', error)
    return null
  }
}

export function ensureSupabaseAnonymousSession(): Promise<AnonymousSessionResult | null> {
  if (!sessionPromise) sessionPromise = createOrReuseAnonymousSession()
  return sessionPromise
}
