// Stripe billing. Stripe is the source of truth; profiles mirror what we need
// to decide access (plan, trial end, extra language slots).
//
// Prices are found by lookup key, created by `npm run stripe:setup`:
//   gmd_standard_monthly  $4.99/month
//   gmd_premium_monthly   $9.99/month
//   gmd_language_slot     $4.99 one-time (adds one language to the list)

import Stripe from 'stripe'
import { adminDb } from './store.mjs'

export const LOOKUP = {
  standard: 'gmd_standard_monthly',
  premium: 'gmd_premium_monthly',
  languageSlot: 'gmd_language_slot',
}
export const TRIAL_DAYS = 7

let client
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY)
  return client
}

let pricesCache
// { standard: Price, premium: Price, languageSlot: Price }
export async function getPrices() {
  if (pricesCache) return pricesCache
  const { data } = await stripe().prices.list({ lookup_keys: Object.values(LOOKUP), active: true, limit: 10 })
  const byKey = Object.fromEntries(data.map(p => [p.lookup_key, p]))
  const prices = Object.fromEntries(Object.entries(LOOKUP).map(([name, key]) => [name, byKey[key]]))
  const missing = Object.entries(prices).filter(([, p]) => !p).map(([name]) => name)
  if (missing.length) throw new Error(`Stripe prices missing (${missing.join(', ')}). Run npm run stripe:setup.`)
  pricesCache = prices
  return prices
}

// The reader's Stripe customer, created on first use.
export async function ensureCustomer(profile) {
  if (profile.stripe_customer_id) return profile.stripe_customer_id
  const customer = await stripe().customers.create({ email: profile.email, metadata: { user_id: profile.id } })
  const { error } = await adminDb().from('profiles').update({ stripe_customer_id: customer.id }).eq('id', profile.id)
  if (error) throw new Error(error.message)
  return customer.id
}

const ENDED = new Set(['canceled', 'incomplete_expired', 'unpaid', 'paused'])

// Mirrors a Stripe subscription onto the reader's profile.
export async function syncSubscription(subscription) {
  const prices = await getPrices()
  const item = subscription.items.data[0]
  const subscribedPlan = item?.price?.id === prices.premium.id ? 'premium' : item?.price?.id === prices.standard.id ? 'standard' : null
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  let plan
  if (subscription.status === 'trialing') plan = 'trial'
  else if (ENDED.has(subscription.status) || subscription.status === 'incomplete') plan = 'inactive'
  else plan = subscribedPlan ?? 'inactive' // active, past_due (Stripe is retrying the card)

  const update = {
    plan,
    subscribed_plan: subscribedPlan,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  }
  if (subscription.trial_end) update.trial_used = true

  const { error } = await adminDb().from('profiles').update(update).eq('stripe_customer_id', customerId)
  if (error) throw new Error(error.message)
  return update
}

// Records a completed checkout: a subscription (synced) or a language slot (counted once).
export async function handleCheckoutSession(session) {
  if (session.mode === 'subscription' && session.subscription) {
    const id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
    return syncSubscription(await stripe().subscriptions.retrieve(id))
  }
  if (session.mode === 'payment' && session.metadata?.purchase === 'language_slot' && session.payment_status === 'paid') {
    const { data, error } = await adminDb().rpc('record_language_slot_purchase', {
      p_session: session.id,
      p_user: session.metadata.user_id,
      p_amount: session.amount_total,
      p_currency: session.currency,
    })
    if (error) throw new Error(error.message)
    return { languageSlotAdded: data }
  }
  return null
}

// Customer portal (change plan, card, cancel). Created once and reused.
export async function portalConfigurationId() {
  const { data } = await stripe().billingPortal.configurations.list({ limit: 20 })
  const existing = data.find(c => c.metadata?.app === 'good-morning-digest' && c.active)
  if (existing) return existing.id
  const prices = await getPrices()
  const config = await stripe().billingPortal.configurations.create({
    metadata: { app: 'good-morning-digest' },
    business_profile: { headline: 'Good Morning Digest: manage your plan' },
    features: {
      customer_update: { enabled: false },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end' },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        proration_behavior: 'create_prorations',
        products: [
          { product: prices.standard.product, prices: [prices.standard.id] },
          { product: prices.premium.product, prices: [prices.premium.id] },
        ],
      },
    },
  })
  return config.id
}

// Re-reads the customer's latest subscription from Stripe (used when the reader
// comes back from Checkout or the portal, so it works without webhooks too).
export async function syncCustomer(customerId) {
  const { data } = await stripe().subscriptions.list({ customer: customerId, status: 'all', limit: 1 })
  return data[0] ? syncSubscription(data[0]) : null
}
