// Called by Vercel Cron every morning (see vercel.json).
// Builds the day's content for the editions listed in DIGEST_EDITIONS
// ("es:intermediate:en,zh:beginner:ja"). Saving it and emailing readers is
// wired up with the user database (build steps 3 and 5).

import { buildDailyContent, parseEdition } from '../../../lib/pipeline/daily.mjs'

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron invocations.
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!process.env.DIGEST_EDITIONS) {
    return res.status(200).json({ ok: true, skipped: 'DIGEST_EDITIONS is not set' })
  }

  try {
    const editions = process.env.DIGEST_EDITIONS.split(',').map(s => parseEdition(s.trim()))
    const content = await buildDailyContent({ editions })
    return res.status(200).json({ ok: true, date: content.date, editions: Object.keys(content.editions), usage: content.usage })
  } catch (err) {
    console.error('Daily content build failed:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
