// Absolute links for emails, and signed one-click unsubscribe links.

import { createHmac, timingSafeEqual } from 'node:crypto'

export function appUrl(path = '') {
  const base = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}${path}`
}

function sign(userId) {
  const secret = process.env.EMAIL_LINK_SECRET
  if (!secret) throw new Error('EMAIL_LINK_SECRET is not set')
  return createHmac('sha256', secret).update(`unsubscribe:${userId}`).digest('base64url')
}

export function unsubscribeUrl(userId) {
  return appUrl(`/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${sign(userId)}`)
}

export function verifyUnsubscribe(userId, token) {
  if (typeof userId !== 'string' || typeof token !== 'string') return false
  const expected = Buffer.from(sign(userId))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
