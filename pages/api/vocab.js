// Premium vocab list: POST { articleId, lemma } saves a tapped word,
// DELETE { id } removes one. The meaning and example come from the article's
// glossary in the reader's native language, never from the request.

import { PLANS, currentPlan } from '../../lib/plans.mjs'
import { adminDb, getArticle } from '../../lib/store.mjs'
import { createSupabaseServer } from '../../lib/supabase/server'

export default async function handler(req, res) {
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('plan, trial_ends_at, preview_ends_at, native_lang').eq('id', user.id).single()
  if (!PLANS[currentPlan(profile)].vocab) return res.status(403).json({ error: 'The vocab list is part of Premium.' })

  if (req.method === 'DELETE') {
    const id = Number(req.body?.id)
    const { error } = await db.from('vocab').delete().eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const articleId = Number(req.body?.articleId)
  const lemma = String(req.body?.lemma ?? '')
  const article = Number.isInteger(articleId) ? await getArticle(articleId, profile.native_lang) : null
  const entry = article?.glossary.find(g => g.lemma === lemma)
  if (!entry) return res.status(404).json({ error: 'Unknown word.' })
  const meaning = article.translation.glossary[lemma] ?? {}

  const { error } = await db.from('vocab').upsert(
    {
      user_id: user.id,
      lang: article.lang,
      lemma,
      reading: entry.reading || null,
      meaning: meaning.meaning ?? null,
      example: entry.example ?? null,
      example_translation: meaning.example_translation ?? null,
      article_id: articleId,
    },
    { onConflict: 'user_id,lang,lemma', ignoreDuplicates: true }
  )
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
