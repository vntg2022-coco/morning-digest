// Opens the Stripe customer portal (switch plan, update card, cancel, invoices).
import { portalConfigurationId, stripe } from '../../../lib/billing.mjs'
import { appUrl } from '../../../lib/email/links.mjs'
import { adminDb } from '../../../lib/store.mjs'
import { createSupabaseServer } from '../../../lib/supabase/server'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { data: { user } } = await createSupabaseServer(req, res).auth.getUser()
  if (!user) return res.status(401).json({ error: 'Please log in again.' })

  const { data: profile } = await adminDb().from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return res.status(400).json({ error: 'You don’t have a plan yet.' })

  const session = await stripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    configuration: await portalConfigurationId(),
    return_url: appUrl('/billing?from=portal'),
  })
  return res.status(200).json({ url: session.url })
}
