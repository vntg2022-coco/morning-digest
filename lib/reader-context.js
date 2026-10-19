// getServerSideProps helper for signed-in reader pages: the user, their plan
// and which learning language is selected (?lang=, default: first one).

import { currentPlan } from './plans.mjs'
import { requireUser } from './supabase/server'

export async function loadReader(ctx) {
  const auth = await requireUser(ctx)
  if (auth.redirect) return auth
  if (!auth.profile?.onboarded_at) return { redirect: { destination: '/onboarding', permanent: false } }

  const languages = [...auth.languages].sort((a, b) => a.lang.localeCompare(b.lang))
  const selected = languages.find(l => l.lang === ctx.query.lang) ?? languages[0] ?? null
  return {
    user: { id: auth.user.id, email: auth.user.email },
    profile: auth.profile,
    plan: currentPlan(auth.profile),
    languages,
    selected,
  }
}
