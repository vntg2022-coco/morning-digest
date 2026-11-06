// Stripe webhook (set up for the live site in build step 7):
// keeps profiles in sync with subscriptions and records add-on purchases.

import { handleCheckoutSession, stripe, syncSubscription } from '../../../lib/billing.mjs'
import { adminDb } from '../../../lib/store.mjs'

// Stripe signs the raw body, so Next.js must not parse it.
export const config = { api: { bodyParser: false } }

async function rawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  let event
  try {
    event = stripe().webhooks.constructEvent(await rawBody(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook signature check failed: ${err.message}`)
  }

  // Stripe may send an event more than once; handle each id once.
  const { error: seen } = await adminDb().from('stripe_events').insert({ id: event.id, type: event.type })
  if (seen?.code === '23505') return res.status(200).json({ received: true, duplicate: true })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSession(event.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await syncSubscription(event.data.object)
        break
      default:
        break
    }
  } catch (err) {
    // Let Stripe retry: forget the event id so the retry is processed.
    await adminDb().from('stripe_events').delete().eq('id', event.id)
    console.error(`Stripe webhook ${event.type} failed:`, err)
    return res.status(500).json({ error: err.message })
  }
  return res.status(200).json({ received: true })
}
