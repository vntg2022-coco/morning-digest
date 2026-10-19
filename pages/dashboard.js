// Signed-in home. For now it confirms the reader's setup; the News box reader
// with today's stories replaces this in build step 4.

import { useRouter } from 'next/router'
import AuthLayout from '../components/AuthLayout'
import { LANGUAGE_BY_CODE } from '../lib/languages.mjs'
import { PLANS, currentPlan } from '../lib/plans.mjs'
import { getSupabaseBrowser } from '../lib/supabase/browser'
import { requireUser } from '../lib/supabase/server'

export async function getServerSideProps(ctx) {
  const auth = await requireUser(ctx)
  if (auth.redirect) return auth
  if (!auth.profile?.onboarded_at) return { redirect: { destination: '/onboarding', permanent: false } }
  return { props: { email: auth.user.email, profile: auth.profile, languages: auth.languages } }
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export default function Dashboard({ email, profile, languages }) {
  const router = useRouter()
  const plan = currentPlan(profile)
  const trialEnds = new Date(profile.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  async function logOut() {
    await getSupabaseBrowser().auth.signOut()
    router.push('/')
  }

  return (
    <AuthLayout title="You're all set" subtitle={`Your first stories arrive tomorrow at ${formatTime(profile.delivery_time)}.`}>
      <dl>
        <dt>Account</dt>
        <dd>{email}</dd>
        <dt>Plan</dt>
        <dd>
          {PLANS[plan].label}
          {plan === 'trial' && ` — ends ${trialEnds}`}
        </dd>
        <dt>Native language</dt>
        <dd>{LANGUAGE_BY_CODE[profile.native_lang]?.name}</dd>
        <dt>Learning</dt>
        <dd>
          {languages.map(l => `${LANGUAGE_BY_CODE[l.lang]?.name} (${l.level})`).join(', ')}
        </dd>
        <dt>Delivery</dt>
        <dd>
          {formatTime(profile.delivery_time)} · {profile.timezone.replace(/_/g, ' ')}
        </dd>
      </dl>
      <button type="button" className="btn" onClick={logOut}>
        Log out
      </button>
      <style jsx>{`
        dl {
          background: #fff;
          border: 1px solid #dfdfdf;
          border-radius: 4px;
          padding: 8px 20px;
          margin: 0;
        }
        dt {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #5a5a5a;
          margin-top: 14px;
        }
        dd {
          margin: 4px 0 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 16px;
        }
        dd:last-child {
          border-bottom: none;
        }
      `}</style>
    </AuthLayout>
  )
}
