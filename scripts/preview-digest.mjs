// Builds a real digest and writes it to previews/ so you can open it in a browser.
// Usage: npm run digest:preview -- [beginner|intermediate|advanced]
// Costs one GNews request and one Claude request.

import { mkdir, writeFile } from 'node:fs/promises'
import { buildDigest } from '../lib/digest.mjs'

const level = process.argv[2] ?? 'intermediate'
const { digest, subject, html } = await buildDigest({ level })

await mkdir('previews', { recursive: true })
const file = `previews/digest-${level}.html`
await writeFile(file, html)

console.log(`Subject: ${subject}`)
console.log(`Articles: ${digest.articles.length}`)
console.log(`Tokens: ${digest.usage.input_tokens} in / ${digest.usage.output_tokens} out`)
console.log(`Wrote ${file}`)
