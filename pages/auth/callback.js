// Landing page for the email confirmation link. Exchanges the one-time code
// for a session cookie, then sends the reader on to onboarding.

import { createSupabaseServer } from '../../lib/supabase/server'

export async function getServerSideProps(ctx) {
  const { code, token_hash: tokenHash, type } = ctx.query
  const supabase = createSupabaseServer(ctx.req, ctx.res)

  let error
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(String(code)))
  else if (tokenHash && type) ({ error } = await supabase.auth.verifyOtp({ token_hash: String(tokenHash), type: String(type) }))
  else error = { message: 'missing code' }

  if (error) return { redirect: { destination: '/login?confirm=failed', permanent: false } }
  return { redirect: { destination: '/onboarding', permanent: false } }
}

export default function AuthCallback() {
  return null
}
