import { useRouter } from 'next/router'

const NAVY = '#0D1B3E'
const BLUE = '#2563EB'
const SUBTEXT = '#5A6A8A'
const BORDER = '#E0E6F0'
const BG = '#F7F8FC'

const STATS = [
  { value: '毎朝', label: '自動配信' },
  { value: '7言語', label: 'から選べる' },
  { value: '5分', label: 'で読める' },
]

const SUPPORTED_LANGUAGES = ['英語', '中国語', '韓国語', 'フランス語', 'スペイン語', 'ドイツ語', '日本語']

const FEATURES = [
  { icon: '🎯', title: '学習レベルに合わせて', desc: '初級〜上級まで、読み手のレベルに合わせて要約の難易度を自動調整します。' },
  { icon: '⏰', title: '毎朝自動配信', desc: 'AIが毎朝ニュースを検索・要約・翻訳し、決まった時刻にお届けします。' },
  { icon: '🗂️', title: 'ジャンル・件数カスタマイズ', desc: '政治・経済・テクノロジーなど興味のあるジャンルと配信件数を自由に設定できます。' },
  { icon: '🏫', title: '塾・学校向け教材データ', desc: '対訳形式なので、そのまま語学の教材・授業のリーディング素材として活用できます。' },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: NAVY, fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: BLUE }} />
            Morning Digest
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span onClick={() => router.push('/login')} style={{ fontSize: 13, color: SUBTEXT, cursor: 'pointer' }}>ログイン</span>
            <button
              onClick={() => router.push('/login')}
              style={{ padding: '9px 18px', background: NAVY, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              無料で始める
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(180deg, ${BG} 0%, #fff 100%)`, padding: '72px 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: BLUE, background: '#EFF4FF', padding: '5px 14px', borderRadius: 20, marginBottom: 20 }}>
            AI × ニュース × 語学学習
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.45, margin: '0 0 14px' }}>
            生きたニュースで、<br />あなたの「学習言語」をマスター。
          </h1>
          <p style={{ fontSize: 16, color: NAVY, fontWeight: 600, lineHeight: 1.7, margin: '0 0 18px' }}>
            AIが選ぶ世界の一報を、日本語対訳とともに。
          </p>
          <p style={{ fontSize: 15, color: SUBTEXT, lineHeight: 1.8, margin: '0 0 28px' }}>
            ロイター・AP通信・BBC・NYTなど主要メディアから、AIが厳選したニュースを日本語対訳で毎朝お届け。
            英語・中国語・韓国語・フランス語・スペイン語・ドイツ語など、学びたい言語を選んで、あなたに合わせたレベルで読めます。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/login')}
              style={{ padding: '13px 26px', background: NAVY, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              無料で始める
            </button>
          </div>

          {/* Supported languages */}
          <div style={{ marginTop: 36 }}>
            <p style={{ fontSize: 11, color: SUBTEXT, fontWeight: 600, letterSpacing: '.06em', marginBottom: 10 }}>対応言語</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <span key={lang} style={{ fontSize: 12, fontWeight: 600, color: NAVY, background: '#fff', border: `1px solid ${BORDER}`, padding: '6px 14px', borderRadius: 20 }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: BG, borderRadius: 12, padding: '20px 8px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{s.value}</div>
              <div style={{ fontSize: 11, color: SUBTEXT, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: BLUE, letterSpacing: '.08em' }}>FEATURES</span>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 0' }}>語学学習にすぐ使える理由</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: SUBTEXT, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: BG, padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: BLUE, letterSpacing: '.08em' }}>PRICING</span>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 40px' }}>シンプルな料金体系</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, textAlign: 'left' }}>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: SUBTEXT, marginBottom: 6 }}>フリー</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>¥0</div>
              <div style={{ fontSize: 13, color: SUBTEXT, lineHeight: 2 }}>
                ・毎朝メール3件配信<br />
                ・多言語対訳ニュース<br />
                ・基本ジャンル設定
              </div>
            </div>
            <div style={{ background: NAVY, borderRadius: 14, padding: 28, color: '#fff', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, background: BLUE, padding: '3px 10px', borderRadius: 20 }}>おすすめ</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#9EB6E8', marginBottom: 6 }}>プレミアム</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>¥980<span style={{ fontSize: 13, fontWeight: 500 }}> / 月</span></div>
              <div style={{ fontSize: 13, color: '#C9D6EF', lineHeight: 2 }}>
                ・記事件数無制限<br />
                ・Webダッシュボード＋アーカイブ検索<br />
                ・LINE配信・キーワードアラート
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px' }}>世界のニュースが、あなたの語学教材になる。</h2>
        <p style={{ fontSize: 14, color: SUBTEXT, margin: '0 0 28px' }}>登録は無料。数十秒で始められます。</p>
        <button
          onClick={() => router.push('/login')}
          style={{ padding: '13px 30px', background: NAVY, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          無料で始める
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '24px', textAlign: 'center', fontSize: 12, color: SUBTEXT }}>
        © {new Date().getFullYear()} Morning Digest
      </div>
    </div>
  )
}
