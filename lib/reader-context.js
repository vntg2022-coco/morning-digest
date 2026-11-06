// getServerSideProps helper for signed-in reader pages: the user, their plan
// and which learning language is selected (?lang=, default: first one).

import { activeLanguageCodes, currentPlan } from './plans.mjs'
import { requireUser } from './supabase/server'

export async function loadReader(ctx) {
  const auth = await requireUser(ctx)
  if (auth.redirect) return auth
  if (!auth.profile?.onboarded_at) return { redirect: { destination: '/onboarding', permanent: false } }

  const active = activeLanguageCodes(auth.profile, auth.languages)
  const languages = [...auth.languages]
    .sort((a, b) => Number(active.has(b.lang)) - Number(active.has(a.lang)) || String(a.created_at).localeCompare(String(b.created_at)))
    .map(l => ({ lang: l.lang, level: l.level, purchased: l.purchased, paused: !active.has(l.lang) }))
  // Main languages first, so the default tab is an active one.
  const selected = languages.find(l => l.lang === ctx.query.lang) ?? languages[0] ?? null
  return {
    user: { id: auth.user.id, email: auth.user.email },
    profile: auth.profile,
    plan: currentPlan(auth.profile),
    languages,
    selected,
  }
}
