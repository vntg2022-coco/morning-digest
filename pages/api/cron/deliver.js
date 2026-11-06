// Called by Vercel Cron every 15 minutes (see vercel.json): emails every
// reader whose local delivery time has come. Builds any missing editions first.

import { deliverMorning } from '../../../lib/delivery.mjs'

export const config = { maxDuration: 800 }

export default async function handler(req, res) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron invocations.
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const result = await deliverMorning()
    const failed = result.results.filter(r => r.status === 'failed')
    if (failed.length) console.error('Morning email failures:', failed)
    return res.status(200).json({ ok: true, checked: result.checked, sent: result.sent, failed: failed.length })
  } catch (err) {
    console.error('Morning delivery failed:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
