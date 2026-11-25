// Switches between a reader's learning languages (shown only when they have more than one).
import Link from 'next/link'
import { LANGUAGE_BY_CODE } from '../lib/languages.mjs'

export default function LanguageTabs({ languages, selected, basePath }) {
  if (languages.length < 2) return null
  return (
    <div className="tabs">
      {languages.map(l => (
        <Link key={l.lang} href={`${basePath}?lang=${l.lang}`} legacyBehavior>
          <a className={l.lang === selected ? 'on' : ''}>{LANGUAGE_BY_CODE[l.lang].name}</a>
        </Link>
      ))}
      <style jsx>{`
        .tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        a {
          font-size: 13px;
          padding: 6px 14px;
          border: 1px solid #dfdfdf;
          border-radius: 3px;
          color: #121212;
          text-decoration: none;
        }
        a.on {
          background: #121212;
          border-color: #121212;
          color: #fff;
        }
      `}</style>
    </div>
  )
}
