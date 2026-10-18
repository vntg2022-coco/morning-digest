// Builds one day's content for a set of editions.
// An edition is what one reader sees: learning language × level × native language.
// Work is shared so cost grows with distinct editions, not with readers:
//   select stories    once per day
//   write stories     once per learning language × level
//   translate         once per edition

import { fetchTopHeadlines } from '../news.mjs'
import { selectStories } from './select.mjs'
import { writeStories } from './write.mjs'
import { translateStories } from './translate.mjs'

// Claude Opus 5.5 list prices, USD per million tokens. Used only for the cost estimate in logs.
const PRICE_IN = 4
const PRICE_OUT = 20

export function editionKey({ lang, level, native }) {
  return `${lang}-${level}-${native}`
}

export function parseEdition(str) {
  const [lang, level, native] = str.split(':')
  return { lang, level, native }
}

function addUsage(total, usage) {
  total.input += usage.input_tokens ?? 0
  total.output += usage.output_tokens ?? 0
}

export async function buildDailyContent({ editions, date = new Date().toISOString().slice(0, 10) }) {
  const usage = { input: 0, output: 0 }

  const headlines = await fetchTopHeadlines({ max: 10 })
  const selected = await selectStories(headlines)
  addUsage(usage, selected.usage)

  const writeKeys = [...new Set(editions.map(e => `${e.lang}-${e.level}`))]
  const written = Object.fromEntries(
    await Promise.all(
      writeKeys.map(async key => {
        const [lang, level] = key.split('-')
        const w = await writeStories(selected.stories, lang, level)
        addUsage(usage, w.usage)
        return [key, w]
      })
    )
  )

  const results = await Promise.all(
    editions.map(async e => {
      const w = written[`${e.lang}-${e.level}`]
      const t = await translateStories(w, e.native)
      addUsage(usage, t.usage)
      return {
        key: editionKey(e),
        ...e,
        articles: w.articles.map((a, i) => ({ ...a, translation: t.articles[i] })),
      }
    })
  )

  const cost = (usage.input * PRICE_IN + usage.output * PRICE_OUT) / 1e6
  return {
    date,
    stories: selected.stories.map(s => ({ title: s.title, source: s.source, url: s.url, topic: s.topic })),
    editions: Object.fromEntries(results.map(r => [r.key, r])),
    usage: { ...usage, estimatedCostUsd: Math.round(cost * 1000) / 1000 },
  }
}
