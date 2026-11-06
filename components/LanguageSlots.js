// Main languages (one slot each, from the plan) above a Paused shelf.
// Drag a language down to pause it (once every 30 days), or drag a paused one
// up into a free slot. Touch and keyboard users get a small move button instead.

import { useState } from 'react'
import { LANGUAGE_BY_CODE, LANGUAGES } from '../lib/languages.mjs'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const cap = s => s[0].toUpperCase() + s.slice(1)

export default function LanguageSlots({ languages, slots, nativeLang, nextSwap, onAction }) {
  const [dragging, setDragging] = useState(null)
  const [over, setOver] = useState(null)
  const [newLang, setNewLang] = useState('')
  const [newLevel, setNewLevel] = useState('intermediate')

  const main = languages.filter(l => !l.paused)
  const paused = languages.filter(l => l.paused)
  const free = Math.max(0, slots - main.length)
  const addable = LANGUAGES.filter(l => l.code !== nativeLang && !languages.some(x => x.lang === l.code))
  const swapNote = nextSwap
    ? `Your next swap is available on ${new Date(nextSwap).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
    : 'You can swap now.'

  function pause(l) {
    const name = LANGUAGE_BY_CODE[l.lang].name
    if (nextSwap) return onAction({ action: 'pause', lang: l.lang })
    if (window.confirm(`Move ${name} to Paused? You can swap languages once every 30 days.`)) onAction({ action: 'pause', lang: l.lang })
  }

  function drop(target) {
    const l = languages.find(x => x.lang === dragging)
    setDragging(null)
    setOver(null)
    if (!l) return
    if (target === 'paused' && !l.paused) pause(l)
    if (target === 'main' && l.paused) onAction({ action: 'activate', lang: l.lang })
  }

  const zone = name => ({
    onDragOver: e => {
      e.preventDefault()
      setOver(name)
    },
    onDragLeave: () => setOver(null),
    onDrop: e => {
      e.preventDefault()
      drop(name)
    },
  })

  const item = l => (
    <li
      key={l.lang}
      draggable
      onDragStart={() => setDragging(l.lang)}
      onDragEnd={() => setDragging(null)}
      className={`item ${dragging === l.lang ? 'dragging' : ''}`}
    >
      <span className="grip" aria-hidden="true">
        ⠿
      </span>
      <span className="name">
        {LANGUAGE_BY_CODE[l.lang].name}
        {l.purchased && <span className="tag">Add-on</span>}
      </span>
      <select value={l.level} onChange={e => onAction({ action: 'level', lang: l.lang, level: e.target.value })} aria-label="Level">
        {LEVELS.map(v => (
          <option key={v} value={v}>
            {cap(v)}
          </option>
        ))}
      </select>
      {l.paused ? (
        <button type="button" className="move" disabled={!free} onClick={() => onAction({ action: 'activate', lang: l.lang })}>
          Move up ↑
        </button>
      ) : (
        <button type="button" className="move" onClick={() => pause(l)}>
          Move to Paused ↓
        </button>
      )}
    </li>
  )

  return (
    <div>
      <div className={`area main ${over === 'main' ? 'over' : ''}`} {...zone('main')}>
        <div className="area-title">
          Main languages <span>{main.length} of {slots}</span>
        </div>
        <ul>
          {main.map(item)}
          {Array.from({ length: free }, (_, i) => (
            <li key={`free-${i}`} className="empty">
              Empty slot — add a language below{paused.length ? ', or drag one up from Paused' : ''}
            </li>
          ))}
        </ul>
        {free > 0 && addable.length > 0 && (
          <div className="add">
            <select value={newLang} onChange={e => setNewLang(e.target.value)} aria-label="Language to add">
              <option value="">Add a language…</option>
              {addable.map(l => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <select value={newLevel} onChange={e => setNewLevel(e.target.value)} aria-label="Level">
              {LEVELS.map(v => (
                <option key={v} value={v}>
                  {cap(v)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              disabled={!newLang}
              onClick={() => {
                onAction({ action: 'add', lang: newLang, level: newLevel })
                setNewLang('')
              }}
            >
              Add
            </button>
          </div>
        )}
        {free === 0 && (
          <p className="note">All slots are in use. Upgrade, or add a slot for a one-time $4.99 (coming soon).</p>
        )}
      </div>

      <div className={`area paused ${over === 'paused' ? 'over' : ''}`} {...zone('paused')}>
        <div className="area-title">Paused</div>
        {paused.length ? (
          <ul>{paused.map(item)}</ul>
        ) : (
          <p className="note">Drag a language here to pause it. Paused languages get no new stories, but their archive and vocab list stay.</p>
        )}
        <p className="note">Swaps: once every 30 days. {swapNote}</p>
      </div>

      <style jsx>{`
        .area {
          border: 1px solid #dfdfdf;
          border-radius: 4px;
          padding: 14px 16px;
          margin-bottom: 14px;
          transition: background 0.15s;
        }
        .area.paused {
          background: #f7f7f5;
        }
        .area.over {
          background: #e8eef3;
          border-color: #326891;
        }
        .area-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }
        .area-title span {
          font-weight: 400;
          color: #5a5a5a;
          margin-left: 8px;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
          background: #fff;
          border: 1px solid #ececec;
          border-radius: 3px;
          margin-bottom: 8px;
          cursor: grab;
        }
        .item.dragging {
          opacity: 0.4;
        }
        .grip {
          color: #a0a0a0;
        }
        .name {
          flex: 1;
          font-weight: 600;
        }
        .tag {
          font-size: 11px;
          font-weight: 400;
          color: #5a5a5a;
          border: 1px solid #dfdfdf;
          border-radius: 3px;
          padding: 1px 6px;
          margin-left: 8px;
        }
        select {
          font: inherit;
          font-size: 14px;
          padding: 7px 10px;
          border: 1px solid #b8b8b8;
          border-radius: 3px;
          background: #fff;
        }
        .move {
          background: none;
          border: none;
          font: inherit;
          font-size: 12px;
          color: #5a5a5a;
          cursor: pointer;
          opacity: 0;
        }
        .item:hover .move,
        .move:focus-visible {
          opacity: 1;
        }
        @media (hover: none) {
          .move {
            opacity: 1;
          }
        }
        .move:disabled {
          cursor: default;
          color: #b8b8b8;
        }
        .empty {
          padding: 12px;
          border: 1px dashed #b8b8b8;
          border-radius: 3px;
          color: #5a5a5a;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .add {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .btn {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 3px;
          padding: 8px 18px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .btn:disabled {
          background: #8a8a8a;
        }
        .note {
          font-size: 13px;
          color: #5a5a5a;
          margin: 8px 0 0;
        }
      `}</style>
    </div>
  )
}
