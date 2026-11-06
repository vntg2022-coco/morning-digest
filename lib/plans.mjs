// What each plan allows. See docs/SPEC.md for the product rules.

export const PLANS = {
  // First day after signing up, no card: Premium features until the next morning.
  preview: { label: 'Free preview day', languages: 1, articlesPerDay: 3, vocab: true },
  // 7-day trial, starts when the reader adds a card (billing, build step 6).
  trial: { label: 'Free trial', languages: 3, articlesPerDay: 3, vocab: true },
  standard: { label: 'Standard', languages: 1, articlesPerDay: 1, vocab: false },
  premium: { label: 'Premium', languages: 3, articlesPerDay: 3, vocab: true },
  inactive: { label: 'Inactive', languages: 0, articlesPerDay: 0, vocab: false },
}

export const SWAP_COOLDOWN_DAYS = 30
// The preview lasts until the next delivery that is at least this far away,
// so someone signing up at 5:30 for a 6:00 delivery still gets a full day.
const MIN_PREVIEW_HOURS = 6

// The plan in effect right now: an expired preview or trial counts as inactive
// until the reader starts a trial or picks a paid plan.
export function currentPlan(profile, now = new Date()) {
  if (profile.plan === 'preview' && profile.preview_ends_at && new Date(profile.preview_ends_at) < now) return 'inactive'
  if (profile.plan === 'trial' && profile.trial_ends_at && new Date(profile.trial_ends_at) < now) return 'inactive'
  return profile.plan
}

// Main-language slots: the plan's allowance plus one per purchased add-on.
export function languageSlots(profile, languages) {
  return PLANS[currentPlan(profile)].languages + languages.filter(l => l.purchased).length
}

// Languages that get new stories. Languages are never deleted: the reader keeps
// some active (up to the slots) and the rest paused. If a downgrade leaves more
// active languages than slots, purchased ones and the earliest-chosen win.
export function activeLanguageCodes(profile, languages) {
  const slots = languageSlots(profile, languages)
  const ranked = languages
    .filter(l => l.active !== false)
    .sort((a, b) => Number(b.purchased) - Number(a.purchased) || String(a.created_at).localeCompare(String(b.created_at)))
  return new Set(ranked.slice(0, slots).map(l => l.lang))
}

// When the reader may next pause a language (null = now).
export function nextSwapAt(profile, now = new Date()) {
  if (!profile.last_language_swap_at) return null
  const next = new Date(new Date(profile.last_language_swap_at).getTime() + SWAP_COOLDOWN_DAYS * 864e5)
  return next > now ? next : null
}

// UTC instant of a wall-clock time in a time zone.
function zonedTimeToUtc(y, m, d, hh, mm, timeZone) {
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const offsetAt = t => {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(new Date(t))
        .map(x => [x.type, Number(x.value)])
    )
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - t
  }
  const first = guess - offsetAt(guess)
  return new Date(guess - offsetAt(first))
}

// End of the free preview: the reader's next morning delivery (at least
// MIN_PREVIEW_HOURS from now).
export function previewEndsAt(deliveryTime, timeZone, now = new Date()) {
  const [hh, mm] = deliveryTime.split(':').map(Number)
  const today = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(now)
      .map(x => [x.type, Number(x.value)])
  )
  for (let addDays = 0; addDays < 3; addDays++) {
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + addDays))
    const at = zonedTimeToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), hh, mm, timeZone)
    if (at.getTime() - now.getTime() >= MIN_PREVIEW_HOURS * 3600e3) return at
  }
  return new Date(now.getTime() + 24 * 3600e3)
}
