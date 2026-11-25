import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AuthLayout from '../components/AuthLayout'
import { getSupabaseBrowser } from '../lib/supabase/browser'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    setLoading(true)
    const { data, error } = await getSupabaseBrowser().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) return setError(error.message)
    // With email confirmation on, there is no session until the link is clicked.
    if (data.session) router.push('/onboarding')
    else setSentTo(email)
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`We sent a confirmation link to ${sentTo}. Open it to finish creating your account.`}>
        <p className="note">
          Wrong address?{' '}
          <button type="button" className="link" onClick={() => setSentTo('')}>
            Start over
          </button>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Try today’s stories free" subtitle="No card needed. Read today’s 3 stories with every Premium feature until tomorrow morning.">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="note">
        Already have an account?{' '}
        <Link href="/login" legacyBehavior>
          <a>Log in</a>
        </Link>
      </p>
    </AuthLayout>
  )
}
