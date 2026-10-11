// Placeholder antique mailbox with a key. Clicking the key slides it into the
// keyhole, turns it, opens the door, then calls onUnlock. Swap the SVG for the
// final illustration later; keep KEYHOLE in sync with the artwork.

import { useEffect, useState } from 'react'

const NAVY = '#0D1B3E'
const BRASS = '#C9A227'
const BRASS_DARK = '#8C6F12'

const KEYHOLE = { x: 100, y: 196 }
const KEY_START = { x: 178, y: 262 }

export default function Mailbox({ onUnlock, interactive = true, size = 300 }) {
  // idle -> inserting -> turning -> open
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (phase === 'idle' || phase === 'open') return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const next = { inserting: 'turning', turning: 'open' }[phase]
    const t = setTimeout(() => setPhase(next), reduced ? 0 : phase === 'inserting' ? 700 : 450)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'open' || !onUnlock) return
    const t = setTimeout(onUnlock, 500)
    return () => clearTimeout(t)
  }, [phase, onUnlock])

  function start() {
    if (interactive && phase === 'idle') setPhase('inserting')
  }

  const inserted = phase !== 'idle'
  const keyTransform = inserted
    ? `translate(${KEYHOLE.x}px, ${KEYHOLE.y}px) rotate(0deg) scaleY(${phase === 'idle' || phase === 'inserting' ? 1 : 0.35})`
    : `translate(${KEY_START.x}px, ${KEY_START.y}px) rotate(-35deg)`

  return (
    <svg viewBox="0 0 220 320" width={size} height={size * (320 / 220)} role="img" aria-label="Antique mailbox with a key">
      {/* pedestal */}
      <rect x="86" y="246" width="28" height="56" fill={NAVY} />
      <rect x="66" y="298" width="68" height="12" rx="3" fill={NAVY} />
      <rect x="80" y="240" width="40" height="10" rx="2" fill={BRASS} />

      {/* body with arched top */}
      <path d="M40 92 Q40 40 100 32 Q160 40 160 92 L160 240 L40 240 Z" fill={NAVY} />
      <path d="M48 92 Q48 48 100 41 Q152 48 152 92" fill="none" stroke={BRASS} strokeWidth="2" />
      <circle cx="100" cy="30" r="8" fill={BRASS} stroke={BRASS_DARK} strokeWidth="1.5" />
      <path d="M70 70 q30 -18 60 0" fill="none" stroke={BRASS} strokeWidth="1.5" />

      {/* name plate + slot */}
      <rect x="66" y="80" width="68" height="18" rx="3" fill={BRASS} />
      <text x="100" y="93" textAnchor="middle" fontSize="11" fontWeight="700" fill={NAVY} fontFamily="Georgia, serif" letterSpacing="3">
        NEWS
      </text>
      <rect x="64" y="110" width="72" height="9" rx="4.5" fill="#050B1C" stroke={BRASS} strokeWidth="1.5" />

      {/* door (swings open) */}
      <g
        style={{
          transformOrigin: '54px 130px',
          transformBox: 'view-box',
          transform: phase === 'open' ? 'scaleX(0.15)' : 'scaleX(1)',
          transition: 'transform .5s ease',
        }}
      >
        <rect x="54" y="130" width="92" height="98" rx="4" fill="#13265A" stroke={BRASS} strokeWidth="2" />
        <circle cx="100" cy="150" r="6" fill="none" stroke={BRASS} strokeWidth="1.5" />
        <circle cx="76" cy="168" r="3" fill={BRASS} />
        <circle cx="124" cy="168" r="3" fill={BRASS} />
        {/* keyhole */}
        <circle cx={KEYHOLE.x} cy={KEYHOLE.y - 4} r="5" fill="#050B1C" />
        <path d={`M${KEYHOLE.x - 3} ${KEYHOLE.y - 2} L${KEYHOLE.x + 3} ${KEYHOLE.y - 2} L${KEYHOLE.x + 4} ${KEYHOLE.y + 9} L${KEYHOLE.x - 4} ${KEYHOLE.y + 9} Z`} fill="#050B1C" />
        <rect x="80" y="212" width="40" height="8" rx="2" fill="none" stroke={BRASS} strokeWidth="1.5" />
      </g>

      {/* letters revealed when the door opens */}
      {phase === 'open' && (
        <g>
          <rect x="70" y="150" width="60" height="38" rx="2" fill="#F7F1E1" stroke="#D9CBA3" transform="rotate(-6 100 169)" />
          <rect x="74" y="160" width="58" height="36" rx="2" fill="#FFFDF6" stroke="#D9CBA3" />
          <line x1="80" y1="170" x2="120" y2="170" stroke="#B9AE8E" />
          <line x1="80" y1="178" x2="112" y2="178" stroke="#B9AE8E" />
        </g>
      )}

      {/* key: its tip is at the group's origin so it lands exactly on the keyhole */}
      <g
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? 'Turn the key to sign in' : undefined}
        onClick={start}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), start())}
        style={{
          cursor: interactive && phase === 'idle' ? 'pointer' : 'default',
          transformBox: 'view-box',
          transformOrigin: '0 0',
          transform: keyTransform,
          transition: 'transform .7s cubic-bezier(.5,0,.2,1)',
          outline: 'none',
        }}
        className={interactive && phase === 'idle' ? 'gmd-key-idle' : undefined}
      >
        <rect x="0" y="-2.5" width="34" height="5" rx="2" fill={BRASS} stroke={BRASS_DARK} strokeWidth="1" />
        <rect x="4" y="2" width="5" height="7" fill={BRASS} stroke={BRASS_DARK} strokeWidth="1" />
        <rect x="12" y="2" width="4" height="5" fill={BRASS} stroke={BRASS_DARK} strokeWidth="1" />
        <circle cx="44" cy="0" r="11" fill={BRASS} stroke={BRASS_DARK} strokeWidth="1.5" />
        <circle cx="44" cy="0" r="4.5" fill="#F7F8FC" />
        {/* larger invisible hit area */}
        <circle cx="30" cy="0" r="24" fill="transparent" />
      </g>

      <style jsx>{`
        :global(.gmd-key-idle) {
          animation: gmd-wiggle 2.4s ease-in-out infinite;
        }
        :global(.gmd-key-idle:focus-visible circle:first-of-type) {
          stroke: #2563eb;
          stroke-width: 3;
        }
        @keyframes gmd-wiggle {
          0%, 80%, 100% { translate: 0 0; }
          88% { translate: -4px -2px; }
          94% { translate: 2px 1px; }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.gmd-key-idle) { animation: none; }
        }
      `}</style>
    </svg>
  )
}
