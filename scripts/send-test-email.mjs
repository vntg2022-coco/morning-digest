// Sends the morning email to one reader right now, ignoring their delivery
// time and whether they were already emailed today. For testing.
// Usage: npm run email:test -- you@example.com
// May build the reader's editions first (Claude costs, printed by the pipeline logs).

import { deliverMorning } from '../lib/delivery.mjs'
import { adminDb } from '../lib/store.mjs'

const email = process.argv[2]
if (!email) throw new Error('Usage: npm run email:test -- you@example.com')

const { data: profile, error } = await adminDb().from('profiles').select('id').eq('email', email).single()
if (error || !profile) throw new Error(`No reader with email ${email}`)

const result = await deliverMorning({ userId: profile.id, force: true })
console.log(JSON.stringify(result, null, 2))
