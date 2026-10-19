// Builds today's content for the given editions, saves it to Supabase, and
// writes a tappable HTML preview per edition to previews/.
//
// Usage: npm run digest:preview -- es:intermediate:en zh:beginner:ja
//        (learning language : level : native language)
//        npm run digest:preview -- --active   (every edition a reader needs)
// Costs one GNews request plus Claude calls (cost estimate is printed).

import { mkdir, writeFile } from 'node:fs/promises'
import { buildDailyContent, parseEdition } from '../lib/pipeline/daily.mjs'
import { renderEditionPreview } from '../lib/pipeline/reader-preview.mjs'
import { activeEditions, saveDailyContent } from '../lib/store.mjs'

const args = process.argv.slice(2)
const editions = args.includes('--active')
  ? await activeEditions()
  : (args.length ? args : ['es:intermediate:en']).map(parseEdition)
if (editions.length === 0) throw new Error('No editions to build')
console.log(`Building: ${editions.map(e => `${e.lang}:${e.level}:${e.native}`).join(', ')}`)

const started = Date.now()
const content = await buildDailyContent({ editions })
await saveDailyContent(content)

await mkdir('previews', { recursive: true })
for (const [key, edition] of Object.entries(content.editions)) {
  const file = `previews/${content.date}-${key}.html`
  await writeFile(file, renderEditionPreview(edition, content.date))
  console.log(`Wrote ${file}`)
}

console.log(`Stories: ${content.stories.map(s => `[${s.topic}] ${s.title}`).join('\n         ')}`)
console.log(`Saved to Supabase for ${content.date}`)
console.log(`Tokens: ${content.usage.input} in / ${content.usage.output} out ≈ $${content.usage.estimatedCostUsd}`)
console.log(`Took ${Math.round((Date.now() - started) / 1000)}s`)
