// "See it in your language": pick a learning language, see the sample article
// side by side with its translation.

import { useState } from 'react'
import { LANGUAGES, LANGUAGE_BY_CODE } from '../../lib/languages.mjs'
import { SAMPLES, SAMPLE_EN, SAMPLE_ES_FOR_ENGLISH } from './samples'

export default function SampleViewer() {
  const [code, setCode] = useState('es')
  const target = SAMPLES[code]
  // The site is in English, so the translation column is English — except for
  // learners of English, who see Spanish as the example native language.
  const nativeCode = code === 'en' ? 'es' : 'en'
  const native = nativeCode === 'en' ? SAMPLE_EN : SAMPLE_ES_FOR_ENGLISH
  const lang = LANGUAGE_BY_CODE[code]

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Learning language">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            type="button"
            role="tab"
            aria-selected={code === l.code}
            className={code === l.code ? 'on' : ''}
            onClick={() => setCode(l.code)}
          >
            {l.name}
          </button>
        ))}
      </div>
      <div className="paper">
        <div className="tag">Sample article · Intermediate</div>
        <div className="cols">
          <div dir={lang.rtl ? 'rtl' : 'ltr'} lang={code}>
            <div className="label">{lang.native}</div>
            <h3>{target.headline}</h3>
            {target.sentences.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </div>
          <div lang={nativeCode} className="native">
            <div className="label">{LANGUAGE_BY_CODE[nativeCode].native}</div>
            <h3>{native.headline}</h3>
            {native.sentences.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 20px;
        }
        .tabs button {
          font-size: 13px;
          padding: 7px 14px;
          border-radius: 20px;
          border: 1px solid #e0e6f0;
          background: #fff;
          color: #5a6a8a;
          cursor: pointer;
        }
        .tabs button.on {
          background: #0d1b3e;
          border-color: #0d1b3e;
          color: #fff;
        }
        .paper {
          background: #fffdf6;
          border: 1px solid #e3d8bd;
          border-radius: 12px;
          padding: 24px;
          text-align: left;
          box-shadow: 0 6px 24px rgba(13, 27, 62, 0.06);
        }
        .tag {
          font-size: 11px;
          color: #8c7b55;
          margin-bottom: 14px;
        }
        .cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        .cols > div + div {
          border-left: 1px solid #e3d8bd;
          padding-left: 28px;
        }
        .label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 8px;
        }
        h3 {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 22px;
          line-height: 1.35;
          color: #0d1b3e;
          margin: 0 0 12px;
        }
        p {
          font-size: 16px;
          line-height: 1.75;
          color: #1a1a2e;
          margin: 0 0 8px;
        }
        .native h3,
        .native p {
          color: #5a6a8a;
        }
        @media (max-width: 720px) {
          .cols {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .cols > div + div {
            border-left: none;
            border-top: 1px solid #e3d8bd;
            padding: 18px 0 0;
          }
        }
      `}</style>
    </div>
  )
}
