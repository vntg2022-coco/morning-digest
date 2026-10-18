// Builds today's content for the given editions, saves it under data/content/,
// and writes a tappable HTML preview per edition to previews/.
//
// Usage: npm run digest:preview -- es:intermediate:en zh:beginner:ja
//        (learning language : level : native language)
// Costs one GNews request plus Claude calls (cost estimate is printed).

import { mkdir, writeFile } from 'node:fs/promises'
import { buildDailyContent, parseEdition } from '../lib/pipeline/daily.mjs'
import { renderEditionPreview } from '../lib/pipeline/reader-preview.mjs'
import { saveDailyContent } from '../lib/store.mjs'

const args = process.argv.slice(2)
const editions = (args.length ? args : ['es:intermediate:en']).map(parseEdition)

const started = Date.now()
const content = await buildDailyContent({ editions })
const dir = await saveDailyContent(content)

await mkdir('previews', { recursive: true })
for (const [key, edition] of Object.entries(content.editions)) {
  const file = `previews/${content.date}-${key}.html`
  await writeFile(file, renderEditionPreview(edition, content.date))
  console.log(`Wrote ${file}`)
}

console.log(`Stories: ${content.stories.map(s => `[${s.topic}] ${s.title}`).join('\n         ')}`)
console.log(`Saved JSON to ${dir}`)
console.log(`Tokens: ${content.usage.input} in / ${content.usage.output} out ≈ $${content.usage.estimatedCostUsd}`)
console.log(`Took ${Math.round((Date.now() - started) / 1000)}s`)
