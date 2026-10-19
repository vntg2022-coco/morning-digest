// Saves the first-run settings: native language, first learning language and
// level, time zone and delivery time.

import { createSupabaseAdmin, createSupabaseServer } from '../../lib/supabase/server'
import { isDeliveryTime, isLanguage, isLevel, isTimeZone } from '../../lib/validate.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const { nativeLang, learningLang, level, timezone, deliveryTime } = req.body ?? {}
  if (!isLanguage(nativeLang) || !isLanguage(learningLang)) return res.status(400).json({ error: 'Choose your languages.' })
  if (nativeLang === learningLang) return res.status(400).json({ error: 'Pick a learning language different from your native language.' })
  if (!isLevel(level)) return res.status(400).json({ error: 'Choose your level.' })
  if (!isTimeZone(timezone)) return res.status(400).json({ error: 'Choose your time zone.' })
  if (!isDeliveryTime(deliveryTime)) return res.status(400).json({ error: 'Choose a delivery time.' })

  const admin = createSupabaseAdmin()

  // Onboarding runs once; later changes go through settings, which enforce plan limits.
  const { data: profile } = await admin.from('profiles').select('onboarded_at').eq('id', user.id).single()
  if (profile?.onboarded_at) return res.status(409).json({ error: 'You have already finished setup.' })

  const { error: profileError } = await admin
    .from('profiles')
    .update({ native_lang: nativeLang, timezone, delivery_time: deliveryTime, onboarded_at: new Date().toISOString() })
    .eq('id', user.id)
  if (profileError) return res.status(500).json({ error: profileError.message })

  const { error: langError } = await admin
    .from('learning_languages')
    .upsert({ user_id: user.id, lang: learningLang, level }, { onConflict: 'user_id,lang' })
  if (langError) return res.status(500).json({ error: langError.message })

  return res.status(200).json({ ok: true })
}
