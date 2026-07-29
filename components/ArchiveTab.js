import { useState } from 'react'

const ARCHIVE = [
  { date: 27, month: 'JUL', source: 'WSJ', cat: '経済・金融', en: 'Fed Signals Rate Cut Amid Slowing Inflation Data', ja: 'FRB、インフレ鈍化データを受け利下げ示唆' },
  { date: 26, month: 'JUL', source: 'NYT', cat: 'テクノロジー', en: 'AI Regulation Framework Adopted by 40 Nations', ja: '40カ国がAI規制の枠組みを採択' },
  { date: 25, month: 'JUL', source: 'Guardian', cat: '社会・環境', en: 'Amazon Deforestation Hits Decade Low Under New Policy', ja: '新政策でアマゾンの森林破壊が10年ぶりの低水準に' },
  { date: 24, month: 'JUL', source: 'Reuters', cat: '政治・外交', en: 'G7 Leaders Reach Climate Agreement in Tokyo Summit', ja: 'G7首脳、東京サミットで気候合意に達する' },
  { date: 23, month: 'JUL', source: 'BBC', cat: '経済・金融', en: 'Global EV Sales Surpass Fossil Fuel Cars for First Time', ja: 'EV販売台数が初めて化石燃料車を上回る' },
  { date: 22, month: 'JUL', source: 'AP', cat: 'テクノロジー', en: 'SpaceX Completes First Commercial Moon Landing', ja: 'スペースX、初の商業月面着陸を完了' },
]

const CATEGORIES = ['すべて', '政治・外交', '経済・金融', 'テクノロジー', '社会・環境']

export default function ArchiveTab() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('すべて')

  const filtered = ARCHIVE.filter(n => {
    const matchCat = activeFilter === 'すべて' || n.cat === activeFilter
    const matchSearch = n.en.toLowerCase().includes(search.toLowerCase()) || n.ja.includes(search)
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>📂 アーカイブ検索</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E0E6F0', borderRadius: 8, padding: '8px 14px' }}>
          <span style={{ color: '#888', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="キーワードで検索..."
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#333', width: 200, background: 'transparent' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: `1px solid ${activeFilter === cat ? '#2563EB' : '#E0E6F0'}`, background: activeFilter === cat ? '#EFF4FF' : '#fff', color: activeFilter === cat ? '#2563EB' : '#5A6A8A', cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888', fontSize: 14 }}>該当する記事が見つかりませんでした</div>
        ) : filtered.map((n, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E0E6F0'}
          >
            <div style={{ textAlign: 'center', flexShrink: 0, width: 44 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0D1B3E', lineHeight: 1 }}>{n.date}</div>
              <div style={{ fontSize: 10, color: '#5A6A8A', textTransform: 'uppercase' }}>{n.month}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.06em' }}>{n.source}</span>
                <span style={{ fontSize: 10, color: '#888', background: '#F7F8FC', border: '1px solid #E0E6F0', padding: '2px 8px', borderRadius: 10 }}>{n.cat}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E', lineHeight: 1.4, marginBottom: 3 }}>{n.en}</div>
              <div style={{ fontSize: 12, color: '#5A6A8A', lineHeight: 1.4 }}>{n.ja}</div>
            </div>
            <div style={{ color: '#D0D7E5', fontSize: 18, flexShrink: 0, marginTop: 4 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
