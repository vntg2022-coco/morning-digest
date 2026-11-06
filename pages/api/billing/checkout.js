// Starts a Stripe Checkout and returns its URL.
//   POST { plan: 'standard' | 'premium' }  subscription; first one gets a 7-day free trial
//   POST { purchase: 'language_slot' }     one-time $4.99, adds one language to the list

import { TRIAL_DAYS, ensureCustomer, getPrices, stripe } from '../../../lib/billing.mjs'
import { appUrl } from '../../../lib/email/links.mjs'
import { adminDb } from '../../../lib/store.mjs'
import { createSupabaseServer } from '../../../lib/supabase/server'

const LIVE = new Set(['trialing', 'active', 'past_due'])

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const { data: profile } = await adminDb().from('profiles').select('*').eq('id', user.id).single()
  const prices = await getPrices()
  const customer = await ensureCustomer(profile)
  const body = req.body ?? {}

  if (body.purchase === 'language_slot') {
    if (!LIVE.has(profile.subscription_status)) return res.status(403).json({ error: 'Start a plan first, then add languages.' })
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer,
      line_items: [{ price: prices.languageSlot.id, quantity: 1 }],
      metadata: { user_id: user.id, purchase: 'language_slot' },
      success_url: appUrl('/billing?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: appUrl('/billing'),
    })
    return res.status(200).json({ url: session.url })
  }

  if (!['standard', 'premium'].includes(body.plan)) return res.status(400).json({ error: 'Choose a plan.' })
  if (LIVE.has(profile.subscription_status)) {
    return res.status(409).json({ error: 'You already have a plan. Use “Manage plan” to switch or cancel.' })
  }
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: prices[body.plan].id, quantity: 1 }],
    subscription_data: {
      metadata: { user_id: user.id },
      ...(profile.trial_used ? {} : { trial_period_days: TRIAL_DAYS }),
    },
    metadata: { user_id: user.id },
    success_url: appUrl('/billing?session_id={CHECKOUT_SESSION_ID}'),
    cancel_url: appUrl('/billing'),
  })
  return res.status(200).json({ url: session.url })
}
