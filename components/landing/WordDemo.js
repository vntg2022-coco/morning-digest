// Interactive "tap a word" demo: tapping a highlighted Spanish word shows its
// meaning and an example, and adds it to a mini vocab list.

import { useState } from 'react'
import { WORD_DEMO } from './samples'

function stripPunct(token) {
  return token.replace(/[.,;:!?]/g, '').toLowerCase()
}

export default function WordDemo() {
  const [active, setActive] = useState('bibliotecas')
  const [saved, setSaved] = useState(['bibliotecas'])

  function pick(word) {
    setActive(word)
    setSaved(prev => (prev.includes(word) ? prev : [...prev, word]))
  }

  const info = WORD_DEMO.words[active]

  return (
    <div className="demo">
      <div className="reader">
        <div className="cols">
          <div>
            <div className="label">Español</div>
            <p className="target">
              {WORD_DEMO.sentence.split(' ').map((tok, i) => {
                const key = stripPunct(tok)
                const clickable = WORD_DEMO.words[key]
                return (
                  <span key={i}>
                    {clickable ? (
                      <button
                        type="button"
                        className={`word ${active === key ? 'on' : ''}`}
                        onClick={() => pick(key)}
                      >
                        {tok}
                      </button>
                    ) : (
                      tok
                    )}{' '}
                  </span>
                )
              })}
            </p>
          </div>
          <div>
            <div className="label">English</div>
            <p className="native">{WORD_DEMO.translation}</p>
          </div>
        </div>
        {info && (
          <div className="popup" aria-live="polite">
            <div className="term">{active}</div>
            <div className="meaning">{info.meaning}</div>
            <div className="example">
              “{info.example}” <span>— {info.exampleEn}</span>
            </div>
          </div>
        )}
      </div>
      <aside className="vocab">
        <div className="label">Vocab list</div>
        <ul>
          {saved.map(w => (
            <li key={w}>
              <b>{w}</b> · {WORD_DEMO.words[w].meaning}
            </li>
          ))}
        </ul>
        <div className="hint">Tap the underlined words</div>
      </aside>
      <style jsx>{`
        .demo {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 16px;
          text-align: left;
        }
        .reader,
        .vocab {
          background: #fff;
          border: 1px solid #dfdfdf;
          border-radius: 4px;
          padding: 20px;
        }
        .cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #326891;
          margin-bottom: 8px;
        }
        .target {
          font-family: var(--font-serif), Georgia, 'Times New Roman', serif;
          font-size: 19px;
          line-height: 1.7;
          color: #121212;
          margin: 0;
        }
        .native {
          font-size: 15px;
          line-height: 1.7;
          color: #5a5a5a;
          margin: 0;
        }
        .word {
          font: inherit;
          color: inherit;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          border-bottom: 2px dotted #326891;
        }
        .word.on {
          background: #e8eef3;
          border-bottom-style: solid;
        }
        .popup {
          margin-top: 16px;
          background: #121212;
          color: #fff;
          border-radius: 4px;
          padding: 14px 16px;
        }
        .term {
          font-family: var(--font-serif), Georgia, 'Times New Roman', serif;
          font-size: 18px;
          font-weight: 700;
        }
        .meaning {
          color: #cfcfcf;
          font-size: 14px;
          margin: 2px 0 8px;
        }
        .example {
          font-size: 14px;
        }
        .example span {
          color: #e2e2e2;
        }
        .vocab ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 13px;
          color: #121212;
        }
        .vocab li {
          padding: 6px 0;
          border-bottom: 1px solid #ececec;
        }
        .hint {
          margin-top: 10px;
          font-size: 11px;
          color: #5a5a5a;
        }
        @media (max-width: 720px) {
          .demo,
          .cols {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
