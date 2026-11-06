// Reads and writes daily content and reader data in Supabase, with the secret
// key. Server-side only (cron, scripts, API routes, getServerSideProps).

import { createClient } from '@supabase/supabase-js'
import { activeLanguageCodes, currentPlan } from './plans.mjs'

let admin

function db() {
  admin ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return admin
}

function check({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`)
  return data
}

// Every edition (learning language × level × native language) that at least
// one reader with an active plan needs.
export async function activeEditions(now = new Date()) {
  const profiles = check(
    await db()
      .from('profiles')
      .select('id, native_lang, plan, trial_ends_at, preview_ends_at, extra_language_slots, learning_languages(lang, level, purchased, active, sort_order, created_at)')
      .not('onboarded_at', 'is', null),
    'load readers'
  )
  const keys = new Set()
  for (const p of profiles) {
    if (currentPlan(p, now) === 'inactive' || !p.native_lang) continue
    const active = activeLanguageCodes(p, p.learning_languages)
    for (const l of p.learning_languages) {
      if (active.has(l.lang)) keys.add(`${l.lang}:${l.level}:${p.native_lang}`)
    }
  }
  return [...keys].map(k => {
    const [lang, level, native] = k.split(':')
    return { lang, level, native }
  })
}

// The newest day that has content for this edition, with its 3 stories in
// order. Returns null when nothing has been generated yet.
export async function latestEdition({ lang, level, native }, { before } = {}) {
  let query = db()
    .from('articles')
    .select('id, headline, sentences, glossary, stories!inner(id, date, position, topic, title, source, url), translations!inner(native_lang, headline, sentences, glossary)')
    .eq('lang', lang)
    .eq('level', level)
    .eq('translations.native_lang', native)
    // Story ids grow day by day, so the newest articles come first.
    .order('story_id', { ascending: false })
  if (before) query = query.lt('stories.date', before)
  const rows = check(await query.limit(6), 'load edition')
  if (rows.length === 0) return null

  const date = rows.map(r => r.stories.date).sort().at(-1)
  return {
    date,
    articles: rows
      .filter(r => r.stories.date === date)
      .sort((a, b) => a.stories.position - b.stories.position)
      .map(toArticle),
  }
}

export async function getArticle(articleId, native) {
  const rows = check(
    await db()
      .from('articles')
      .select('id, lang, level, headline, sentences, glossary, stories!inner(id, date, position, topic, title, source, url), translations!inner(native_lang, headline, sentences, glossary)')
      .eq('id', articleId)
      .eq('translations.native_lang', native)
      .limit(1),
    'load article'
  )
  return rows[0] ? { ...toArticle(rows[0]), lang: rows[0].lang, level: rows[0].level } : null
}

function toArticle(r) {
  const t = r.translations[0]
  return {
    id: r.id,
    storyId: r.stories.id,
    date: r.stories.date,
    position: r.stories.position,
    topic: r.stories.topic,
    title: r.stories.title,
    source: r.stories.source,
    url: r.stories.url,
    headline: r.headline,
    sentences: r.sentences,
    glossary: r.glossary,
    translation: { headline: t.headline, sentences: t.sentences, glossary: t.glossary },
  }
}

export { db as adminDb }

// Past days for an edition, newest first: [{ date, articles: [...] }].
export async function listEditionDays({ lang, level, native }, { limit = 30 } = {}) {
  const rows = check(
    await db()
      .from('articles')
      .select('id, headline, stories!inner(id, date, position, topic, source), translations!inner(native_lang, headline)')
      .eq('lang', lang)
      .eq('level', level)
      .eq('translations.native_lang', native)
      .order('story_id', { ascending: false })
      .limit(limit * 3),
    'load archive'
  )
  const days = new Map()
  for (const r of rows) {
    const day = days.get(r.stories.date) ?? []
    day.push({
      id: r.id,
      storyId: r.stories.id,
      position: r.stories.position,
      topic: r.stories.topic,
      source: r.stories.source,
      headline: r.headline.text,
      headlineTranslation: r.translations[0].headline,
    })
    days.set(r.stories.date, day)
  }
  return [...days.entries()].map(([date, articles]) => ({ date, articles: articles.sort((a, b) => a.position - b.position) }))
}

// Standard plan: which story the reader chose for each day in this language.
export async function getPicks(userId, lang) {
  const rows = check(await db().from('article_picks').select('date, story_id').eq('user_id', userId).eq('lang', lang), 'load picks')
  return Object.fromEntries(rows.map(r => [r.date, r.story_id]))
}
