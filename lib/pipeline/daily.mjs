// Builds content for a day, reusing whatever already exists in Supabase.
// An edition is what one reader sees: learning language × level × native language.
//   stories      once per day (GNews + Claude selection)
//   articles     once per story × learning language × level
//   translations once per article × native language
// So a reader who signs up in the afternoon gets their edition written from the
// same 3 stories everyone else got that morning, paying only for what's missing.

import { fetchTopHeadlines } from '../news.mjs'
import { adminDb } from '../store.mjs'
import { selectStories } from './select.mjs'
import { writeStories } from './write.mjs'
import { translateStories } from './translate.mjs'

// Claude Opus 5.5 list prices, USD per million tokens. Used only for the cost estimate in logs.
const PRICE_IN = 4
const PRICE_OUT = 20

export const todayUtc = () => new Date().toISOString().slice(0, 10)

export function parseEdition(str) {
  const [lang, level, native] = str.split(':')
  return { lang, level, native }
}

function check({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`)
  return data
}

function tally(usage, u) {
  usage.input += u?.input_tokens ?? 0
  usage.output += u?.output_tokens ?? 0
}

// The day's 3 stories, selecting and saving them first if needed.
export async function ensureStories(date, usage = { input: 0, output: 0 }) {
  const db = adminDb()
  const existing = check(await db.from('stories').select('*').eq('date', date).order('position'), 'load stories')
  // Never reselect a day that already has stories: articles point at these rows.
  if (existing.length === 3) return existing

  const headlines = await fetchTopHeadlines({ max: 10 })
  const selected = await selectStories(headlines)
  tally(usage, selected.usage)
  return check(
    await db
      .from('stories')
      .upsert(
        selected.stories.map((s, i) => ({
          date,
          position: i + 1,
          topic: s.topic,
          title: s.title,
          source: s.source,
          url: s.url,
          published_at: s.publishedAt ?? null,
          description: s.description,
          excerpt: s.content,
        })),
        { onConflict: 'date,position' }
      )
      .select('*')
      .order('position'),
    'save stories'
  )
}

// Makes sure one edition exists for the date. Returns token usage.
export async function ensureEdition({ lang, level, native }, date = todayUtc(), usage = { input: 0, output: 0 }) {
  const db = adminDb()
  const stories = await ensureStories(date, usage)
  const storyIds = stories.map(s => s.id)

  let articles = check(
    await db.from('articles').select('*').in('story_id', storyIds).eq('lang', lang).eq('level', level),
    'load articles'
  )
  const missing = stories.filter(s => !articles.some(a => a.story_id === s.id))
  if (missing.length) {
    const written = await writeStories(
      // Stories saved before excerpts were stored fall back to their title.
      missing.map(s => ({ ...s, description: s.description ?? s.title, content: s.excerpt ?? '', publishedAt: s.published_at })),
      lang,
      level
    )
    tally(usage, written.usage)
    const saved = check(
      await db
        .from('articles')
        .upsert(
          written.articles.map((a, i) => ({
            story_id: missing[i].id,
            lang,
            level,
            headline: a.headline,
            sentences: a.sentences,
            glossary: a.glossary,
          })),
          { onConflict: 'story_id,lang,level' }
        )
        .select('*'),
      'save articles'
    )
    articles = [...articles, ...saved]
  }

  const translated = check(
    await db.from('translations').select('article_id').in('article_id', articles.map(a => a.id)).eq('native_lang', native),
    'load translations'
  ).map(t => t.article_id)
  const untranslated = articles.filter(a => !translated.includes(a.id))
  if (untranslated.length) {
    const t = await translateStories({ lang, articles: untranslated }, native)
    tally(usage, t.usage)
    check(
      await db.from('translations').upsert(
        t.articles.map((tr, i) => ({
          article_id: untranslated[i].id,
          native_lang: native,
          headline: tr.headline,
          sentences: tr.sentences,
          glossary: tr.glossary,
        })),
        { onConflict: 'article_id,native_lang' }
      ),
      'save translations'
    )
  }
  return usage
}

// Every edition for the day. Editions that share a learning language and level
// run one after another so the article is written once; groups run in parallel.
export async function buildDay(editions, date = todayUtc()) {
  const usage = { input: 0, output: 0 }
  await ensureStories(date, usage)
  const groups = new Map()
  for (const e of editions) {
    const key = `${e.lang}:${e.level}`
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  const failures = []
  await Promise.all(
    [...groups.values()].map(async group => {
      for (const e of group) {
        try {
          await ensureEdition(e, date, usage)
        } catch (err) {
          failures.push({ edition: `${e.lang}:${e.level}:${e.native}`, error: err.message })
        }
      }
    })
  )
  const cost = (usage.input * PRICE_IN + usage.output * PRICE_OUT) / 1e6
  return { date, editions: editions.length, failures, usage: { ...usage, estimatedCostUsd: Math.round(cost * 1000) / 1000 } }
}

// True when all 3 stories of the date exist for this edition.
export async function editionReady({ lang, level, native }, date = todayUtc()) {
  const rows = check(
    await adminDb()
      .from('articles')
      .select('id, stories!inner(date), translations!inner(native_lang)')
      .eq('lang', lang)
      .eq('level', level)
      .eq('stories.date', date)
      .eq('translations.native_lang', native),
    'check edition'
  )
  return rows.length === 3
}
