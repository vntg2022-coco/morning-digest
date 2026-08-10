import { useState } from 'react'

const LANGUAGES = ['英語', '中国語', '韓国語', 'フランス語', 'スペイン語', 'ドイツ語', '日本語']
const LEVELS = ['初級', '中級', '上級']

export default function SettingsTab() {
  const [genres, setGenres] = useState({ '政治・外交': true, '経済・金融': true, 'テクノロジー・AI': true, '社会・環境': false, 'スポーツ': false })
  const [channels, setChannels] = useState({ 'メール配信': true, 'LINE配信': true })
  const [learnLang, setLearnLang] = useState('英語')
  const [nativeLang, setNativeLang] = useState('日本語')
  const [level, setLevel] = useState('中級')
  const [saved, setSaved] = useState(false)

  function toggleGenre(key) {
    setGenres(prev => ({ ...prev, [key]: !prev[key] }))
  }
  function toggleChannel(key) {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }))
  }
  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{ width: 36, height: 20, background: on ? '#2563EB' : '#E0E6F0', borderRadius: 10, position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 2, left: on ? 18 : 2, transition: 'left .2s' }} />
    </div>
  )

  const Card = ({ title, children }) => (
    <div style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B3E', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F0F2F7' }}>{title}</div>
      {children}
    </div>
  )

  const Row = ({ label, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#333', borderBottom: '1px solid #F7F8FC' }}>
      <span>{label}</span>
      {right}
    </div>
  )

  const Select = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ color: '#2563EB', fontSize: 12, fontWeight: 500, border: '1px solid #E0E6F0', borderRadius: 6, padding: '4px 8px', background: '#fff', cursor: 'pointer', outline: 'none' }}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  )

  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <Card title="📬 配信設定">
        <Row label="配信時刻" right={<span style={{ color: '#2563EB', fontSize: 12, fontWeight: 500 }}>毎朝 7:00 AM</span>} />
        <Row label="記事件数" right={<span style={{ color: '#2563EB', fontSize: 12, fontWeight: 500 }}>4件</span>} />
        <Row label="要約の長さ" right={<span style={{ color: '#2563EB', fontSize: 12, fontWeight: 500 }}>普通（5〜7行）</span>} />
        <Row label="学ぶ言語" right={<Select value={learnLang} onChange={setLearnLang} options={LANGUAGES} />} />
        <Row label="母国語" right={<Select value={nativeLang} onChange={setNativeLang} options={LANGUAGES} />} />
        <Row label="レベル" right={<Select value={level} onChange={setLevel} options={LEVELS} />} />
        {learnLang === nativeLang && (
          <p style={{ fontSize: 11, color: '#DC2626', margin: '8px 0 0' }}>学ぶ言語と母国語は異なる言語を選んでください</p>
        )}
      </Card>

      <Card title="🌐 興味ジャンル">
        {Object.entries(genres).map(([key, val]) => (
          <Row key={key} label={key} right={<Toggle on={val} onToggle={() => toggleGenre(key)} />} />
        ))}
      </Card>

      <Card title="📲 受け取り方法">
        {Object.entries(channels).map(([key, val]) => (
          <Row key={key} label={key + (key === 'LINE配信' ? '（Premium）' : '')} right={<Toggle on={val} onToggle={() => toggleChannel(key)} />} />
        ))}
      </Card>

      <button onClick={handleSave} style={{ width: '100%', padding: '13px', background: saved ? '#16A34A' : '#0D1B3E', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .2s' }}>
        {saved ? '✓ 保存しました！' : '設定を保存する'}
      </button>
    </div>
  )
}
