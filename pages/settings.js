import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '../components/AppLayout'
import { LANGUAGES, LANGUAGE_BY_CODE } from '../lib/languages.mjs'
import { PLANS, languageLimit } from '../lib/plans.mjs'
import { loadReader } from '../lib/reader-context'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const TIMES = Array.from({ length: 11 }, (_, i) => {
  const h = 5 + Math.floor(i / 2)
  const m = i % 2 ? '30' : '00'
  return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${h}:${m} AM` }
})

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  const { user, profile, plan, languages } = reader
  return {
    props: {
      email: user.email,
      plan,
      trialEndsAt: profile.trial_ends_at,
      nativeLang: profile.native_lang,
      timezone: profile.timezone,
      deliveryTime: profile.delivery_time.slice(0, 5),
      languages,
      limit: languageLimit(profile, languages),
    },
  }
}

async function call(method, body) {
  const res = await fetch('/api/settings', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  return res.ok ? null : data.error ?? 'Something went wrong.'
}

export default function Settings(props) {
  const router = useRouter()
  const { email, plan, trialEndsAt, languages, limit } = props
  const [nativeLang, setNativeLang] = useState(props.nativeLang)
  const [timezone, setTimezone] = useState(props.timezone)
  const [deliveryTime, setDeliveryTime] = useState(props.deliveryTime)
  const [zones, setZones] = useState([props.timezone])
  const [newLang, setNewLang] = useState('')
  const [newLevel, setNewLevel] = useState('intermediate')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
    setZones(all.includes(props.timezone) ? all : [props.timezone, ...all])
  }, [props.timezone])

  async function run(method, body, okText) {
    setMessage(null)
    const error = await call(method, body)
    setMessage(error ? { error } : { ok: okText })
    if (!error) router.replace(router.asPath, undefined, { scroll: false })
  }

  const available = LANGUAGES.filter(l => l.code !== nativeLang && !languages.some(x => x.lang === l.code))
  const atLimit = languages.length >= limit

  return (
    <AppLayout title="Settings">
      <h1>Settings</h1>
      {message && <p className={message.error ? 'msg error' : 'msg ok'}>{message.error ?? message.ok}</p>}

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
        <button type="button" className="btn" onClick={() => run('PATCH', { nativeLang, timezone, deliveryTime }, 'Delivery settings saved.')}>
          Save
        </button>
      </section>

      <section>
        <h2>Learning languages</h2>
        <p className="sub">
          {languages.length} of {limit} on your plan. Languages stay on your account once added; you can change their level anytime.
        </p>
        <ul className="langs">
          {languages.map(l => (
            <li key={l.lang}>
              <span className="name">{LANGUAGE_BY_CODE[l.lang].name}</span>
              <select value={l.level} onChange={e => run('PUT', { lang: l.lang, level: e.target.value }, 'Level updated.')}>
                {LEVELS.map(v => (
                  <option key={v} value={v}>
                    {v[0].toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
              {l.purchased && <span className="tag">Add-on</span>}
              {l.paused && <span className="tag">Paused on your plan</span>}
            </li>
          ))}
        </ul>
        {atLimit ? (
          <p className="sub">
            Want another language? Add one for a one-time $4.99, or upgrade to Premium for up to 3 (coming soon).
          </p>
        ) : (
          <div className="add">
            <select value={newLang} onChange={e => setNewLang(e.target.value)} aria-label="Language to add">
              <option value="">Add a language…</option>
              {available.map(l => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <select value={newLevel} onChange={e => setNewLevel(e.target.value)} aria-label="Level">
              {LEVELS.map(v => (
                <option key={v} value={v}>
                  {v[0].toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              disabled={!newLang}
              onClick={() => {
                const name = LANGUAGE_BY_CODE[newLang].name
                if (!window.confirm(`Add ${name}? Learning languages can't be removed later.`)) return
                run('POST', { lang: newLang, level: newLevel }, `${name} added. Its stories start with the next morning edition.`).then(() => setNewLang(''))
              }}
            >
              Add
            </button>
          </div>
        )}
      </section>

      <section id="plan">
        <h2>Plan</h2>
        <p>
          <b>{PLANS[plan].label}</b>
          {plan === 'trial' && ` — Premium features until ${new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
        </p>
        <p className="sub">Standard $4.99/month · Premium $9.99/month. Payments are coming soon.</p>
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
        .btn:disabled {
          background: #8a8a8a;
          cursor: default;
        }
        .sub {
          color: #5a5a5a;
          font-size: 14px;
        }
        .langs {
          list-style: none;
          padding: 0;
          margin: 0 0 16px;
        }
        .langs li {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .name {
          min-width: 140px;
          font-weight: 600;
        }
        .tag {
          font-size: 12px;
          color: #5a5a5a;
          border: 1px solid #dfdfdf;
          border-radius: 3px;
          padding: 2px 8px;
        }
        .add {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .add .btn {
          margin-top: 0;
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
