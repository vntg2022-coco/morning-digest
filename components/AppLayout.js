// Frame for signed-in pages: newspaper-style masthead, section nav, content.

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getSupabaseBrowser } from '../lib/supabase/browser'

const NAV = [
  ['/dashboard', 'Today'],
  ['/archive', 'Archive'],
  ['/vocab', 'Vocab list'],
  ['/settings', 'Settings'],
]

export default function AppLayout({ title, children, wide = false }) {
  const router = useRouter()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  async function logOut() {
    await getSupabaseBrowser().auth.signOut()
    router.push('/')
  }

  return (
    <div className="page">
      <Head>
        <title>{`${title} · Good Morning Digest`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header>
        <div className="top">
          <span className="date">{today}</span>
          <button type="button" className="logout" onClick={logOut}>
            Log out
          </button>
        </div>
        <Link href="/dashboard" legacyBehavior>
          <a className="logo">Good Morning Digest</a>
        </Link>
        <nav>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} legacyBehavior>
              <a className={router.pathname === href ? 'on' : ''}>{label}</a>
            </Link>
          ))}
        </nav>
      </header>
      <main className={wide ? 'wide' : ''}>{children}</main>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #fff;
          color: #121212;
        }
        header {
          border-bottom: 1px solid #121212;
          text-align: center;
          padding: 10px 16px 0;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          font-size: 12px;
          color: #5a5a5a;
        }
        .logout {
          background: none;
          border: none;
          font: inherit;
          color: #5a5a5a;
          cursor: pointer;
          text-decoration: underline;
        }
        .logo {
          display: inline-block;
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 700;
          font-size: 34px;
          color: #121212;
          text-decoration: none;
          margin: 6px 0 10px;
        }
        nav {
          display: flex;
          justify-content: center;
          gap: 28px;
          border-top: 1px solid #dfdfdf;
          padding: 10px 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        nav a {
          font-size: 13px;
          font-weight: 600;
          color: #121212;
          text-decoration: none;
        }
        nav a.on {
          text-decoration: underline;
          text-underline-offset: 6px;
        }
        main {
          max-width: 980px;
          margin: 0 auto;
          padding: 28px 16px 80px;
        }
        main.wide {
          max-width: 1200px;
        }
        @media (max-width: 600px) {
          .logo {
            font-size: 24px;
          }
          nav {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  )
}
