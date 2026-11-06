// One ordered list of learning languages, modeled on the macOS "Preferred
// Languages" list. The top `slots` rows are active (the first is Primary); the
// rows below are paused. Drag a row up or down to reorder (mouse or touch, via
// pointer events); with the keyboard, focus a row and press Alt+↑ / Alt+↓.
// "+" adds a language. There is no "−": languages are never deleted.

import { useEffect, useRef, useState } from 'react'
import { LANGUAGE_BY_CODE, LANGUAGES } from '../lib/languages.mjs'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const cap = s => s[0].toUpperCase() + s.slice(1)
const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

export default function LanguageList({ languages, slots, nativeLang, nextSwap, onReorder, onLevel, onAdd }) {
  const listRef = useRef(null)
  const [order, setOrder] = useState(languages.map(l => l.lang))
  const [drag, setDrag] = useState(null) // { lang, startY, dy, rowHeight, from }
  const [adding, setAdding] = useState(false)
  const [newLang, setNewLang] = useState('')
  const [newLevel, setNewLevel] = useState('intermediate')

  // Follow the server's order after each save (or a refused swap).
  const serverOrder = languages.map(l => l.lang).join(',')
  useEffect(() => setOrder(serverOrder ? serverOrder.split(',') : []), [serverOrder])

  const byLang = Object.fromEntries(languages.map(l => [l.lang, l]))
  const activeCount = Math.min(slots, order.length)
  const freeSlots = Math.max(0, slots - order.length)
  const addable = LANGUAGES.filter(l => l.code !== nativeLang && !order.includes(l.code))

  // Where the dragged row would land, given how far it has moved.
  const targetIndex = d => Math.max(0, Math.min(order.length - 1, d.from + Math.round(d.dy / d.rowHeight)))

  function commit(next) {
    const before = new Set(order.slice(0, slots))
    const pausing = [...before].filter(l => !next.slice(0, slots).includes(l))
    if (pausing.length) {
      const names = pausing.map(l => LANGUAGE_BY_CODE[l].name).join(', ')
      if (nextSwap) {
        window.alert(`Swaps are limited to once every 30 days. Your next swap is available on ${fmt(nextSwap)}.`)
        return
      }
      if (!window.confirm(`${names} will be paused (no new stories; archive and vocab list stay). You can swap again in 30 days. Continue?`)) return
    }
    setOrder(next)
    onReorder(next)
  }

  function move(from, to) {
    if (to < 0 || to >= order.length || to === from) return
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    commit(next)
  }

  function onPointerDown(e, lang) {
    if (e.button !== undefined && e.button !== 0) return
    if (e.target.closest('select, button:not(.handle)')) return
    const row = e.currentTarget
    row.setPointerCapture(e.pointerId)
    setDrag({ lang, startY: e.clientY, dy: 0, rowHeight: row.getBoundingClientRect().height, from: order.indexOf(lang) })
  }
  function onPointerMove(e) {
    if (!drag) return
    setDrag(d => ({ ...d, dy: e.clientY - d.startY }))
  }
  function onPointerUp() {
    if (!drag) return
    const to = targetIndex(drag)
    const from = drag.from
    setDrag(null)
    move(from, to)
  }

  // Visual offset of each row while dragging, so the others slide out of the way.
  function offset(i, lang) {
    if (!drag) return 0
    if (lang === drag.lang) return drag.dy
    const to = targetIndex(drag)
    if (drag.from < to && i > drag.from && i <= to) return -drag.rowHeight
    if (drag.from > to && i < drag.from && i >= to) return drag.rowHeight
    return 0
  }

  return (
    <div className="box">
      <div className="title">Learning Languages</div>
      <ul ref={listRef} role="listbox" aria-label="Learning languages, in order">
        {order.map((lang, i) => {
          const l = byLang[lang]
          const status = i === 0 ? 'Primary' : i < slots ? 'Active' : 'Paused'
          return (
            <li
              key={lang}
              role="option"
              aria-selected={false}
              tabIndex={0}
              className={`row ${i >= slots ? 'paused' : ''} ${i === activeCount - 1 && order.length > slots ? 'cut' : ''} ${drag?.lang === lang ? 'dragging' : ''}`}
              style={{ transform: `translateY(${offset(i, lang)}px)`, transition: drag?.lang === lang ? 'none' : 'transform .15s' }}
              onPointerDown={e => onPointerDown(e, lang)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={e => {
                if (!e.altKey) return
                if (e.key === 'ArrowUp') (e.preventDefault(), move(i, i - 1))
                if (e.key === 'ArrowDown') (e.preventDefault(), move(i, i + 1))
              }}
            >
              <span className="native" lang={lang}>
                {LANGUAGE_BY_CODE[lang].native}
              </span>
              <span className="detail">
                {LANGUAGE_BY_CODE[lang].name} — {status}
                {l?.purchased && ' · Add-on'}
              </span>
              <select value={l?.level} onChange={e => onLevel(lang, e.target.value)} aria-label={`${LANGUAGE_BY_CODE[lang].name} level`}>
                {LEVELS.map(v => (
                  <option key={v} value={v}>
                    {cap(v)}
                  </option>
                ))}
              </select>
              <button type="button" className="handle" aria-hidden="true" tabIndex={-1}>
                ≡
              </button>
            </li>
          )
        })}
        {Array.from({ length: freeSlots }, (_, i) => (
          <li key={`free-${i}`} className="row free">
            Empty slot
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="add">
          <select value={newLang} onChange={e => setNewLang(e.target.value)} aria-label="Language to add">
            <option value="">Choose a language…</option>
            {addable.map(l => (
              <option key={l.code} value={l.code}>
                {l.name} — {l.native}
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
              onAdd(newLang, newLevel)
              setAdding(false)
              setNewLang('')
            }}
          >
            Add
          </button>
          <button type="button" className="link" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="bar">
          <button
            type="button"
            className="plus"
            aria-label="Add a language"
            disabled={freeSlots === 0 || addable.length === 0}
            title={freeSlots === 0 ? 'All slots are in use' : 'Add a language'}
            onClick={() => setAdding(true)}
          >
            +
          </button>
        </div>
      )}

      <p className="note">
        Drag to reorder. The top {slots === 1 ? 'language gets' : `${slots} languages get`} new stories every morning; languages below the line
        are paused, but their archive and vocab list stay. Pausing a language is limited to once every 30 days
        {nextSwap ? ` (next: ${fmt(nextSwap)})` : ''}.
        {freeSlots === 0 && ' To learn more languages at once, upgrade or add a slot for a one-time $4.99 (coming soon).'}
      </p>

      <style jsx>{`
        .box {
          background: #f5f5f5;
          border: 1px solid #e2e2e2;
          border-radius: 10px;
          overflow: hidden;
        }
        .title {
          font-weight: 700;
          font-size: 15px;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e2e2;
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          cursor: grab;
          user-select: none;
          touch-action: pan-y;
        }
        .row:nth-child(even) {
          background: #fafafa;
        }
        .row:focus-visible {
          outline: 2px solid #326891;
          outline-offset: -2px;
        }
        .row.dragging {
          z-index: 2;
          cursor: grabbing;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
          background: #fff;
        }
        .row.cut {
          border-bottom: 2px solid #121212;
        }
        .row.paused .native,
        .row.paused .detail {
          color: #9a9a9a;
        }
        .row.free {
          color: #9a9a9a;
          font-style: italic;
          cursor: default;
        }
        .native {
          min-width: 120px;
          font-size: 16px;
        }
        .detail {
          flex: 1;
          color: #6b6b6b;
          font-size: 15px;
        }
        select {
          font: inherit;
          font-size: 13px;
          padding: 5px 8px;
          border: 1px solid #c8c8c8;
          border-radius: 6px;
          background: #fff;
        }
        .handle {
          background: none;
          border: none;
          font-size: 20px;
          color: #a0a0a0;
          cursor: grab;
          padding: 0 4px;
          touch-action: none;
        }
        .bar {
          display: flex;
          border-top: 1px solid #e2e2e2;
          padding: 4px 8px;
        }
        .plus {
          background: none;
          border: none;
          font-size: 20px;
          width: 32px;
          height: 28px;
          color: #444;
          cursor: pointer;
          border-right: 1px solid #dcdcdc;
        }
        .plus:disabled {
          color: #c0c0c0;
          cursor: default;
        }
        .add {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          padding: 10px 12px;
          border-top: 1px solid #e2e2e2;
        }
        .btn {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 3px;
          padding: 7px 16px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .btn:disabled {
          background: #8a8a8a;
        }
        .link {
          background: none;
          border: none;
          font: inherit;
          color: #5a5a5a;
          text-decoration: underline;
          cursor: pointer;
        }
        .note {
          font-size: 13px;
          color: #5a5a5a;
          line-height: 1.6;
          margin: 0;
          padding: 10px 16px 14px;
          background: #fff;
          border-top: 1px solid #e2e2e2;
        }
        @media (max-width: 600px) {
          .native {
            min-width: 0;
          }
          .detail {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}
