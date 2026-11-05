// What each plan allows. See docs/SPEC.md for the product rules.

export const PLANS = {
  trial: { label: 'Free trial', languages: 3, articlesPerDay: 3, vocab: true },
  standard: { label: 'Standard', languages: 1, articlesPerDay: 1, vocab: false },
  premium: { label: 'Premium', languages: 3, articlesPerDay: 3, vocab: true },
  inactive: { label: 'Inactive', languages: 0, articlesPerDay: 0, vocab: false },
}

// The plan in effect right now: an expired trial counts as inactive until the
// reader picks a paid plan (billing comes in build step 6).
export function currentPlan(profile, now = new Date()) {
  if (profile.plan === 'trial' && new Date(profile.trial_ends_at) < now) return 'inactive'
  return profile.plan
}

// How many learning languages the reader may have: plan allowance plus purchased add-ons.
export function languageLimit(profile, languages) {
  const purchased = languages.filter(l => l.purchased).length
  return PLANS[currentPlan(profile)].languages + purchased
}

// Learning languages are permanent once chosen. When a reader has more than the
// plan allows (e.g. 3 languages on the trial, then Standard), purchased add-ons
// and the earliest-chosen languages stay active; the rest are paused: no new
// stories, but their archive and vocab list stay readable.
export function activeLanguageCodes(profile, languages) {
  const allowance = PLANS[currentPlan(profile)].languages
  const included = languages
    .filter(l => !l.purchased)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .slice(0, allowance)
  return new Set([...languages.filter(l => l.purchased), ...included].map(l => l.lang))
}
