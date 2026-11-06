// One-click "turn off morning emails" link from the email footer.
//   GET  (reader clicks the link)       → turns emails off, shows a confirmation page
//   POST (mail apps' one-click button)  → turns emails off (RFC 8058 List-Unsubscribe-Post)
// The link carries an HMAC of the user id, so nobody can turn off someone else's emails.

import { verifyUnsubscribe } from '../../../lib/email/links.mjs'
import { adminDb } from '../../../lib/store.mjs'

export default async function handler(req, res) {
  const { u, t } = req.query
  if (!verifyUnsubscribe(u, t)) return res.status(400).send('This link is invalid or has expired.')

  const { error } = await adminDb().from('profiles').update({ email_enabled: false }).eq('id', u)
  if (error) return res.status(500).send('Something went wrong. Please try again, or change this in Settings.')

  if (req.method === 'POST') return res.status(200).json({ ok: true })
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Morning emails turned off</title>
<body style="font-family:Georgia,serif;background:#f0eee9;color:#121212;text-align:center;padding:64px 16px">
<h1 style="font-weight:400">Morning emails are off</h1>
<p style="font-family:Arial,sans-serif;color:#5a5a5a">Your stories still arrive in your News box every morning. You can turn emails back on in Settings.</p>
<p><a href="/settings" style="font-family:Arial,sans-serif;color:#326891">Go to Settings</a></p></body>`)
}
