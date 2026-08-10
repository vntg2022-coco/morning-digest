import { useRouter } from 'next/router'

export default function Billing() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', padding: '40px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div
          onClick={() => router.push('/dashboard')}
          style={{ fontSize: 13, color: '#5A6A8A', cursor: 'pointer', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          ← ダッシュボードに戻る
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0D1B3E', marginBottom: 24 }}>プランを変更</h1>

        <div style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>現在のプラン</span>
            <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF4FF', color: '#2563EB', padding: '4px 10px', borderRadius: 20 }}>Premium</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0D1B3E', marginBottom: 4 }}>¥980<span style={{ fontSize: 13, fontWeight: 500, color: '#5A6A8A' }}> / 月</span></div>
          <p style={{ fontSize: 12, color: '#5A6A8A', margin: 0 }}>全機能が利用できます(記事数無制限・LINE配信・キーワードアラート)</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B3E', marginBottom: 10 }}>お支払い情報の管理</div>
          <p style={{ fontSize: 12, color: '#5A6A8A', marginBottom: 16 }}>
            Stripeの決済ページで、クレジットカード情報の入力・お支払いができます。
          </p>
          <a
            href="https://buy.stripe.com/test_eVq8wRezBcGFa5I57T2Fa00"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', width: '100%', padding: '13px', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
          >
            Stripeで支払う
          </a>
        </div>
      </div>
    </div>
  )
}
