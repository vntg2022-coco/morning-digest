// Step 3 (once per learning language × level × native language): translate the
// written stories and glossary into the reader's native language.

import { z } from 'zod'
import { generateStructured } from '../claude.mjs'
import { LANGUAGE_BY_CODE } from '../languages.mjs'

const TranslationSchema = z.object({
  headline: z.string(),
  sentences: z.array(z.string()).describe('One translation per source sentence, same order and count'),
  glossary: z.array(
    z.object({
      lemma: z.string().describe('Copied exactly from the source glossary'),
      meaning: z.string().describe('Short meaning in the native language, as used in this article'),
      example_translation: z.string().describe('Translation of the glossary example sentence'),
    })
  ),
})

export async function translateStories(written, nativeCode) {
  const from = LANGUAGE_BY_CODE[written.lang]
  const to = LANGUAGE_BY_CODE[nativeCode]
  if (!to) throw new Error(`Unknown language: ${nativeCode}`)
  if (nativeCode === written.lang) throw new Error('Native language must differ from the learning language')

  const system = `You translate a ${from.name} news story written for language learners into ${to.name}${nativeCode === 'zh' ? ' (Simplified Chinese)' : ''}.

Translate each sentence on its own, keeping a one-to-one match with the source sentences, so a learner can compare them line by line. Stay close to the source meaning while sounding natural in ${to.name}.

For each glossary entry, give its meaning as used in this story (short, dictionary style) and translate its example sentence.`

  const usage = { input_tokens: 0, output_tokens: 0 }
  const articles = await Promise.all(
    written.articles.map(async (src, i) => {
      const source = {
        headline: src.headline.text,
        sentences: src.sentences.map(s => s.text),
        glossary: src.glossary.map(g => ({ lemma: g.lemma, example: g.example })),
      }
      const { data: t, usage: u } = await generateStructured({
        schema: TranslationSchema,
        system,
        prompt: JSON.stringify(source, null, 1),
      })
      usage.input_tokens += u.input_tokens
      usage.output_tokens += u.output_tokens

      if (t.sentences.length !== src.sentences.length) {
        throw new Error(`Article ${i + 1}: ${src.sentences.length} sentences but ${t.sentences.length} translations`)
      }
      const byLemma = Object.fromEntries(t.glossary.map(g => [g.lemma, g]))
      return {
        headline: t.headline,
        sentences: t.sentences,
        glossary: Object.fromEntries(
          src.glossary
            .filter(g => byLemma[g.lemma])
            .map(g => [g.lemma, { meaning: byLemma[g.lemma].meaning, example_translation: byLemma[g.lemma].example_translation }])
        ),
      }
    })
  )

  return { native: nativeCode, articles, usage }
}
