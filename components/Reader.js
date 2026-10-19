// Side-by-side article reader. Tapping a marked word shows its meaning and an
// example; Premium readers also save it to their vocab list.

import { useState } from 'react'
import Link from 'next/link'
import { LANGUAGE_BY_CODE } from '../lib/languages.mjs'

// Splits a sentence into plain-text and word parts using the marked surfaces.
function segments(sentence) {
  const parts = []
  let pos = 0
  for (const w of sentence.words) {
    const at = sentence.text.indexOf(w.surface, pos)
    if (at === -1) continue
    if (at > pos) parts.push({ text: sentence.text.slice(pos, at) })
    parts.push({ text: w.surface, lemma: w.lemma })
    pos = at + w.surface.length
  }
  if (pos < sentence.text.length) parts.push({ text: sentence.text.slice(pos) })
  return parts
}

export default function Reader({ article, learnLang, nativeLang, canSave, initialSaved }) {
  const [active, setActive] = useState(null)
  const [saved, setSaved] = useState(initialSaved)
  const learn = LANGUAGE_BY_CODE[learnLang]
  const native = LANGUAGE_BY_CODE[nativeLang]
  const glossary = Object.fromEntries(article.glossary.map(g => [g.lemma, { ...g, ...(article.translation.glossary[g.lemma] ?? {}) }]))
  const entry = active && glossary[active]

  async function tap(lemma) {
    setActive(lemma)
    if (!canSave || saved.some(s => s.lemma === lemma)) return
    const g = glossary[lemma]
    setSaved(prev => [{ lemma, meaning: g?.meaning ?? '' }, ...prev])
    const res = await fetch('/api/vocab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: article.id, lemma }),
    })
    if (!res.ok) setSaved(prev => prev.filter(s => s.lemma !== lemma))
  }

  function renderSentence(sentence, key) {
    return segments(sentence).map((p, i) =>
      p.lemma ? (
        <button key={`${key}-${i}`} type="button" className={`w ${active === p.lemma ? 'on' : ''}`} onClick={() => tap(p.lemma)}>
          {p.text}
        </button>
      ) : (
        <span key={`${key}-${i}`}>{p.text}</span>
      )
    )
  }

  const learnDir = learn.rtl ? 'rtl' : 'ltr'
  const nativeDir = native.rtl ? 'rtl' : 'ltr'

  return (
    <div className="layout">
      <article>
        <p className="kicker">
          {article.topic} · {article.source}
        </p>
        <div className="pair head">
          <h1 dir={learnDir} lang={learnLang}>
            {renderSentence(article.headline, 'h')}
          </h1>
          <p className="tr" dir={nativeDir} lang={nativeLang}>
            {article.translation.headline}
          </p>
        </div>
        {article.sentences.map((s, i) => (
          <div className="pair" key={i}>
            <p className="src" dir={learnDir} lang={learnLang}>
              {renderSentence(s, i)}
            </p>
            <p className="tr" dir={nativeDir} lang={nativeLang}>
              {article.translation.sentences[i]}
            </p>
          </div>
        ))}
        <p className="credit">
          Retold for learners from reporting by {article.source}.{' '}
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read the original article →
          </a>
        </p>
      </article>

      <aside>
        <div className={`word ${entry ? 'show' : ''}`} aria-live="polite">
          {entry ? (
            <>
              <div className="lemma" dir={learnDir} lang={learnLang}>
                {active}
                {entry.reading && <span className="reading">{entry.reading}</span>}
              </div>
              <div className="pos">{entry.part_of_speech}</div>
              <div className="meaning" lang={nativeLang}>
                {entry.meaning ?? '—'}
              </div>
              {entry.example && (
                <div className="example">
                  <span dir={learnDir} lang={learnLang}>
                    {entry.example}
                  </span>
                  <span className="ex-tr" lang={nativeLang}>
                    {entry.example_translation}
                  </span>
                </div>
              )}
              <button type="button" className="close" onClick={() => setActive(null)} aria-label="Close">
                ×
              </button>
            </>
          ) : (
            <p className="hint">Tap any underlined word to see its meaning.</p>
          )}
        </div>

        <div className="vocab">
          <div className="vocab-title">Vocab list</div>
          {canSave ? (
            saved.length ? (
              <ul>
                {saved.map(s => (
                  <li key={s.lemma}>
                    <b lang={learnLang}>{s.lemma}</b> {s.meaning}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">Words you tap are saved here.</p>
            )
          ) : (
            <div className="locked">
              <p>Save every word you tap and review it later with Premium.</p>
              <Link href="/settings#plan" legacyBehavior>
                <a>See Premium</a>
              </Link>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 40px;
        }
        .kicker {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #5a5a5a;
          margin: 0 0 12px;
        }
        .pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .pair.head {
          border-bottom: 1px solid #121212;
          padding-bottom: 20px;
          margin-bottom: 8px;
        }
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 32px;
          line-height: 1.25;
          margin: 0;
        }
        .src {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 20px;
          line-height: 1.7;
          margin: 0;
        }
        .tr {
          font-size: 15px;
          line-height: 1.7;
          color: #5a5a5a;
          margin: 0;
        }
        .head .tr {
          font-size: 17px;
          align-self: end;
        }
        .w {
          font: inherit;
          color: inherit;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          border-bottom: 1px dotted #326891;
        }
        .w:hover,
        .w.on {
          background: #e8eef3;
        }
        .credit {
          font-size: 13px;
          color: #5a5a5a;
          margin-top: 20px;
        }
        .credit a {
          color: #326891;
        }
        aside {
          position: sticky;
          top: 16px;
          align-self: start;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .word {
          position: relative;
          background: #121212;
          color: #fff;
          border-radius: 4px;
          padding: 18px;
          min-height: 90px;
        }
        .word .hint {
          color: #cfcfcf;
        }
        .lemma {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 24px;
        }
        .reading {
          font-family: var(--font-sans), Arial, sans-serif;
          font-size: 14px;
          color: #cfcfcf;
          margin-left: 10px;
        }
        .pos {
          font-size: 12px;
          color: #a8a8a8;
          margin: 2px 0 10px;
        }
        .meaning {
          font-size: 17px;
          margin-bottom: 12px;
        }
        .example {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          border-top: 1px solid #3a3a3a;
          padding-top: 10px;
        }
        .ex-tr {
          color: #cfcfcf;
        }
        .close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          color: #cfcfcf;
          font-size: 22px;
          cursor: pointer;
        }
        .vocab {
          border: 1px solid #dfdfdf;
          border-radius: 4px;
          padding: 16px 18px;
        }
        .vocab-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }
        .vocab ul {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 320px;
          overflow-y: auto;
        }
        .vocab li {
          font-size: 14px;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .hint {
          font-size: 14px;
          color: #5a5a5a;
          margin: 0;
        }
        .locked p {
          font-size: 14px;
          color: #5a5a5a;
          margin: 0 0 10px;
        }
        .locked a {
          display: inline-block;
          background: #000;
          color: #fff;
          padding: 8px 14px;
          border-radius: 3px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
          .pair {
            grid-template-columns: 1fr;
            gap: 4px;
          }
          aside {
            position: static;
          }
          .word {
            display: none;
          }
          .word.show {
            display: block;
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            z-index: 20;
          }
        }
      `}</style>
    </div>
  )
}
