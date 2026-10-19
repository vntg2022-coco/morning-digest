// Standard plan: records the one story a reader chooses for a day.
// The primary key (user, date, language) makes the choice final.

import { PLANS, currentPlan } from '../../lib/plans.mjs'
import { adminDb } from '../../lib/store.mjs'
import { createSupabaseServer } from '../../lib/supabase/server'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const articleId = Number(req.body?.articleId)
  if (!Number.isInteger(articleId)) return res.status(400).json({ error: 'Unknown story.' })

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('plan, trial_ends_at').eq('id', user.id).single()
  const plan = currentPlan(profile)
  if (plan === 'inactive') return res.status(403).json({ error: 'Choose a plan to keep reading.' })
  // Plans with all 3 stories don't need to pick.
  if (PLANS[plan].articlesPerDay >= 3) return res.status(200).json({ ok: true })

  const { data: article } = await db.from('articles').select('lang, stories!inner(id, date)').eq('id', articleId).single()
  if (!article) return res.status(404).json({ error: 'Unknown story.' })

  const { data: owned } = await db.from('learning_languages').select('lang').eq('user_id', user.id).eq('lang', article.lang)
  if (!owned?.length) return res.status(403).json({ error: 'That story is not in one of your languages.' })

  const { error } = await db
    .from('article_picks')
    .insert({ user_id: user.id, date: article.stories.date, lang: article.lang, story_id: article.stories.id })
  if (error?.code === '23505') return res.status(409).json({ error: 'You already chose today’s story.' })
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ ok: true })
}
