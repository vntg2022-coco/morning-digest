import { useState } from 'react'
import { useRouter } from 'next/router'

const navItems = [
  { key: 'home', icon: '📰', label: 'ホーム' },
  { key: 'archive', icon: '📂', label: 'アーカイブ' },
  { key: 'settings', icon: '⚙️', label: '配信設定' },
]

export default function Sidebar({ active, onNav }) {
  const router = useRouter()

  function handleLogout() {
    router.push('/login')
  }

  function handlePlanChange() {
    router.push('/billing')
  }

  return (
    <div style={{ width: 220, background: '#0D1B3E', display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />
          Morning Digest
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '16px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '0 20px 8px' }}>メニュー</div>
        {navItems.map(item => (
          <div
            key={item.key}
            onClick={() => onNav(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 13, cursor: 'pointer',
              color: active === item.key ? '#fff' : 'rgba(255,255,255,0.55)',
              background: active === item.key ? 'rgba(37,99,235,0.25)' : 'transparent',
              borderRight: active === item.key ? '2px solid #2563EB' : '2px solid transparent',
              transition: 'all .15s',
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '16px 20px 8px' }}>アカウント</div>
        <div onClick={handlePlanChange} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', fontSize: 13, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
          <span>👑</span> プランを変更
        </div>
        <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', fontSize: 13, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
          <span>🚪</span> ログアウト
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>E</div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Edo</div>
            <div style={{ fontSize: 10, color: '#7EB3FF' }}>⭐ Premium</div>
          </div>
        </div>
      </div>
    </div>
  )
}
