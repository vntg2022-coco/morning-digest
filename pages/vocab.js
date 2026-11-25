// Premium: every word the reader has tapped, per learning language.

import { useState } from 'react'
import Link from 'next/link'
import AppLayout from '../components/AppLayout'
import LanguageTabs from '../components/LanguageTabs'
import { LANGUAGE_BY_CODE } from '../lib/languages.mjs'
import { PLANS } from '../lib/plans.mjs'
import { loadReader } from '../lib/reader-context'
import { adminDb } from '../lib/store.mjs'

export async function getServerSideProps(ctx) {
  const reader = await loadReader(ctx)
  if (reader.redirect) return reader
  const { user, plan, languages, selected } = reader
  const allowed = PLANS[plan].vocab

  let words = []
  if (allowed && selected) {
    const { data } = await adminDb()
      .from('vocab')
      .select('id, lemma, reading, meaning, example, example_translation, article_id, created_at')
      .eq('user_id', user.id)
      .eq('lang', selected.lang)
      .order('created_at', { ascending: false })
      .limit(500)
    words = data ?? []
  }
  return { props: { allowed, languages, selected, words } }
}

export default function Vocab({ allowed, languages, selected, words: initial }) {
  const [words, setWords] = useState(initial)
  const lang = selected && LANGUAGE_BY_CODE[selected.lang]

  async function remove(id) {
    setWords(prev => prev.filter(w => w.id !== id))
    await fetch('/api/vocab', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  }

  return (
    <AppLayout title="Vocab list">
      <LanguageTabs languages={languages} selected={selected?.lang} basePath="/vocab" />
      <h1>Vocab list</h1>
      {!allowed ? (
        <div className="locked">
          <p>Every word you tap while reading is saved here, with its meaning and an example sentence. The vocab list is part of Premium.</p>
          <Link href="/settings#plan" legacyBehavior>
            <a className="btn">See Premium</a>
          </Link>
        </div>
      ) : words.length === 0 ? (
        <p className="empty">No words yet. Tap a word while reading and it will be saved here.</p>
      ) : (
        <>
          <p className="count">{words.length} words</p>
          <ul>
            {words.map(w => (
              <li key={w.id}>
                <div className="term" dir={lang.rtl ? 'rtl' : 'ltr'} lang={selected.lang}>
                  {w.lemma}
                  {w.reading && <span className="reading">{w.reading}</span>}
                </div>
                <div className="meaning">{w.meaning}</div>
                {w.example && (
                  <div className="example">
                    <span lang={selected.lang}>{w.example}</span>
                    <span className="ex-tr">{w.example_translation}</span>
                  </div>
                )}
                <div className="links">
                  {w.article_id && (
                    <Link href={`/read/${w.article_id}`} legacyBehavior>
                      <a>From this story</a>
                    </Link>
                  )}
                  <button type="button" onClick={() => remove(w.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <style jsx>{`
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 40px;
          margin: 0 0 16px;
        }
        .count,
        .empty,
        .locked p {
          color: #5a5a5a;
        }
        .btn {
          display: inline-block;
          background: #000;
          color: #fff;
          padding: 12px 18px;
          border-radius: 3px;
          font-weight: 700;
          text-decoration: none;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid #121212;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0 28px;
        }
        li {
          padding: 16px 0;
          border-bottom: 1px solid #dfdfdf;
        }
        .term {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 22px;
        }
        .reading {
          font-family: var(--font-sans), Arial, sans-serif;
          font-size: 13px;
          color: #5a5a5a;
          margin-left: 8px;
        }
        .meaning {
          margin: 4px 0 8px;
        }
        .example {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 14px;
        }
        .ex-tr {
          color: #5a5a5a;
        }
        .links {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          font-size: 13px;
        }
        .links a {
          color: #326891;
        }
        .links button {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: #5a5a5a;
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </AppLayout>
  )
}
