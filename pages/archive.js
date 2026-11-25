// Past stories for the selected language. Standard readers see only the
// stories they chose; Premium (and trial) readers see every story.

import Link from 'next/link'
import AppLayout from '../components/AppLayout'
import LanguageTabs from '../components/LanguageTabs'
import { storyAccess } from '../lib/access.mjs'
import { LANGUAGE_BY_CODE } from '../lib/languages.mjs'
import { loadReader } from '../lib/reader-context'
import { getPicks, listEditionDays } from '../lib/store.mjs'

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  const { user, profile, plan, languages, selected } = reader
  if (!selected) return { props: { languages, selected: null, days: [] } }

  const [allDays, picks] = await Promise.all([
    listEditionDays({ lang: selected.lang, level: selected.level, native: profile.native_lang }),
    getPicks(user.id, selected.lang),
  ])
  const days = allDays
    .map(d => ({ ...d, articles: d.articles.filter(a => storyAccess(plan, a.storyId, picks[d.date]) === 'open') }))
    .filter(d => d.articles.length > 0)

  return { props: { languages, selected, days } }
}

function formatDate(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Archive({ languages, selected, days }) {
  const lang = selected && LANGUAGE_BY_CODE[selected.lang]
  return (
    <AppLayout title="Archive">
      <LanguageTabs languages={languages} selected={selected?.lang} basePath="/archive" />
      <h1>Archive</h1>
      {days.length === 0 && <p className="empty">Stories you read will appear here.</p>}
      {days.map(d => (
        <section key={d.date}>
          <h2>{formatDate(d.date)}</h2>
          <ul>
            {d.articles.map(a => (
              <li key={a.id}>
                <Link href={`/read/${a.id}`} legacyBehavior>
                  <a>
                    <span className="topic">{a.topic}</span>
                    <span className="headline" dir={lang.rtl ? 'rtl' : 'ltr'} lang={selected.lang}>
                      {a.headline}
                    </span>
                    <span className="tr">{a.headlineTranslation}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <style jsx>{`
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 40px;
          margin: 0 0 20px;
        }
        h2 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-top: 1px solid #121212;
          padding-top: 10px;
          margin: 28px 0 4px;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        li a {
          display: block;
          padding: 14px 0;
          border-bottom: 1px solid #dfdfdf;
          color: inherit;
          text-decoration: none;
        }
        li a:hover .headline {
          text-decoration: underline;
        }
        .topic {
          display: block;
          font-size: 12px;
          color: #5a5a5a;
          margin-bottom: 4px;
        }
        .headline {
          display: block;
          font-family: var(--font-serif), Georgia, serif;
          font-size: 21px;
        }
        .tr {
          display: block;
          font-size: 14px;
          color: #5a5a5a;
          margin-top: 4px;
        }
        .empty {
          color: #5a5a5a;
        }
      `}</style>
    </AppLayout>
  )
}
