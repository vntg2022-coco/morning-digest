// Reader settings.
//   PATCH { nativeLang, timezone, deliveryTime }
//   POST  { action: 'add', lang, level }   add a language into a free slot
//   POST  { action: 'reorder', order }     save the order of all languages; the top
//                                          `slots` are active, the rest paused. Pausing
//                                          one that was active is a swap (once per 30 days)
//   POST  { action: 'level', lang, level } change a language's level
// Languages are never deleted (docs/SPEC.md).

import { LANGUAGE_BY_CODE } from '../../lib/languages.mjs'
import { languageSlots, nextSwapAt, orderLanguages } from '../../lib/plans.mjs'
import { adminDb } from '../../lib/store.mjs'
import { createSupabaseServer } from '../../lib/supabase/server'
import { isDeliveryTime, isLanguage, isLevel, isTimeZone } from '../../lib/validate.mjs'

const fmt = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

export default async function handler(req, res) {
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
  const { data: languages } = await db.from('learning_languages').select('lang, level, purchased, active, sort_order, created_at').eq('user_id', user.id)
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

  const ordered = orderLanguages(languages)
  const slots = languageSlots(profile, languages)
  const activeNow = new Set(ordered.slice(0, slots).map(l => l.lang))
  // Rewrites sort_order (and the derived active flag) to match `codes`.
  const saveOrder = async codes => {
    for (const [i, lang] of codes.entries()) {
      const { error } = await db
        .from('learning_languages')
        .update({ sort_order: i + 1, active: i < slots })
        .eq('user_id', user.id)
        .eq('lang', lang)
      if (error) throw new Error(error.message)
    }
  }

  if (body.action === 'reorder') {
    const codes = Array.isArray(body.order) ? body.order : []
    const valid = codes.length === languages.length && new Set(codes).size === codes.length && codes.every(c => languages.some(l => l.lang === c))
    if (!valid) return res.status(400).json({ error: 'Please reload the page and try again.' })
    const pausing = [...activeNow].filter(lang => !codes.slice(0, slots).includes(lang))
    if (pausing.length) {
      const next = nextSwapAt(profile)
      if (next) return res.status(429).json({ error: `You can swap languages once every 30 days. Your next swap is available on ${fmt(next)}.` })
      const { error } = await db.from('profiles').update({ last_language_swap_at: new Date().toISOString() }).eq('id', user.id)
      if (error) return res.status(500).json({ error: error.message })
    }
    await saveOrder(codes)
    const paused = pausing.map(l => LANGUAGE_BY_CODE[l].name).join(', ')
    return res.status(200).json({ ok: true, message: paused ? `${paused} paused. Archive and vocab list stay available.` : 'Order saved.' })
  }

  if (!isLanguage(body.lang)) return res.status(400).json({ error: 'Choose a language.' })
  const name = LANGUAGE_BY_CODE[body.lang].name
  const existing = languages.find(l => l.lang === body.lang)

  if (body.action === 'add') {
    if (body.lang === profile.native_lang) return res.status(400).json({ error: 'That is your native language.' })
    if (existing) return res.status(409).json({ error: `${name} is already on your list.` })
    if (!isLevel(body.level)) return res.status(400).json({ error: 'Choose your level.' })
    if (activeNow.size >= slots) {
      return res.status(403).json({ error: 'All your slots are in use. Upgrade, or add a slot for a one-time $4.99 (coming soon).' })
    }
    const { error } = await db.from('learning_languages').insert({ user_id: user.id, lang: body.lang, level: body.level, active: true })
    if (error) return res.status(500).json({ error: error.message })
    // New languages go to the end of the active part of the list, above paused ones.
    const codes = ordered.map(l => l.lang)
    codes.splice(activeNow.size, 0, body.lang)
    await saveOrder(codes)
    return res.status(200).json({ ok: true, message: `${name} added. Its stories start with the next morning edition.` })
  }

  if (body.action === 'level') {
    if (!existing) return res.status(404).json({ error: `${name} is not on your list.` })
    if (!isLevel(body.level)) return res.status(400).json({ error: 'Choose your level.' })
    const { error } = await db.from('learning_languages').update({ level: body.level }).eq('user_id', user.id).eq('lang', body.lang)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, message: `${name} level updated.` })
  }

  return res.status(400).json({ error: 'Unknown action.' })
}
