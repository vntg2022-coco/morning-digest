// Reader settings.
//   PATCH { nativeLang, timezone, deliveryTime }
//   POST  { action: 'add', lang, level }   add a new language into a free main slot
//   POST  { action: 'activate', lang }     move a paused language into a free main slot
//   POST  { action: 'pause', lang }        move a main language down to paused (once per 30 days)
//   POST  { action: 'level', lang, level } change a language's level
// Languages are never deleted (docs/SPEC.md).

import { LANGUAGE_BY_CODE } from '../../lib/languages.mjs'
import { activeLanguageCodes, languageSlots, nextSwapAt } from '../../lib/plans.mjs'
import { adminDb } from '../../lib/store.mjs'
import { createSupabaseServer } from '../../lib/supabase/server'
import { isDeliveryTime, isLanguage, isLevel, isTimeZone } from '../../lib/validate.mjs'

const fmt = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

export default async function handler(req, res) {
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
  const { data: languages } = await db.from('learning_languages').select('lang, level, purchased, active, created_at').eq('user_id', user.id)
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

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isLanguage(body.lang)) return res.status(400).json({ error: 'Choose a language.' })
  const name = LANGUAGE_BY_CODE[body.lang].name
  const existing = languages.find(l => l.lang === body.lang)
  const freeSlot = activeLanguageCodes(profile, languages).size < languageSlots(profile, languages)
  const noSlot = () =>
    res.status(403).json({ error: 'Your main languages are full. Move one down to Paused, upgrade, or add a slot for a one-time $4.99 (coming soon).' })
  const update = async (values, message) => {
    const { error } = await db.from('learning_languages').update(values).eq('user_id', user.id).eq('lang', body.lang)
    return error ? res.status(500).json({ error: error.message }) : res.status(200).json({ ok: true, message })
  }

  switch (body.action) {
    case 'add': {
      if (body.lang === profile.native_lang) return res.status(400).json({ error: 'That is your native language.' })
      if (existing) return res.status(409).json({ error: `${name} is already on your list.` })
      if (!isLevel(body.level)) return res.status(400).json({ error: 'Choose your level.' })
      if (!freeSlot) return noSlot()
      const { error } = await db.from('learning_languages').insert({ user_id: user.id, lang: body.lang, level: body.level, active: true })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true, message: `${name} added. Its stories start with the next morning edition.` })
    }
    case 'activate': {
      if (!existing) return res.status(404).json({ error: `${name} is not on your list.` })
      if (existing.active) return res.status(200).json({ ok: true })
      if (!freeSlot) return noSlot()
      return update({ active: true }, `${name} is back in your main languages.`)
    }
    case 'pause': {
      if (!existing?.active) return res.status(400).json({ error: `${name} is not a main language.` })
      const next = nextSwapAt(profile)
      if (next) return res.status(429).json({ error: `You can swap languages once every 30 days. Your next swap is available on ${fmt(next)}.` })
      const { error } = await db.from('profiles').update({ last_language_swap_at: new Date().toISOString() }).eq('id', user.id)
      if (error) return res.status(500).json({ error: error.message })
      return update({ active: false }, `${name} moved to Paused. Its archive and vocab list stay available.`)
    }
    case 'level': {
      if (!existing) return res.status(404).json({ error: `${name} is not on your list.` })
      if (!isLevel(body.level)) return res.status(400).json({ error: 'Choose your level.' })
      return update({ level: body.level }, `${name} level updated.`)
    }
    default:
      return res.status(400).json({ error: 'Unknown action.' })
  }
}
