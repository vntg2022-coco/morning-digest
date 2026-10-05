// Called by Vercel Cron every morning (see vercel.json).
// For now it sends one digest to DIGEST_TEST_TO; per-user delivery comes with the user DB.

import { buildDigest } from '../../../lib/digest.mjs'
import { sendEmail } from '../../../lib/send-email.mjs'

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron invocations.
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { digest, subject, html } = await buildDigest({ level: process.env.DIGEST_TEST_LEVEL || 'intermediate' })
    const sent = await sendEmail({ to: process.env.DIGEST_TEST_TO, subject, html })
    return res.status(200).json({ ok: true, articles: digest.articles.length, emailId: sent?.id })
  } catch (err) {
    console.error('Digest cron failed:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
