import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client ────────────────────────────────────────────────────────────
// Use inside Client Components ('use client').

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// ── Server client ─────────────────────────────────────────────────────────────
// Use inside Server Components, Route Handlers, and Server Actions.
// Reads/writes cookies so auth sessions are correctly forwarded.

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll called from a Server Component — cookies can't be mutated.
          // This is fine if middleware is refreshing sessions.
        }
      },
    },
  })
}
