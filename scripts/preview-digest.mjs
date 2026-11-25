// Builds today's content for the given editions (reusing what already exists),
// and writes a tappable HTML preview per edition to previews/.
//
// Usage: npm run digest:preview -- es:intermediate:en zh:beginner:ja
//        (learning language : level : native language)
//        npm run digest:preview -- --active   (every edition a reader needs)
// Costs GNews + Claude calls only for content that doesn't exist yet.

import { mkdir, writeFile } from 'node:fs/promises'
import { buildDay, parseEdition } from '../lib/pipeline/daily.mjs'
import { renderEditionPreview } from '../lib/pipeline/reader-preview.mjs'
import { activeEditions, latestEdition } from '../lib/store.mjs'

const args = process.argv.slice(2)
const editions = args.includes('--active')
  ? await activeEditions()
  : (args.length ? args : ['es:intermediate:en']).map(parseEdition)
if (editions.length === 0) throw new Error('No editions to build')
console.log(`Building: ${editions.map(e => `${e.lang}:${e.level}:${e.native}`).join(', ')}`)

const started = Date.now()
const result = await buildDay(editions)
for (const f of result.failures) console.error(`FAILED ${f.edition}: ${f.error}`)

await mkdir('previews', { recursive: true })
for (const e of editions) {
  const edition = await latestEdition(e)
  if (!edition) continue
  const file = `previews/${edition.date}-${e.lang}-${e.level}-${e.native}.html`
  await writeFile(file, renderEditionPreview({ ...e, articles: edition.articles }, edition.date))
  console.log(`Wrote ${file}`)
}
console.log(`Tokens: ${result.usage.input} in / ${result.usage.output} out ≈ $${result.usage.estimatedCostUsd}`)
console.log(`Took ${Math.round((Date.now() - started) / 1000)}s`)
