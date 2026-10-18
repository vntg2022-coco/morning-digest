// Step 2 (once per learning language × level): retell the day's stories in the
// learning language, with every useful word marked so the reader can tap it.

import { z } from 'zod'
import { generateStructured } from '../claude.mjs'
import { LANGUAGE_BY_CODE } from '../languages.mjs'

export const LEVELS = {
  beginner: {
    label: 'Beginner',
    spec: 'CEFR A2 (≈ HSK 2–3, JLPT N4, TOPIK 2). 4–5 short sentences of at most ~12 words; present and simple past; very common vocabulary.',
  },
  intermediate: {
    label: 'Intermediate',
    spec: 'CEFR B1 (≈ HSK 4, JLPT N3, TOPIK 3–4). 5–6 sentences of moderate length; common tenses; everyday news vocabulary.',
  },
  advanced: {
    label: 'Advanced',
    spec: 'CEFR B2–C1 (≈ HSK 5–6, JLPT N2–N1, TOPIK 5–6). 6–8 sentences of natural journalistic style; full range of grammar; richer vocabulary.',
  },
}

const WordSchema = z.object({
  surface: z.string().describe('The word or phrase exactly as it appears in the sentence text, same spelling and characters'),
  lemma: z.string().describe('Dictionary form'),
})

const SentenceSchema = z.object({
  text: z.string(),
  words: z.array(WordSchema).describe('Tappable words in this sentence, in order of appearance'),
})

const ArticleSchema = z.object({
  headline: SentenceSchema,
  sentences: z.array(SentenceSchema),
  glossary: z
    .array(
      z.object({
        lemma: z.string(),
        reading: z
          .string()
          .describe('Pronunciation aid in Latin letters or kana: pinyin for Chinese, hiragana for Japanese kanji words, romanization for Korean, Hindi, Urdu and Russian. Empty string for Latin-script languages.'),
        part_of_speech: z.string().describe('In English, e.g. "noun", "verb", "phrase"'),
        example: z.string().describe('A new, short example sentence in the learning language using this word at the same level'),
      })
    )
    .describe('One entry per distinct lemma used in this article'),
})

function systemPrompt(lang, level) {
  return `You write a daily news digest for adults learning ${lang.name}. You retell real news stories in ${lang.name} so a learner can read them over breakfast.

Level: ${level.spec}
Match this level closely. Text that is too hard makes learners quit, and text that is too easy teaches nothing.

Write natural, standard ${lang.name}${lang.code === 'zh' ? ' in Simplified Chinese' : ''}${lang.code === 'es' ? ' (neutral Latin American)' : ''}${lang.code === 'pt' ? ' (Brazilian)' : ''}. Write a headline and the sentences for the story you are given.

Only state facts that appear in the article excerpt you are given. The excerpt is short, so do not fill gaps with outside knowledge; write fewer sentences rather than inventing detail.

Mark tappable words: in each headline and sentence, list every word or set phrase a learner at this level might want to look up — nouns, verbs, adjectives, adverbs, numbers with units, and fixed expressions. Skip only the most basic function words (articles, simple pronouns, common particles and conjunctions). "surface" must be copied exactly from the sentence text so it can be found there; "lemma" is its dictionary form. For languages written without spaces, segment into dictionary words.

Then give a glossary with one entry per distinct lemma you marked.`
}

// Drop any marked word whose surface cannot be found in its sentence, so the
// reader never shows a broken highlight.
function keepFindableWords(sentence) {
  let from = 0
  const words = []
  for (const w of sentence.words) {
    const at = sentence.text.indexOf(w.surface, from)
    if (at === -1) continue
    words.push(w)
    from = at + w.surface.length
  }
  return { ...sentence, words }
}

export async function writeStories(stories, langCode, levelKey) {
  const lang = LANGUAGE_BY_CODE[langCode]
  const level = LEVELS[levelKey]
  if (!lang) throw new Error(`Unknown language: ${langCode}`)
  if (!level) throw new Error(`Unknown level: ${levelKey}`)

  // One call per story: smaller outputs, run in parallel, and no risk of the
  // model dropping stories from a combined answer.
  const results = await Promise.all(
    stories.map(s =>
      generateStructured({
        schema: ArticleSchema,
        system: systemPrompt(lang, level),
        prompt: `Retell this story (${s.topic}):\n\nTitle: ${s.title}\nSource: ${s.source}\n${s.description}\n${s.content}`,
      })
    )
  )

  const usage = { input_tokens: 0, output_tokens: 0 }
  const articles = results.map(({ data: a, usage: u }, i) => {
    usage.input_tokens += u.input_tokens
    usage.output_tokens += u.output_tokens
    return {
      topic: stories[i].topic,
      source: stories[i].source,
      url: stories[i].url,
      publishedAt: stories[i].publishedAt,
      headline: keepFindableWords(a.headline),
      sentences: a.sentences.map(keepFindableWords),
      glossary: a.glossary,
    }
  })

  return { lang: langCode, level: levelKey, articles, usage }
}
