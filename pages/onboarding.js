import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AuthLayout from '../components/AuthLayout'
import { LANGUAGES } from '../lib/languages.mjs'
import { requireUser } from '../lib/supabase/server'

const LEVELS = [
  { key: 'beginner', label: 'Beginner', hint: 'Short, simple sentences' },
  { key: 'intermediate', label: 'Intermediate', hint: 'Everyday news language' },
  { key: 'advanced', label: 'Advanced', hint: 'Natural newspaper style' },
]

// 5:00 AM to 10:00 AM in half-hour steps.
const TIMES = Array.from({ length: 11 }, (_, i) => {
  const h = 5 + Math.floor(i / 2)
  const m = i % 2 ? '30' : '00'
  return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${h}:${m} AM` }
})

export async function getServerSideProps(ctx) {
  const auth = await requireUser(ctx)
  if (auth.redirect) return auth
  if (auth.profile?.onboarded_at) return { redirect: { destination: '/dashboard', permanent: false } }
  return { props: {} }
}

export default function Onboarding() {
  const router = useRouter()
  const [nativeLang, setNativeLang] = useState('en')
  const [learningLang, setLearningLang] = useState('es')
  const [level, setLevel] = useState('intermediate')
  const [deliveryTime, setDeliveryTime] = useState('06:00')
  const [timezone, setTimezone] = useState('America/New_York')
  const [zones, setZones] = useState(['America/New_York'])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [detected]
    setZones(all.includes(detected) ? all : [detected, ...all])
    if (detected) setTimezone(detected)
  }, [])

  function changeNative(code) {
    setNativeLang(code)
    if (code === learningLang) setLearningLang(LANGUAGES.find(l => l.code !== code).code)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nativeLang, learningLang, level, timezone, deliveryTime }),
    })
    const body = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) return setError(body.error ?? 'Something went wrong. Please try again.')
    router.push('/dashboard')
  }

  return (
    <AuthLayout title="Set up your mornings" subtitle="You can change all of this later in Settings." wide>
      <form onSubmit={handleSubmit}>
        <label htmlFor="native">Your native language</label>
        <select id="native" value={nativeLang} onChange={e => changeNative(e.target.value)}>
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>
              {l.name} — {l.native}
            </option>
          ))}
        </select>

        <label htmlFor="learning">Language you want to learn</label>
        <select id="learning" value={learningLang} onChange={e => setLearningLang(e.target.value)}>
          {LANGUAGES.filter(l => l.code !== nativeLang).map(l => (
            <option key={l.code} value={l.code}>
              {l.name} — {l.native}
            </option>
          ))}
        </select>

        <label id="level-label">Your level</label>
        <div className="levels" role="radiogroup" aria-labelledby="level-label">
          {LEVELS.map(l => (
            <button
              key={l.key}
              type="button"
              role="radio"
              aria-checked={level === l.key}
              className={level === l.key ? 'on' : ''}
              onClick={() => setLevel(l.key)}
            >
              <b>{l.label}</b>
              <span>{l.hint}</span>
            </button>
          ))}
        </div>

        <div className="row">
          <div>
            <label htmlFor="time">Delivery time</label>
            <select id="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}>
              {TIMES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tz">Time zone</label>
            <select id="tz" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {zones.map(z => (
                <option key={z} value={z}>
                  {z.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Start my mornings'}
        </button>
      </form>
      <style jsx>{`
        .levels {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .levels button {
          text-align: left;
          background: #fff;
          border: 1px solid #b8b8b8;
          border-radius: 3px;
          padding: 12px;
          font: inherit;
          color: #121212;
          cursor: pointer;
        }
        .levels button.on {
          border: 2px solid #121212;
          padding: 11px;
        }
        .levels b {
          display: block;
          font-size: 15px;
        }
        .levels span {
          font-size: 12px;
          color: #5a5a5a;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 560px) {
          .levels,
          .row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AuthLayout>
  )
}
