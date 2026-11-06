// News box: today's 3 stories for the selected learning language.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AppLayout from '../components/AppLayout'
import LanguageTabs from '../components/LanguageTabs'
import { storyAccess } from '../lib/access.mjs'
import { LANGUAGE_BY_CODE } from '../lib/languages.mjs'
import { PLANS } from '../lib/plans.mjs'
import { loadReader } from '../lib/reader-context'
import { todayUtc } from '../lib/pipeline/daily.mjs'
import { getPicks, latestEdition } from '../lib/store.mjs'

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  const { profile, plan, languages, selected } = reader

  const edition = selected && !selected.paused
    ? await latestEdition({ lang: selected.lang, level: selected.level, native: profile.native_lang })
    : null
  const picks = selected && edition ? await getPicks(reader.user.id, selected.lang) : {}
  // Build on the spot when this reader's combination has no stories yet, or a
  // preview reader signed up after the morning run.
  const preparing =
    Boolean(selected) && !selected.paused && plan !== 'inactive' && (!edition || (plan === 'preview' && edition.date !== todayUtc()))

  return {
    props: {
      plan,
      savedPlan: profile.plan,
      preparing,
      trialEndsAt: profile.trial_ends_at,
      previewEndsAt: profile.preview_ends_at,
      deliveryTime: profile.delivery_time,
      nativeLang: profile.native_lang,
      languages,
      selected,
      date: edition?.date ?? null,
      stories: (edition?.articles ?? []).map(a => ({
        id: a.id,
        position: a.position,
        topic: a.topic,
        source: a.source,
        headline: a.headline.text,
        headlineTranslation: a.translation.headline,
        firstSentence: a.sentences[0]?.text ?? '',
        access: storyAccess(plan, a.storyId, edition && picks[edition.date]),
      })),
    },
  }
}

function formatDate(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

// Starts building today's stories and refreshes the page when they're ready.
function Preparing() {
  const router = useRouter()
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    let stop = false
    const started = Date.now()
    fetch('/api/prepare', { method: 'POST' })
    const poll = async () => {
      if (stop) return
      const res = await fetch('/api/prepare').then(r => r.json()).catch(() => ({}))
      if (res.ready) return router.replace(router.asPath)
      if (Date.now() - started > 4 * 60e3) setSlow(true)
      setTimeout(poll, 5000)
    }
    const t = setTimeout(poll, 5000)
    return () => {
      stop = true
      clearTimeout(t)
    }
  }, [router])
  return (
    <div className="preparing" role="status">
      <h1>Writing your stories…</h1>
      <p>We&apos;re retelling today&apos;s news in your language and level. This takes 1–3 minutes; the page updates by itself.</p>
      {slow && <p>Still working. If this takes much longer, refresh the page.</p>}
      <style jsx>{`
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 36px;
          margin: 0 0 10px;
        }
        p {
          color: #5a5a5a;
          font-size: 17px;
        }
      `}</style>
    </div>
  )
}

const when = d => new Date(d).toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })

export default function NewsBox({ plan, savedPlan, preparing, trialEndsAt, previewEndsAt, deliveryTime, nativeLang, languages, selected, date, stories }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(null)
  const [error, setError] = useState('')
  const lang = selected && LANGUAGE_BY_CODE[selected.lang]

  async function pick(story) {
    setError('')
    const res = await fetch('/api/pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: story.id }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return setError(body.error ?? 'Could not save your choice.')
    router.push(`/read/${story.id}`)
  }

  return (
    <AppLayout title="Today">
      <LanguageTabs languages={languages} selected={selected?.lang} basePath="/dashboard" />

      {plan === 'preview' && previewEndsAt && (
        <p className="banner">
          Free preview: every Premium feature until {when(previewEndsAt)}.{' '}
          <Link href="/billing" legacyBehavior>
            <a>Start your 7-day free trial</a>
          </Link>{' '}
          to keep reading after that.
        </p>
      )}
      {plan === 'trial' && trialEndsAt && (
        <p className="banner">Free trial: you have Premium until {when(trialEndsAt)}.</p>
      )}
      {plan === 'inactive' && (
        <p className="banner warn">
          {savedPlan === 'preview' ? 'Your free preview day has ended.' : 'Your access has ended.'}{' '}
          <Link href="/billing" legacyBehavior>
            <a>{savedPlan === 'preview' ? 'Start your 7-day free trial' : 'Choose a plan'}</a>
          </Link>{' '}
          to keep reading.
        </p>
      )}

      {selected?.paused ? (
        <div className="empty">
          <h1>No new {lang.name} stories right now</h1>
          <p>
            Your plan delivers the language at the top of your list. To read {lang.name}, drag it to the top in Settings; you can switch as
            often as you like. Your {lang.name} archive and vocab list are still here.
          </p>
        </div>
      ) : preparing ? (
        <Preparing />
      ) : !date ? (
        <div className="empty">
          <h1>Your first stories are on their way</h1>
          <p>They arrive every morning at {formatTime(deliveryTime)}. We&apos;ll email you when they&apos;re here.</p>
        </div>
      ) : (
        <>
          <p className="kicker">
            {formatDate(date)} · {lang.name} · {selected.level}
          </p>
          <h1>Today&apos;s stories</h1>
          {PLANS[plan].articlesPerDay === 1 && stories.some(s => s.access === 'choose') && (
            <p className="hint">Your Standard plan includes one story a day. Choose the one you want to read.</p>
          )}
          {error && <p className="error">{error}</p>}

          <ol className="stories">
            {stories.map(s => {
              const body = (
                <>
                  <span className="topic">
                    {s.position} · {s.topic} · {s.source}
                  </span>
                  <span className="headline" dir={lang.rtl ? 'rtl' : 'ltr'} lang={selected.lang}>
                    {s.headline}
                  </span>
                  <span className="translation" dir={LANGUAGE_BY_CODE[nativeLang].rtl ? 'rtl' : 'ltr'} lang={nativeLang}>
                    {s.headlineTranslation}
                  </span>
                  <span className="lede" dir={lang.rtl ? 'rtl' : 'ltr'} lang={selected.lang}>
                    {s.firstSentence}
                  </span>
                  {s.access === 'locked' && <span className="lock">Locked · Premium readers get all 3 stories</span>}
                </>
              )
              return (
                <li key={s.id} className={s.access}>
                  {s.access === 'open' && (
                    <Link href={`/read/${s.id}`} legacyBehavior>
                      <a className="card">{body}</a>
                    </Link>
                  )}
                  {s.access === 'choose' && (
                    <button type="button" className="card" onClick={() => setConfirming(s)}>
                      {body}
                    </button>
                  )}
                  {s.access === 'locked' && <div className="card">{body}</div>}
                </li>
              )
            })}
          </ol>
        </>
      )}

      {confirming && (
        <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="pick-title">
          <div className="box">
            <h2 id="pick-title">Read this story today?</h2>
            <p>You can open one story a day on the Standard plan. The other two will stay locked.</p>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => setConfirming(null)}>
                Go back
              </button>
              <button type="button" className="primary" onClick={() => pick(confirming)}>
                Read this one
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .banner {
          background: #f0eee9;
          padding: 10px 14px;
          font-size: 14px;
          border-radius: 3px;
          margin: 0 0 24px;
        }
        .banner a {
          color: #326891;
          font-weight: 600;
        }
        .banner.warn {
          background: #fdecea;
        }
        .kicker {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 6px;
        }
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 40px;
          margin: 0 0 18px;
        }
        .hint {
          color: #5a5a5a;
          margin: -6px 0 18px;
        }
        .error {
          color: #b3261e;
        }
        .empty p {
          color: #5a5a5a;
          font-size: 17px;
        }
        .stories {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid #121212;
        }
        .stories li {
          border-bottom: 1px solid #dfdfdf;
        }
        .card {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 22px 0;
          font: inherit;
          color: inherit;
          text-decoration: none;
          cursor: pointer;
        }
        .locked .card {
          cursor: default;
          opacity: 0.45;
        }
        .topic {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #5a5a5a;
          margin-bottom: 8px;
        }
        .headline {
          display: block;
          font-family: var(--font-serif), Georgia, serif;
          font-size: 26px;
          line-height: 1.25;
          margin-bottom: 6px;
        }
        .open .card:hover .headline,
        .choose .card:hover .headline {
          text-decoration: underline;
        }
        .translation {
          display: block;
          font-size: 15px;
          color: #5a5a5a;
          margin-bottom: 10px;
        }
        .lede {
          display: block;
          font-family: var(--font-serif), Georgia, serif;
          font-size: 17px;
          line-height: 1.6;
          color: #333;
        }
        .lock {
          display: inline-block;
          margin-top: 10px;
          font-size: 13px;
          font-weight: 600;
        }
        .dialog {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .box {
          background: #fff;
          border-radius: 4px;
          padding: 28px;
          max-width: 420px;
        }
        .box h2 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 26px;
          margin: 0 0 10px;
        }
        .box p {
          color: #5a5a5a;
          line-height: 1.6;
        }
        .actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .actions button {
          padding: 12px 18px;
          border-radius: 3px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .primary {
          background: #000;
          color: #fff;
          border: none;
        }
        .secondary {
          background: #fff;
          border: 1px solid #121212;
          color: #121212;
        }
        @media (max-width: 600px) {
          h1 {
            font-size: 30px;
          }
          .headline {
            font-size: 22px;
          }
        }
      `}</style>
    </AppLayout>
  )
}
