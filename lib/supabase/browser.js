// Supabase client for the browser (publishable key; row-level security applies).
import { createBrowserClient } from '@supabase/ssr'

let client

export function getSupabaseBrowser() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  return client
}
