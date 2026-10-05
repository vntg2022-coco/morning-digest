// Turns English news articles into a Spanish-learning digest with Claude.

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'

export const LEVELS = {
  beginner: 'CEFR A2: short sentences (max ~12 words), present and simple past tense, very common vocabulary',
  intermediate: 'CEFR B1: moderate sentences, common tenses including imperfect and future, everyday news vocabulary',
  advanced: 'CEFR B2-C1: natural journalistic Spanish, full range of tenses including subjunctive, richer vocabulary',
}

const DigestSchema = z.object({
  articles: z.array(
    z.object({
      index: z.number().int().describe('Index of the source article in the input list'),
      headline_es: z.string(),
      headline_en: z.string(),
      sentences: z
        .array(z.object({ es: z.string(), en: z.string() }))
        .describe('The summary, sentence by sentence, Spanish with its English translation'),
      vocabulary: z
        .array(z.object({ es: z.string(), en: z.string() }))
        .describe('Useful words or phrases that appear in the Spanish summary'),
    })
  ),
})

const SYSTEM_PROMPT = `You write a daily news digest for American adults who are learning Spanish.

For each article you are given, write:
- A Spanish headline and its English translation.
- A Spanish summary of 3-5 sentences, each paired with a natural English translation.
- 3-5 vocabulary items taken from your Spanish summary, with English meanings. Prefer words a learner at this level would not yet know but will meet again.

Use neutral Latin American Spanish. Match the learner's level exactly, since text that is too hard makes them quit and text that is too easy teaches nothing.

Only state facts that appear in the article text you were given. The input is a short excerpt, not the full story, so do not fill gaps with outside knowledge or guesses. If an excerpt is too thin to summarize, write fewer sentences rather than inventing detail.`

const client = new Anthropic()

export async function summarizeForLevel(articles, level) {
  const levelSpec = LEVELS[level]
  if (!levelSpec) throw new Error(`Unknown level: ${level}`)

  const articleText = articles
    .map((a, i) => `[${i}] ${a.title}\nSource: ${a.source}\n${a.description}\n${a.content}`)
    .join('\n\n')

  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    // On a safety decline, the API retries on Anthropic's recommended fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(DigestSchema) },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Learner level: ${levelSpec}\n\nArticles:\n\n${articleText}`,
      },
    ],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error(`Claude declined the request: ${response.stop_details?.category ?? 'unknown'}`)
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Claude response was cut off (max_tokens)')
  }
  if (!response.parsed_output) {
    throw new Error('Claude response did not match the digest schema')
  }

  return {
    level,
    usage: response.usage,
    articles: response.parsed_output.articles
      .filter(a => articles[a.index])
      .map(a => ({ ...a, url: articles[a.index].url, source: articles[a.index].source })),
  }
}
