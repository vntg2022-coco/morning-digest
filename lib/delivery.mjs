// Sends the morning email to every reader whose delivery time has come.
// Runs every 15 minutes (/api/cron/deliver). A reader is due when, in their
// own time zone, it is past their delivery time (within a 3-hour window) and
// they haven't been emailed for that local date yet.

import { appUrl, unsubscribeUrl } from './email/links.mjs'
import { renderMorningEmail } from './email/morning.mjs'
import { ensureEdition, todayUtc } from './pipeline/daily.mjs'
import { PLANS, activeLanguageCodes, currentPlan, orderLanguages } from './plans.mjs'
import { sendEmail } from './send-email.mjs'
import { adminDb, latestEdition } from './store.mjs'

const WINDOW_MINUTES = 180

// The reader's local calendar date and minutes since local midnight.
export function localClock(timeZone, now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(now)
      .map(x => [x.type, x.value])
  )
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) }
}

export function isDue(profile, now = new Date()) {
  const { minutes } = localClock(profile.timezone, now)
  const [h, m] = profile.delivery_time.split(':').map(Number)
  const since = minutes - (h * 60 + m)
  return since >= 0 && since < WINDOW_MINUTES
}

function check({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`)
  return data
}

async function loadReaders(userId) {
  let query = adminDb()
    .from('profiles')
    .select('id, email, native_lang, timezone, delivery_time, plan, trial_ends_at, preview_ends_at, email_enabled, onboarded_at, learning_languages(lang, level, purchased, active, sort_order, created_at)')
    .not('onboarded_at', 'is', null)
  if (userId) query = query.eq('id', userId)
  return check(await query, 'load readers')
}

// Builds and sends one reader's email. Returns a delivery row.
async function deliverTo(reader, now, built) {
  const local = localClock(reader.timezone, now)
  const plan = currentPlan(reader, now)
  const active = activeLanguageCodes(reader, reader.learning_languages)
  const languages = orderLanguages(reader.learning_languages).filter(l => active.has(l.lang))
  const date = todayUtc()

  const sections = []
  for (const l of languages) {
    const edition = { lang: l.lang, level: l.level, native: reader.native_lang }
    const key = `${edition.lang}:${edition.level}:${edition.native}`
    // Build each edition at most once per run, however many readers share it.
    built.set(key, built.get(key) ?? ensureEdition(edition, date))
    await built.get(key)
    const content = await latestEdition(edition)
    if (!content) continue
    sections.push({
      lang: l.lang,
      level: l.level,
      contentDate: content.date,
      articles: content.articles.map(a => ({ topic: a.topic, headline: a.headline.text, translation: a.translation.headline })),
    })
  }
  if (!sections.length) return { user_id: reader.id, local_date: local.date, content_date: date, status: 'skipped', error: 'no content' }

  const unsubscribe = unsubscribeUrl(reader.id)
  const email = renderMorningEmail({
    localDate: local.date,
    sections,
    chooseOne: PLANS[plan].articlesPerDay === 1,
    newsBoxUrl: lang => appUrl(`/dashboard?lang=${lang}`),
    settingsUrl: appUrl('/settings'),
    unsubscribeUrl: unsubscribe,
    postalAddress: process.env.EMAIL_POSTAL_ADDRESS,
  })
  const sent = await sendEmail({
    to: reader.email,
    ...email,
    headers: { 'List-Unsubscribe': `<${unsubscribe}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })
  return { user_id: reader.id, local_date: local.date, content_date: sections[0].contentDate, email_id: sent?.id ?? null, status: 'sent' }
}

// options.userId + options.force: send to one reader now, ignoring the time
// window and earlier deliveries (for testing). The delivery is still recorded.
export async function deliverMorning({ now = new Date(), userId, force = false } = {}) {
  const db = adminDb()
  const readers = (await loadReaders(userId)).filter(
    r => r.email_enabled && currentPlan(r, now) !== 'inactive' && (force || isDue(r, now))
  )

  // Skip readers already emailed for their local date.
  const dates = [...new Set(readers.map(r => localClock(r.timezone, now).date))]
  const done = dates.length
    ? check(
        await db
          .from('deliveries')
          .select('user_id, local_date')
          .in('local_date', dates)
          .in('user_id', readers.map(r => r.id))
          // Failed sends are retried on the next run, within the window.
          .in('status', ['sent', 'skipped']),
        'load deliveries'
      )
    : []
  const sentKey = new Set(done.map(d => `${d.user_id}:${d.local_date}`))
  const due = readers.filter(r => force || !sentKey.has(`${r.id}:${localClock(r.timezone, now).date}`))

  const built = new Map()
  const results = []
  for (const reader of due) {
    let row
    try {
      row = await deliverTo(reader, now, built)
    } catch (err) {
      row = { user_id: reader.id, local_date: localClock(reader.timezone, now).date, content_date: todayUtc(), status: 'failed', error: err.message }
    }
    check(await db.from('deliveries').upsert(row, { onConflict: 'user_id,local_date' }), 'record delivery')
    results.push({ email: reader.email, status: row.status, error: row.error })
  }
  return { checked: readers.length, sent: results.filter(r => r.status === 'sent').length, results }
}
