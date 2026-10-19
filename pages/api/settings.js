// Reader settings.
//   PATCH  { nativeLang, timezone, deliveryTime }
//   POST   { lang, level }                 add a learning language (plan limit applies)
//   PUT    { lang, level }                 change the level of a learning language
//   DELETE { lang }                        remove a learning language (keeps at least one)

import { LANGUAGE_BY_CODE } from '../../lib/languages.mjs'
import { languageLimit } from '../../lib/plans.mjs'
import { adminDb } from '../../lib/store.mjs'
import { createSupabaseServer } from '../../lib/supabase/server'
import { isDeliveryTime, isLanguage, isLevel, isTimeZone } from '../../lib/validate.mjs'

export default async function handler(req, res) {
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
  const { data: languages } = await db.from('learning_languages').select('lang, level, purchased').eq('user_id', user.id)
  const body = req.body ?? {}

  if (req.method === 'PATCH') {
    if (!isTimeZone(body.timezone)) return res.status(400).json({ error: 'Choose your time zone.' })
    if (!isDeliveryTime(body.deliveryTime)) return res.status(400).json({ error: 'Choose a delivery time.' })
    if (!isLanguage(body.nativeLang)) return res.status(400).json({ error: 'Choose your native language.' })
    if (languages.some(l => l.lang === body.nativeLang)) {
      return res.status(400).json({ error: 'Your native language can’t also be a learning language.' })
    }
    const { error } = await db
      .from('profiles')
      .update({ native_lang: body.nativeLang, timezone: body.timezone, delivery_time: body.deliveryTime })
      .eq('id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (!isLanguage(body.lang)) return res.status(400).json({ error: 'Choose a language.' })
  const existing = languages.find(l => l.lang === body.lang)

  if (req.method === 'POST') {
    if (body.lang === profile.native_lang) return res.status(400).json({ error: 'That is your native language.' })
    if (existing) return res.status(409).json({ error: `You are already learning ${LANGUAGE_BY_CODE[body.lang].name}.` })
    if (!isLevel(body.level)) return res.status(400).json({ error: 'Choose your level.' })
    if (languages.length >= languageLimit(profile, languages)) {
      return res.status(403).json({ error: 'Your plan’s language limit is reached. Upgrade or add a language for a one-time $4.99 (coming soon).' })
    }
    const { error } = await db.from('learning_languages').insert({ user_id: user.id, lang: body.lang, level: body.level })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (!existing) return res.status(404).json({ error: 'You are not learning that language.' })

  if (req.method === 'PUT') {
    if (!isLevel(body.level)) return res.status(400).json({ error: 'Choose your level.' })
    const { error } = await db.from('learning_languages').update({ level: body.level }).eq('user_id', user.id).eq('lang', body.lang)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    if (languages.length <= 1) return res.status(400).json({ error: 'Keep at least one learning language.' })
    if (existing.purchased) return res.status(400).json({ error: 'Purchased languages can’t be removed.' })
    const { error } = await db.from('learning_languages').delete().eq('user_id', user.id).eq('lang', body.lang)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
