// Development-only playground for components/LanguageList.js with sample data
// (no account needed). Returns 404 in production builds.

import { useState } from 'react'
import LanguageList from '../../components/LanguageList'

export function getServerSideProps() {
  if (process.env.NODE_ENV === 'production') return { notFound: true }
  return { props: {} }
}

const SAMPLE = [
  { lang: 'es', level: 'intermediate', purchased: false },
  { lang: 'en', level: 'advanced', purchased: false },
  { lang: 'fr', level: 'beginner', purchased: false },
  { lang: 'de', level: 'beginner', purchased: false },
]

export default function LanguageListPlayground() {
  const [languages, setLanguages] = useState(SAMPLE)
  const [slots, setSlots] = useState(3)
  const [cooldown, setCooldown] = useState(false)
  const [log, setLog] = useState([])
  const note = text => setLog(l => [text, ...l].slice(0, 6))

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px', fontFamily: 'var(--font-sans), sans-serif' }}>
      <p>
        Slots:{' '}
        {[1, 3].map(n => (
          <button key={n} type="button" onClick={() => setSlots(n)} style={{ fontWeight: slots === n ? 700 : 400, marginRight: 8 }}>
            {n === 1 ? 'Standard (1)' : 'Premium (3)'}
          </button>
        ))}
        <label style={{ marginLeft: 12 }}>
          <input type="checkbox" checked={cooldown} onChange={e => setCooldown(e.target.checked)} /> swap cooldown active
        </label>
      </p>
      <LanguageList
        languages={languages}
        slots={slots}
        nativeLang="ja"
        nextSwap={cooldown ? new Date(Date.now() + 20 * 864e5).toISOString() : null}
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
