import { useState } from 'react'

const CATEGORIES = ['すべて', '政治・外交', '経済・金融', 'テクノロジー', '社会・環境']

const NEWS = [
  { date: 28, month: 'JUL', source: 'Reuters', cat: '政治・外交', en: 'Ukraine-Russia Peace Talks Enter Critical Phase in Istanbul', ja: 'ウクライナ・ロシア和平交渉、イスタンブールで重大局面に', summary_en: 'Negotiators from Ukraine and Russia convened for a third consecutive day of talks in Istanbul. Ukrainian officials indicated conditional willingness to accept a temporary halt to hostilities. The US and NATO allies have pledged economic incentives tied to any agreement reached.', summary_ja: 'ウクライナとロシアの交渉団がイスタンブールで3日連続の協議を行った。ウクライナ側は条件付きで一時的な戦闘停止を受け入れる可能性を示唆した。米国とNATO同盟国は合意達成に伴う経済的支援を約束している。' },
  { date: 28, month: 'JUL', source: 'AP', cat: '社会・環境', en: 'Extreme Heat Emergency Declared Across Southern Europe', ja: '南欧全域で記録的熱波による緊急事態宣言', summary_en: 'A severe heat wave has pushed temperatures above 47°C in parts of Spain, Italy, and Greece. Hospitals are reporting a surge in heat-related admissions. The WHO warned this summer is tracking as the hottest on record for the Mediterranean basin.', summary_ja: 'スペイン、イタリア、ギリシャの一部で気温が47度を超える激しい熱波が到来した。病院では熱中症関連の入院患者が急増している。WHOは今夏の地中海沿岸地域の気温が観測史上最高を更新するペースだと警告した。' },
  { date: 28, month: 'JUL', source: 'BBC', cat: '政治・外交', en: 'India and China Sign Landmark Border Demarcation Agreement', ja: 'インドと中国、歴史的な国境画定協定に署名', summary_en: 'India and China finalized a historic border agreement in Beijing. The deal includes mutual troop withdrawal schedules from contested areas. The agreement has been cautiously welcomed by regional neighbors and Western governments.', summary_ja: 'インドと中国は北京で歴史的な国境協定を締結した。協定には複数の係争地域からの相互撤兵スケジュールが含まれる。周辺諸国や西側諸国の政府はこの合意を慎重に歓迎している。' },
  { date: 28, month: 'JUL', source: 'Nikkei', cat: '経済・金融', en: 'Global Semiconductor Shortage Eases as New Fabs Come Online', ja: '新工場の稼働で世界的な半導体不足が緩和', summary_en: 'Major new semiconductor fabrication plants in Japan, the US, and Germany began full-scale production. Lead times for advanced processors have dropped to their lowest level in four years. Governments that subsidized these facilities are pointing to this as a validation of strategic investment.', summary_ja: '日本、米国、ドイツで新設された大規模半導体製造工場が本格稼働を開始した。先端プロセッサの納期は4年ぶりの短さに縮まった。産業政策により補助金を投じた各国政府は今回の動向を戦略的投資の正当化として強調している。' },
]

export default function HomeTab() {
  const [activeFilter, setActiveFilter] = useState('すべて')
  const [selectedNews, setSelectedNews] = useState(null)
  const [lang, setLang] = useState('both')

  const filtered = activeFilter === 'すべて' ? NEWS : NEWS.filter(n => n.cat === activeFilter)

  if (selectedNews) {
    return (
      <div style={{ padding: 28 }}>
        <button onClick={() => setSelectedNews(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
          ← 一覧に戻る
        </button>
        <div style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 14, padding: 28, maxWidth: 680 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{selectedNews.source} · {selectedNews.cat}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D1B3E', lineHeight: 1.4, marginBottom: 6 }}>{selectedNews.en}</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>{selectedNews.ja}</p>

          {/* Lang toggle */}
          <div style={{ display: 'flex', border: '1px solid #E0E6F0', borderRadius: 8, width: 'fit-content', overflow: 'hidden', marginBottom: 20 }}>
            {['en', 'ja', 'both'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer', background: lang === l ? '#0D1B3E' : '#fff', color: lang === l ? '#fff' : '#5A6A8A' }}>
                {l === 'en' ? 'English' : l === 'ja' ? '日本語' : '英日対訳'}
              </button>
            ))}
          </div>

          {(lang === 'en' || lang === 'both') && (
            <div style={{ marginBottom: lang === 'both' ? 16 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', marginBottom: 6 }}>ENGLISH SUMMARY</div>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#333' }}>{selectedNews.summary_en}</p>
            </div>
          )}
          {(lang === 'ja' || lang === 'both') && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0D1B3E', marginBottom: 6 }}>日本語要約</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#444' }}>{selectedNews.summary_ja}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: '配信日数', val: '42', sub: '日連続' },
          { label: '読んだ記事', val: '168', sub: 'トータル' },
          { label: '今日の配信', val: '✓', sub: '7:00 AM に配信済み', accent: true },
          { label: '次回配信', val: '明朝', sub: '7:00 AM' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: '#5A6A8A', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: s.accent ? '#2563EB' : '#0D1B3E', lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#5A6A8A' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>今日のニュース — July 28, 2026</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: `1px solid ${activeFilter === cat ? '#2563EB' : '#E0E6F0'}`, background: activeFilter === cat ? '#EFF4FF' : '#fff', color: activeFilter === cat ? '#2563EB' : '#5A6A8A', cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* News list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((n, i) => (
          <div key={i} onClick={() => setSelectedNews(n)} style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', transition: 'border-color .15s' }}
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
