// Called by Vercel Cron every morning (see vercel.json): builds the day's
// content for every edition an active reader needs. Emailing readers is build step 5.

import { buildDay } from '../../../lib/pipeline/daily.mjs'
import { activeEditions } from '../../../lib/store.mjs'

export const config = { maxDuration: 800 }

export default async function handler(req, res) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron invocations.
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const result = await buildDay(await activeEditions())
    if (result.failures.length) console.error('Some editions failed:', result.failures)
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    console.error('Daily content build failed:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
