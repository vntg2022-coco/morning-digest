import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            onClick={() => router.push('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563EB' }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0D1B3E' }}>Morning Digest</span>
          </div>
          <p style={{ fontSize: 13, color: '#5A6A8A', margin: 0 }}>世界のニュースを毎朝あなたへ</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #E0E6F0', borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0D1B3E', marginBottom: 24, textAlign: 'center' }}>ログイン</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#5A6A8A', display: 'block', marginBottom: 6 }}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E6F0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1A1A2E' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#5A6A8A', display: 'block', marginBottom: 6 }}>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E6F0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1A1A2E' }}
              />
            </div>
            {error && (
              <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 16, marginTop: -8 }}>{error}</p>
            )}
            <button
              type="submit"
              style={{ width: '100%', padding: '13px', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? '...' : 'ログイン'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#5A6A8A' }}>
            アカウントをお持ちでない方は{' '}
            <span onClick={() => router.push('/signup')} style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>新規登録</span>
          </p>
        </div>
      </div>
    </div>
  )
}
