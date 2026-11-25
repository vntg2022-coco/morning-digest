// Creates the Stripe products and prices the app needs, if they don't exist yet.
// Safe to run again. Uses whichever mode STRIPE_SECRET_KEY is in (test or live).
// Usage: npm run stripe:setup

import { LOOKUP, stripe } from '../lib/billing.mjs'

const WANTED = [
  { lookup: LOOKUP.standard, product: 'Good Morning Digest Standard', amount: 499, recurring: { interval: 'month' } },
  { lookup: LOOKUP.premium, product: 'Good Morning Digest Premium', amount: 999, recurring: { interval: 'month' } },
  { lookup: LOOKUP.languageSlot, product: 'Extra learning language', amount: 499 },
]

const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'test'
console.log(`Stripe mode: ${mode}`)

const { data: existing } = await stripe().prices.list({ lookup_keys: WANTED.map(w => w.lookup), limit: 10 })
for (const w of WANTED) {
  const found = existing.find(p => p.lookup_key === w.lookup)
  if (found) {
    console.log(`ok      ${w.lookup}  ${found.id}`)
    continue
  }
  const product = await stripe().products.create({ name: w.product })
  const price = await stripe().prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: w.amount,
    lookup_key: w.lookup,
    ...(w.recurring ? { recurring: w.recurring } : {}),
  })
  console.log(`created ${w.lookup}  ${price.id}`)
}
