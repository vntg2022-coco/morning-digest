import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '../components/AppLayout'
import LanguageList from '../components/LanguageList'
import { LANGUAGES } from '../lib/languages.mjs'
import { ADD_ON_PRICE, PLANS, deliveredCount, listCapacity } from '../lib/plans.mjs'
import { loadReader } from '../lib/reader-context'

const TIMES = Array.from({ length: 11 }, (_, i) => {
  const h = 5 + Math.floor(i / 2)
  const m = i % 2 ? '30' : '00'
  return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${h}:${m} AM` }
})

const fmt = d => new Date(d).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  const { user, profile, plan, languages } = reader
  return {
    props: {
      email: user.email,
      plan,
      trialEndsAt: profile.trial_ends_at,
      previewEndsAt: profile.preview_ends_at,
      nativeLang: profile.native_lang,
      timezone: profile.timezone,
      deliveryTime: profile.delivery_time.slice(0, 5),
      languages,
      capacity: listCapacity(profile, languages),
      delivered: deliveredCount(profile, languages),
    },
  }
}

export default function Settings(props) {
  const router = useRouter()
  const { email, plan, trialEndsAt, previewEndsAt, languages, capacity, delivered } = props
  const [nativeLang, setNativeLang] = useState(props.nativeLang)
  const [timezone, setTimezone] = useState(props.timezone)
  const [deliveryTime, setDeliveryTime] = useState(props.deliveryTime)
  const [zones, setZones] = useState([props.timezone])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
    setZones(all.includes(props.timezone) ? all : [props.timezone, ...all])
  }, [props.timezone])

  async function send(method, body, fallbackOk) {
    setMessage(null)
    const res = await fetch('/api/settings', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json().catch(() => ({}))
    setMessage(res.ok ? { ok: data.message ?? fallbackOk } : { error: data.error ?? 'Something went wrong.' })
    if (res.ok) router.replace(router.asPath, undefined, { scroll: false })
  }

  return (
    <AppLayout title="Settings">
      <h1>Settings</h1>
      {message && (
        <p className={message.error ? 'msg error' : 'msg ok'} role="status">
          {message.error ?? message.ok}
        </p>
      )}

      <section>
        <h2>Delivery</h2>
        <div className="grid">
          <label>
            Native language
            <select value={nativeLang} onChange={e => setNativeLang(e.target.value)}>
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.name} — {l.native}
                </option>
              ))}
            </select>
          </label>
          <label>
            Delivery time
            <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}>
              {TIMES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Time zone
            <select value={timezone} onChange={e => setTimezone(e.target.value)}>
              {zones.map(z => (
                <option key={z} value={z}>
                  {z.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn" onClick={() => send('PATCH', { nativeLang, timezone, deliveryTime }, 'Delivery settings saved.')}>
          Save
        </button>
      </section>

      <section>
        <h2>Learning languages</h2>
        <LanguageList
          languages={languages}
          capacity={capacity}
          delivered={delivered}
          addOnPrice={ADD_ON_PRICE}
          nativeLang={props.nativeLang}
          onReorder={order => send('POST', { action: 'reorder', order })}
          onLevel={(lang, level) => send('POST', { action: 'level', lang, level })}
          onAdd={(lang, level) => send('POST', { action: 'add', lang, level })}
        />
      </section>

      <section id="plan">
        <h2>Plan</h2>
        <p>
          <b>{PLANS[plan].label}</b>
          {plan === 'preview' && previewEndsAt && ` — Premium features until ${fmt(previewEndsAt)}`}
          {plan === 'trial' && trialEndsAt && ` — Premium features until ${fmt(trialEndsAt)}`}
        </p>
        <p className="sub">
          Start your 7-day free trial to keep reading after your preview day. Then Standard $4.99/month or Premium $9.99/month. Payments
          are coming soon.
        </p>
        <p className="sub">Signed in as {email}</p>
      </section>

      <style jsx>{`
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 40px;
          margin: 0 0 12px;
        }
        h2 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-top: 1px solid #121212;
          padding-top: 10px;
          margin: 0 0 14px;
        }
        section {
          margin-top: 32px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
        }
        select {
          font: inherit;
          font-weight: 400;
          font-size: 15px;
          padding: 10px 12px;
          border: 1px solid #b8b8b8;
          border-radius: 3px;
          background: #fff;
          color: #121212;
        }
        .btn {
          margin-top: 16px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 3px;
          padding: 11px 20px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .sub {
          color: #5a5a5a;
          font-size: 14px;
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
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  )
}
