import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Collage from '../components/landing/Collage'
import Mailbox from '../components/landing/Mailbox'
import WordDemo from '../components/landing/WordDemo'
import SampleViewer from '../components/landing/SampleViewer'
import { LANGUAGES } from '../lib/languages.mjs'

const TAGLINE = 'Language learning is the key to connecting with the world.'

// Hidden until we have real quotes from real users (no made-up testimonials).
const TESTIMONIALS = []

const PLANS = [
  {
    name: 'Standard',
    price: '$4.99',
    features: ['Choose 1 of 3 stories every day', '1 learning language', 'Side-by-side translation', 'Tap any word for its meaning'],
  },
  {
    name: 'Premium',
    price: '$9.99',
    featured: true,
    features: ['Read all 3 stories every day', 'Up to 3 learning languages', 'Personal vocab list', 'Full archive of past stories'],
  },
]

const NAV = [
  ['How it works', '#how'],
  ['Languages', '#languages'],
  ['Try a sample', '#sample'],
  ['Pricing', '#pricing'],
]

export default function LandingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const goSignup = useCallback(() => router.push('/signup'), [router])

  // If Supabase sends an email-confirmation link back to the site root, finish it there.
  useEffect(() => {
    const { code } = router.query
    if (code) router.replace(`/auth/callback?code=${encodeURIComponent(code)}`)
  }, [router])

  return (
    <div className="page">
      <Head>
        <title>Good Morning Digest — learn a language with the morning news</title>
        <meta name="description" content="Every morning, three news stories in the language you are learning, side by side with your own. 12 languages, 3 levels." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="header">
        <div className="wrap bar">
          <a href="#top" className="logo">
            <span className="dot" /> Good Morning Digest
          </a>
          <nav className="nav">
            {NAV.map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
            <Link href="/login" legacyBehavior passHref><a>Log in</a></Link>
          </nav>
          <button type="button" className="menu-btn" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" onClick={() => setMenuOpen(false)}>
            {NAV.map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
            <Link href="/login" legacyBehavior passHref><a>Log in</a></Link>
            <Link href="/signup" legacyBehavior passHref><a className="mobile-cta">Start free trial</a></Link>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="hero">
        <Collage />
        <div className="wrap hero-inner">
          <div className="hero-art">
            <Mailbox onUnlock={goSignup} size={260} />
            <div className="key-hint">Tap the key to begin</div>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Your morning news, in the language you&apos;re learning</p>
            <h1>“{TAGLINE}”</h1>
            <p className="lead">
              Every morning, three real news stories arrive in your learning language, at your level, side by side with your own language.
            </p>
            <div className="ctas">
              <Link href="/signup" legacyBehavior passHref><a className="btn primary">Start your 7-day free trial</a></Link>
              <Link href="/login" legacyBehavior passHref><a className="btn ghost">Log in</a></Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section">
        <div className="wrap">
          <p className="kicker">How it works</p>
          <h2>Read the news. Learn the words. Every morning.</h2>
          <ol className="steps">
            <li><b>6:00 AM</b> An email tells you today&apos;s stories have arrived (you pick the time).</li>
            <li><b>Open your News box</b> Three stories in your learning language, at your level.</li>
            <li><b>Read side by side</b> Your own language right alongside, so you never get stuck.</li>
          </ol>
          <div className="feature">
            <div className="feature-copy">
              <h3>Tap any word you don&apos;t know</h3>
              <p>See its meaning and an example sentence instantly. Every word you tap is saved to your vocab list, so you can review it later.</p>
            </div>
            <WordDemo />
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="section tint">
        <div className="wrap center">
          <p className="kicker">12 languages</p>
          <h2>Pick your language. Learn any of the others.</h2>
          <p className="sub">Choose your native language, then add the languages you want to learn. Three levels: beginner, intermediate and advanced.</p>
          <div className="badges">
            {LANGUAGES.map((l, i) => (
              <span key={l.code} className="badge" style={{ transform: `rotate(${((i * 37) % 11) - 5}deg)` }}>
                <b lang={l.code}>{l.native}</b>
                <small>{l.name}</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sample */}
      <section id="sample" className="section">
        <div className="wrap center">
          <p className="kicker">Try a sample</p>
          <h2>See how your morning will look</h2>
          <SampleViewer />
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="section tint">
          <div className="wrap center">
            <p className="kicker">Readers</p>
            <h2>What learners say</h2>
            <div className="quotes">
              {TESTIMONIALS.map(t => (
                <figure key={t.name} className="quote">
                  <blockquote>“{t.quote}”</blockquote>
                  <figcaption>{t.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="section tint">
        <div className="wrap center">
          <p className="kicker">Pricing</p>
          <h2>Try Premium free for 7 days</h2>
          <p className="sub">After the trial, keep the plan that fits you. Cancel anytime.</p>
          <div className="plans">
            {PLANS.map(p => (
              <div key={p.name} className={`plan ${p.featured ? 'featured' : ''}`}>
                {p.featured && <span className="pill">Recommended</span>}
                <div className="plan-name">{p.name}</div>
                <div className="price">{p.price}<span> / month</span></div>
                <ul>
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/signup" legacyBehavior passHref><a className={`btn ${p.featured ? 'light' : 'primary'}`}>Start free trial</a></Link>
              </div>
            ))}
          </div>
          <p className="fine">Want more languages? Add one for a one-time $4.99. Your monthly price stays the same.</p>
        </div>
      </section>

      {/* Closing */}
      <section className="section closing">
        <div className="wrap closing-inner">
          <Mailbox interactive={false} size={180} />
          <div>
            <h2>“{TAGLINE}”</h2>
            <Link href="/signup" legacyBehavior passHref><a className="btn primary">Start your free trial</a></Link>
            <a href="#top" className="back">Back to top ↑</a>
          </div>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Good Morning Digest</footer>

      <style jsx>{`
        .page { color: #121212; background: #fff; }
        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
        .center { text-align: center; }

        .header { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(6px); border-bottom: 1px solid #dfdfdf; }
        .bar { display: flex; align-items: center; justify-content: space-between; height: 60px; }
        .logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-serif), Georgia, 'Times New Roman', serif; font-weight: 700; font-size: 18px; color: #121212; text-decoration: none; }
        .dot { width: 9px; height: 9px; border-radius: 50%; background: #121212; }
        .nav { display: flex; gap: 22px; }
        .nav a { font-size: 14px; color: #5a5a5a; text-decoration: none; }
        .nav a:hover { color: #121212; }
        .menu-btn { display: none; background: none; border: none; padding: 8px; cursor: pointer; }
        .menu-btn span { display: block; width: 22px; height: 2px; background: #121212; margin: 4px 0; }
        .mobile-nav { display: flex; flex-direction: column; padding: 8px 20px 16px; border-top: 1px solid #dfdfdf; }
        .mobile-nav a { padding: 10px 0; color: #121212; text-decoration: none; font-size: 15px; }
        .mobile-cta { font-weight: 700; color: #326891 !important; }

        .hero { position: relative; overflow: hidden; background: #f0eee9; padding: 56px 0 72px; }
        .hero-inner { position: relative; display: grid; grid-template-columns: 300px 1fr; gap: 48px; align-items: center; }
        .hero-art { display: flex; flex-direction: column; align-items: center; background: rgba(240, 238, 233, 0.85); border-radius: 24px; padding: 16px; }
        .key-hint { font-size: 12px; color: #8c6f12; margin-top: 4px; }
        .hero-copy { background: rgba(240, 238, 233, 0.85); border-radius: 16px; padding: 8px 12px; }
        .eyebrow { font-size: 13px; font-weight: 700; color: #121212; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 14px; }
        h1 { font-family: var(--font-serif), Georgia, 'Times New Roman', serif; font-size: 48px; font-weight: 400; line-height: 1.15; letter-spacing: -0.01em; margin: 0 0 20px; }
        .lead { font-size: 17px; line-height: 1.7; color: #333333; margin: 0 0 26px; max-width: 560px; }
        .ctas { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn { display: inline-block; padding: 14px 24px; border-radius: 3px; font-size: 16px; font-weight: 700; text-decoration: none; }
        .btn.primary { background: #000; color: #fff; }
        .btn.primary:hover { background: #333; }
        .btn.ghost { border: 1px solid #121212; color: #121212; }
        .btn.light { background: #fff; color: #121212; }

        .section { padding: 80px 0; scroll-margin-top: 60px; }
        .tint { background: #f7f7f5; }
        .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #121212; margin: 0 0 10px; }
        h2 { font-family: var(--font-serif), Georgia, 'Times New Roman', serif; font-size: 34px; font-weight: 400; line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 16px; }
        .sub { color: #5a5a5a; font-size: 16px; line-height: 1.7; max-width: 620px; margin: 0 auto 32px; }

        .steps { list-style: none; padding: 0; margin: 28px 0 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; counter-reset: s; }
        .steps li { counter-increment: s; border: 1px solid #dfdfdf; border-radius: 12px; padding: 20px; font-size: 15px; line-height: 1.6; color: #333333; }
        .steps li::before { content: counter(s); display: inline-flex; width: 26px; height: 26px; border-radius: 50%; background: #121212; color: #fff; font-size: 13px; align-items: center; justify-content: center; margin-bottom: 10px; }
        .steps b { display: block; color: #121212; margin-bottom: 4px; }
        .feature { display: grid; grid-template-columns: 280px 1fr; gap: 32px; align-items: start; }
        .feature h3 { font-family: var(--font-serif), Georgia, 'Times New Roman', serif; font-size: 24px; margin: 0 0 10px; }
        .feature p { color: #5a5a5a; line-height: 1.7; margin: 0; }

        .badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; max-width: 820px; margin: 0 auto; }
        .badge { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1px solid #dfdfdf; border-radius: 3px; padding: 12px 22px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .badge b { font-size: 18px; }
        .badge small { font-size: 11px; color: #5a5a5a; }

        .quotes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .quote { background: #fff; border: 1px solid #dfdfdf; border-radius: 12px; padding: 20px; margin: 0; text-align: left; }

        .plans { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 720px; margin: 0 auto; text-align: left; }
        .plan { position: relative; background: #fff; border: 1px solid #dfdfdf; border-radius: 4px; padding: 28px; }
        .plan.featured { background: #121212; color: #fff; border-color: #121212; }
        .pill { position: absolute; top: 18px; right: 18px; font-size: 11px; font-weight: 700; background: #fff; color: #121212; padding: 3px 10px; border-radius: 3px; }
        .plan-name { font-size: 14px; font-weight: 600; opacity: 0.8; }
        .price { font-size: 36px; font-weight: 800; margin: 6px 0 16px; }
        .price span { font-size: 14px; font-weight: 500; opacity: 0.7; }
        .plan ul { padding-left: 18px; margin: 0 0 24px; line-height: 2; font-size: 14px; }
        .fine { font-size: 13px; color: #5a5a5a; margin-top: 24px; }

        .closing { background: #f0eee9; }
        .closing-inner { display: flex; align-items: center; justify-content: center; gap: 40px; }
        .closing h2 { max-width: 520px; }
        .back { display: block; margin-top: 16px; font-size: 13px; color: #5a5a5a; }

        .footer { border-top: 1px solid #dfdfdf; padding: 24px; text-align: center; font-size: 12px; color: #5a5a5a; }

        @media (max-width: 860px) {
          .nav { display: none; }
          .menu-btn { display: block; }
          .hero { padding: 32px 0 48px; }
          .hero-inner { grid-template-columns: 1fr; gap: 16px; text-align: center; }
          .ctas { justify-content: center; }
          .lead { margin-left: auto; margin-right: auto; }
          h1 { font-size: 30px; }
          h2 { font-size: 26px; }
          .steps, .quotes, .plans, .feature { grid-template-columns: 1fr; }
          .closing-inner { flex-direction: column; text-align: center; }
          .section { padding: 56px 0; }
        }
      `}</style>
    </div>
  )
}
