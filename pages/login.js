import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AuthLayout from '../components/AuthLayout'
import { getSupabaseBrowser } from '../lib/supabase/browser'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (router.query.confirm === 'failed') {
      setError('That confirmation link has expired or was already used. Log in, or sign up again.')
    }
  }, [router.query.confirm])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message === 'Invalid login credentials' ? 'That email and password don’t match.' : error.message)
    router.push('/dashboard')
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back. Your morning stories are waiting.">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="note">
        New here?{' '}
        <Link href="/signup" legacyBehavior>
          <a>Start your free trial</a>
        </Link>
      </p>
    </AuthLayout>
  )
}
