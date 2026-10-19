// Shared frame for sign-up, log-in and onboarding: masthead, centered card.

import Head from 'next/head'
import Link from 'next/link'

export default function AuthLayout({ title, subtitle, children, wide = false }) {
  return (
    <div className="page">
      <Head>
        <title>{`${title} · Good Morning Digest`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header>
        <Link href="/" legacyBehavior>
          <a className="logo">Good Morning Digest</a>
        </Link>
      </header>
      <main className={wide ? 'wide' : ''}>
        <h1>{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
        {children}
      </main>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f0eee9;
          color: #121212;
        }
        header {
          border-bottom: 1px solid #dfdfdf;
          background: #fff;
          text-align: center;
          padding: 16px;
        }
        .logo {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #121212;
          text-decoration: none;
        }
        main {
          max-width: 440px;
          margin: 0 auto;
          padding: 48px 16px 80px;
        }
        main.wide {
          max-width: 640px;
        }
        h1 {
          font-family: var(--font-serif), Georgia, serif;
          font-weight: 400;
          font-size: 34px;
          line-height: 1.2;
          margin: 0 0 10px;
        }
        .sub {
          color: #5a5a5a;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 28px;
        }
        main :global(label) {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin: 18px 0 6px;
        }
        main :global(input),
        main :global(select) {
          width: 100%;
          font: inherit;
          font-size: 16px;
          padding: 12px 14px;
          border: 1px solid #b8b8b8;
          border-radius: 3px;
          background: #fff;
          color: #121212;
        }
        main :global(input:focus),
        main :global(select:focus) {
          outline: 2px solid #326891;
          outline-offset: 1px;
        }
        main :global(.btn) {
          display: block;
          width: 100%;
          margin-top: 24px;
          padding: 14px;
          border: none;
          border-radius: 3px;
          background: #000;
          color: #fff;
          font: inherit;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }
        main :global(.btn:disabled) {
          background: #8a8a8a;
          cursor: default;
        }
        main :global(.error) {
          color: #b3261e;
          font-size: 14px;
          margin: 14px 0 0;
        }
        main :global(.note) {
          font-size: 14px;
          color: #5a5a5a;
          margin-top: 20px;
          text-align: center;
        }
        main :global(.link) {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: #326891;
          text-decoration: underline;
          cursor: pointer;
        }
        main :global(.note a) {
          color: #326891;
        }
      `}</style>
    </div>
  )
}
