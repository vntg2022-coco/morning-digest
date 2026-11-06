// Supabase clients for server code (getServerSideProps and API routes).
import { createClient } from '@supabase/supabase-js'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

// Acts as the signed-in user (reads the session from cookies, refreshes it if needed).
// Create a new one per request.
export function createSupabaseServer(req, res) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? '').map(c => ({ name: c.name, value: c.value ?? '' }))
      },
      setAll(cookiesToSet, headers) {
        res.setHeader(
          'Set-Cookie',
          cookiesToSet.map(({ name, value, options }) => serializeCookieHeader(name, value, options))
        )
        for (const [key, value] of Object.entries(headers ?? {})) res.setHeader(key, value)
      },
    },
  })
}

// Full access with the secret key; bypasses row-level security. Server only.
// Use it for writes that need plan checks, after verifying the user yourself.
export function createSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// For getServerSideProps: returns { user, profile } or a redirect to /login.
export async function requireUser(ctx) {
  const supabase = createSupabaseServer(ctx.req, ctx.res)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { redirect: { destination: '/login', permanent: false } }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: languages } = await supabase.from('learning_languages').select('lang, level, purchased, active, sort_order, created_at').eq('user_id', user.id)
  return { user, profile, languages: languages ?? [], supabase }
}
