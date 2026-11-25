// Step 1 (once per day, shared by every language): pick the 3 stories to teach from.

import { z } from 'zod'
import { generateStructured } from '../claude.mjs'

export const STORIES_PER_DAY = 3

const SelectionSchema = z.object({
  picks: z
    .array(
      z.object({
        index: z.number().int().describe('Index of the article in the input list'),
        topic: z.string().describe('One or two words, e.g. "Politics", "Science", "Culture"'),
      })
    )
    .describe(`Exactly ${STORIES_PER_DAY} picks, best first`),
})

const SYSTEM = `You are the editor of a morning news digest for adults learning a foreign language. Each day you choose ${STORIES_PER_DAY} stories that learners will read in their target language.

Choose stories that:
- have enough substance in the excerpt to retell in a few sentences (skip items that are only scores, stats, or a teaser),
- matter to a general international reader,
- cover different topics from each other (avoid three politics stories),
- teach broadly useful vocabulary.

Avoid graphic violence as the main subject, celebrity gossip, and items that are only promotional.`

export async function selectStories(headlines) {
  const list = headlines.map((a, i) => `[${i}] ${a.title}\n${a.description}\n${a.content}`).join('\n\n')
  const { data, usage } = await generateStructured({
    schema: SelectionSchema,
    system: SYSTEM,
    prompt: `Today's candidate articles:\n\n${list}`,
    effort: 'low',
    maxTokens: 4000,
  })

  const seen = new Set()
  const stories = data.picks
    .filter(p => headlines[p.index] && !seen.has(p.index) && seen.add(p.index))
    .slice(0, STORIES_PER_DAY)
    .map(p => ({ ...headlines[p.index], topic: p.topic }))

  if (stories.length < STORIES_PER_DAY) throw new Error(`Selection returned only ${stories.length} usable stories`)
  return { stories, usage }
}
