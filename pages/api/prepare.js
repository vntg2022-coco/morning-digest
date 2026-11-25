// Makes sure today's stories exist for the signed-in reader's main languages.
//   POST  start building any missing editions in the background
//   GET   { ready } once every edition for today exists
// Used right after signup, when the morning run hasn't built this reader's
// combination yet. Each edition costs at most ~$0.3 and 1–3 minutes.

import { waitUntil } from '@vercel/functions'
import { editionReady, ensureEdition, todayUtc } from '../../lib/pipeline/daily.mjs'
import { activeLanguageCodes, currentPlan } from '../../lib/plans.mjs'
import { adminDb } from '../../lib/store.mjs'
import { createSupabaseServer } from '../../lib/supabase/server'

export const config = { maxDuration: 300 }

// Editions being built by this server instance, so repeated POSTs don't start duplicates.
const building = new Map()

export default async function handler(req, res) {
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.onboarded_at || currentPlan(profile) === 'inactive') return res.status(200).json({ ready: true, editions: 0 })
  const { data: languages } = await db.from('learning_languages').select('lang, level, purchased, active, sort_order, created_at').eq('user_id', user.id)
  const active = activeLanguageCodes(profile, languages)
  const editions = languages.filter(l => active.has(l.lang)).map(l => ({ lang: l.lang, level: l.level, native: profile.native_lang }))

  const date = todayUtc()
  const missing = []
  for (const e of editions) if (!(await editionReady(e, date))) missing.push(e)

  if (req.method === 'POST') {
    for (const e of missing) {
      const key = `${date}:${e.lang}:${e.level}:${e.native}`
      if (building.has(key)) continue
      const job = ensureEdition(e, date)
        .catch(err => console.error(`prepare ${key} failed:`, err))
        .finally(() => building.delete(key))
      building.set(key, job)
      waitUntil(job)
    }
  } else if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({ ready: missing.length === 0, editions: editions.length, missing: missing.length })
}
