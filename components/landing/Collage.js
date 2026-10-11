// Newspaper-clipping collage for the hero background: one "front page" per
// language, mastheaded with "Good morning". Purely decorative.

import { LANGUAGES } from '../../lib/languages.mjs'

// left%, top%, rotation(deg), width(px)
const LAYOUT = [
  [2, 6, -6, 190], [22, 2, 4, 170], [70, 4, -3, 200], [86, 18, 7, 160],
  [4, 44, 5, 170], [80, 52, -5, 190], [12, 74, -3, 200], [64, 78, 4, 180],
  [36, 84, -2, 170], [90, 80, -8, 150], [48, 0, -7, 150], [-2, 22, 9, 140],
]

export default function Collage() {
  return (
    <div className="collage" aria-hidden="true">
      {LANGUAGES.map((lang, i) => {
        const [left, top, rot, width] = LAYOUT[i]
        return (
          <div
            key={lang.code}
            className="clip"
            dir={lang.rtl ? 'rtl' : 'ltr'}
            style={{ left: `${left}%`, top: `${top}%`, width, transform: `rotate(${rot}deg)` }}
          >
            <div className="masthead">{lang.greeting}</div>
            <div className="rule" />
            <div className="cols">
              {[0, 1].map(c => (
                <div key={c} className="col">
                  {[92, 100, 84, 96, 70].map((w, j) => (
                    <span key={j} style={{ width: `${w - c * 6}%` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <style jsx>{`
        .collage {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .clip {
          position: absolute;
          background: #f6f0e1;
          border: 1px solid #e3d8bd;
          box-shadow: 0 2px 6px rgba(13, 27, 62, 0.08);
          padding: 10px 12px 12px;
          opacity: 0.75;
        }
        .masthead {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          color: #3b3324;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rule {
          border-top: 2px solid #3b3324;
          border-bottom: 1px solid #3b3324;
          height: 3px;
          margin: 6px 0 8px;
        }
        .cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .col span {
          display: block;
          height: 4px;
          background: #cfc4a8;
          margin-bottom: 5px;
          border-radius: 1px;
        }
        @media (max-width: 720px) {
          .clip {
            opacity: 0.45;
            transform-origin: center;
            scale: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
