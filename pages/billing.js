// Plan & billing: start the 7-day trial (Standard or Premium), manage the plan
// in Stripe's portal, buy extra languages.

import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import { handleCheckoutSession, stripe, syncCustomer } from '../lib/billing.mjs'
import { ADD_ON_PRICE, PLANS, currentPlan, listCapacity } from '../lib/plans.mjs'
import { loadReader } from '../lib/reader-context'
import { adminDb } from '../lib/store.mjs'

const LIVE = ['trialing', 'active', 'past_due']

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  let { profile } = reader

  // Back from Stripe Checkout: record what was bought, then drop the query.
  if (ctx.query.session_id && profile.stripe_customer_id) {
    const session = await stripe().checkout.sessions.retrieve(String(ctx.query.session_id))
    if (session.customer === profile.stripe_customer_id && session.status === 'complete') await handleCheckoutSession(session)
    const done = session.mode === 'payment' ? 'language' : 'plan'
    return { redirect: { destination: `/billing?done=${done}`, permanent: false } }
  }
  // Pick up changes made in the Stripe portal (or anywhere else) on every visit.
  if (profile.stripe_customer_id) {
    await syncCustomer(profile.stripe_customer_id)
    const { data } = await adminDb().from('profiles').select('*').eq('id', profile.id).single()
    profile = data
  }

  return {
    props: {
      done: ctx.query.done ?? null,
      plan: currentPlan(profile),
      status: profile.subscription_status ?? null,
      subscribedPlan: profile.subscribed_plan ?? null,
      trialUsed: profile.trial_used,
      trialEndsAt: profile.trial_ends_at,
      periodEnd: profile.current_period_end,
      cancelAtPeriodEnd: profile.cancel_at_period_end,
      capacity: listCapacity(profile, reader.languages),
      extraSlots: profile.extra_language_slots,
    },
  }
}

const day = d => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const OFFERS = [
  { key: 'standard', price: '$4.99', points: ['1 story a day (you choose 1 of 3)', '1 learning language; switch anytime', 'Side-by-side translation and tap-to-define'] },
  { key: 'premium', price: '$9.99', points: ['All 3 stories every day', '2 learning languages, both delivered', 'Personal vocab list and full archive'] },
]

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
  return data
}

export default function Billing(props) {
  const { done, plan, status, subscribedPlan, trialUsed, trialEndsAt, periodEnd, cancelAtPeriodEnd, capacity, extraSlots } = props
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const live = LIVE.includes(status)

  async function go(key, url, body) {
    setError('')
    setBusy(key)
    try {
      const { url: next } = await post(url, body)
      window.location.href = next
    } catch (err) {
      setError(err.message)
      setBusy(null)
    }
  }

  return (
    <AppLayout title="Plan">
      <h1>Your plan</h1>
      {done === 'plan' && <p className="msg ok">You’re all set. Thanks for subscribing!</p>}
      {done === 'language' && <p className="msg ok">Thanks! You can now add one more language in Settings.</p>}
      {error && <p className="msg error">{error}</p>}

      <section className="current">
        <div className="label">Current plan</div>
        <div className="name">{live && subscribedPlan ? PLANS[subscribedPlan].label : PLANS[plan].label}</div>
        {status === 'trialing' && trialEndsAt && (
          <p>
            Free trial until {day(trialEndsAt)}. Your {PLANS[subscribedPlan].label} plan starts then
            {cancelAtPeriodEnd ? ' — but you’ve cancelled, so you won’t be charged.' : '.'}
          </p>
        )}
        {status === 'active' && periodEnd && (
          <p>{cancelAtPeriodEnd ? `Cancelled. You keep access until ${day(periodEnd)}.` : `Renews on ${day(periodEnd)}.`}</p>
        )}
        {status === 'past_due' && <p className="warn">Your last payment didn’t go through. Update your card to keep reading.</p>}
        {plan === 'preview' && <p>You’re on your free preview day. Start a 7-day free trial to keep reading.</p>}
        {!live && plan === 'inactive' && <p className="warn">Your access has ended. Choose a plan to keep reading.</p>}
        <p className="small">
          Your language list holds {capacity} language{capacity === 1 ? '' : 's'}
          {extraSlots ? ` (including ${extraSlots} extra)` : ''}.
        </p>
        {live && (
          <div className="actions">
            <button type="button" className="btn" disabled={busy} onClick={() => go('portal', '/api/billing/portal')}>
              {busy === 'portal' ? 'Opening…' : 'Manage plan'}
            </button>
            <button type="button" className="btn ghost" disabled={busy} onClick={() => go('slot', '/api/billing/checkout', { purchase: 'language_slot' })}>
              {busy === 'slot' ? 'Opening…' : `Add a language — ${ADD_ON_PRICE} once`}
            </button>
          </div>
        )}
        {live && <p className="small">Switch between Standard and Premium, update your card or cancel in “Manage plan”.</p>}
      </section>

      {!live && (
        <section>
          <h2>{trialUsed ? 'Choose a plan' : 'Start your 7-day free trial'}</h2>
          {!trialUsed && (
            <p className="sub">
              Every Premium feature for 7 days. You won’t be charged until the trial ends, and you can cancel anytime before then.
            </p>
          )}
          <div className="offers">
            {OFFERS.map(o => (
              <div key={o.key} className={`offer ${o.key === 'premium' ? 'featured' : ''}`}>
                <div className="offer-name">{PLANS[o.key].label}</div>
                <div className="price">
                  {o.price}
                  <span> / month{trialUsed ? '' : ' after the trial'}</span>
                </div>
                <ul>
                  {o.points.map(p => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <button type="button" className={`btn ${o.key === 'premium' ? 'light' : ''}`} disabled={busy} onClick={() => go(o.key, '/api/billing/checkout', { plan: o.key })}>
                  {busy === o.key ? 'Opening…' : trialUsed ? `Choose ${PLANS[o.key].label}` : 'Start free trial'}
                </button>
              </div>
            ))}
          </div>
          <p className="small">Payments are processed securely by Stripe. Extra languages are {ADD_ON_PRICE} each, one time.</p>
        </section>
      )}

      <style jsx>{`
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 40px;
          margin: 0 0 16px;
        }
        h2 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 28px;
          margin: 36px 0 8px;
        }
        .current {
          border-top: 1px solid #121212;
          padding-top: 12px;
        }
        .label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #5a5a5a;
        }
        .name {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 30px;
          margin: 4px 0 6px;
        }
        .warn {
          color: #b3261e;
        }
        .small,
        .sub {
          color: #5a5a5a;
          font-size: 14px;
        }
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 16px 0 6px;
        }
        .btn {
          background: #000;
          color: #fff;
          border: 1px solid #000;
          border-radius: 3px;
          padding: 12px 20px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .btn.ghost {
          background: #fff;
          color: #121212;
        }
        .btn.light {
          background: #fff;
          color: #121212;
          border-color: #fff;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .offers {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 18px;
        }
        .offer {
          border: 1px solid #dfdfdf;
          border-radius: 4px;
          padding: 22px;
        }
        .offer.featured {
          background: #121212;
          color: #fff;
          border-color: #121212;
        }
        .offer-name {
          font-weight: 700;
          font-size: 14px;
        }
        .price {
          font-size: 32px;
          font-weight: 800;
          margin: 6px 0 12px;
        }
        .price span {
          font-size: 13px;
          font-weight: 400;
          opacity: 0.75;
        }
        .offer ul {
          padding-left: 18px;
          line-height: 1.9;
          font-size: 14px;
          margin: 0 0 18px;
        }
        .msg {
          padding: 10px 14px;
          border-radius: 3px;
          font-size: 14px;
        }
        .msg.ok {
          background: #edf6ee;
        }
        .msg.error {
          background: #fdecea;
          color: #b3261e;
        }
        @media (max-width: 700px) {
          .offers {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  )
}
