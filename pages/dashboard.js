import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import HomeTab from '../components/HomeTab'
import ArchiveTab from '../components/ArchiveTab'
import SettingsTab from '../components/SettingsTab'

const TAB_TITLES = {
  home: '📰 今日のニュース',
  archive: '📂 アーカイブ',
  settings: '⚙️ 配信設定',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F8FC' }}>
      <Sidebar active={activeTab} onNav={setActiveTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E0E6F0', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0D1B3E' }}>{TAB_TITLES[activeTab]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF4FF', color: '#2563EB', padding: '4px 10px', borderRadius: 20 }}>Premium</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E0E6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15 }}>🔔</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'archive' && <ArchiveTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}
