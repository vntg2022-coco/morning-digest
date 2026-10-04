# CLAUDE.md

Good Morning Digest: a language-learning news service for Americans. Every morning it fetches news (GNews API), has Claude summarize it in the language the user is learning (e.g. Spanish, Japanese) at their level with an English translation side by side, and emails it. Target market is the US, so user-facing copy is in English. The owner communicates in Japanese.

## Commands
- `npm run dev` — dev server on :3000
- `npm run build` — run before saying a change is done; catches build errors
- `npm run lint` — ESLint (next/core-web-vitals)

## Stack
- Next.js 14 Pages Router, React 18, plain JavaScript (no TypeScript yet)
- Styling is mostly inline `style={{}}` objects; Tailwind is installed but barely used. Brand colors: navy `#0D1B3E`, accent `#2563EB`.
- Deployed on Vercel from GitHub `vntg2022-coco/morning-digest`, branch `main`.

## State of the code
- Everything is UI only. News items, stats, and the user name are hardcoded in `components/HomeTab.js` and `components/ArchiveTab.js`.
- Login/signup only redirect to `/dashboard`; there is no auth or DB yet.
- `pages/billing.js` links to a Stripe **test-mode** payment link.
- The old Make (NewsAPI → Claude → Gmail) pipeline is being replaced by code in this repo. See README for the planned architecture.

## Rules
- Secrets go in `.env.local` (gitignored). Add every new variable to `.env.example`.
- News: store and show summaries plus a link to the original article. Never republish full article text.
- Don't commit to `main` directly; use a branch.
