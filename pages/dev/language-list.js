// Development-only playground for components/LanguageList.js with sample data
// (no account needed). Returns 404 in production builds.

import { useState } from 'react'
import LanguageList from '../../components/LanguageList'

export function getServerSideProps() {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

// Two plan languages plus one purchased add-on.
const SAMPLE = [
  { lang: 'es', level: 'intermediate', purchased: false },
  { lang: 'en', level: 'advanced', purchased: false },
  { lang: 'fr', level: 'beginner', purchased: true },
]
const PLANS = { standard: { label: 'Standard', base: 1, all: false }, premium: { label: 'Premium', base: 2, all: true } }

export default function LanguageListPlayground() {
  const [languages, setLanguages] = useState(SAMPLE)
  const [plan, setPlan] = useState('standard')
  const capacity = PLANS[plan].base + languages.filter(l => l.purchased).length
  const [log, setLog] = useState([])
  const note = text => setLog(l => [text, ...l].slice(0, 6))

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px', fontFamily: 'var(--font-sans), sans-serif' }}>
      <p>
        Plan:{' '}
        {Object.entries(PLANS).map(([key, p]) => (
          <button key={key} type="button" onClick={() => setPlan(key)} style={{ fontWeight: plan === key ? 700 : 400, marginRight: 8 }}>
            {p.label}
          </button>
        ))}
      </p>
      <LanguageList
        languages={languages}
        capacity={capacity}
        delivered={PLANS[plan].all ? capacity : 1}
        addOnPrice="$4.99"
        nativeLang="ja"
        onReorder={order => {
          setLanguages(order.map(lang => languages.find(l => l.lang === lang)))
          note(`reorder → ${order.join(', ')}`)
        }}
        onLevel={(lang, level) => {
          setLanguages(ls => ls.map(l => (l.lang === lang ? { ...l, level } : l)))
          note(`level ${lang} → ${level}`)
        }}
        onAdd={(lang, level) => {
          setLanguages(ls => [...ls, { lang, level, purchased: false }])
          note(`add ${lang} (${level})`)
        }}
      />
      <pre id="log" style={{ fontSize: 12, marginTop: 16 }}>{log.join('\n')}</pre>
    </main>
  )
}
