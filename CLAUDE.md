# CLAUDE.md

Good Morning Digest: a language-learning news service for Americans. Every morning it fetches news (GNews API), has Claude summarize it in Spanish (the only language at launch) at the learner's level with an English translation side by side, and emails it. Target market is the US, so user-facing copy is in English. The owner communicates in Japanese.

## Commands
- `npm run digest:preview -- beginner|intermediate|advanced` — builds a real digest into `previews/` (costs one GNews + one Claude call)
- `npm run set-key -- NAME` / `npm run check-keys` — set/verify keys in `.env.local` without printing them. Never print or log key values.
- `npm run dev` — dev server on :3000
- `npm run build` — run before saying a change is done; catches build errors
- `npm run lint` — ESLint (next/core-web-vitals)

## Stack
- Next.js 14 Pages Router, React 18, plain JavaScript (no TypeScript yet)
- Styling is mostly inline `style={{}}` objects; Tailwind is installed but barely used. Brand colors: navy `#0D1B3E`, accent `#2563EB`.
- Deployed on Vercel from GitHub `vntg2022-coco/morning-digest`, branch `main`.

## State of the code
- The digest pipeline lives in `lib/` (`news.mjs` → `summarize.mjs` → `email-template.mjs`, orchestrated by `digest.mjs`). `lib/` uses `.mjs` so the same code runs in Next.js and in plain Node scripts. `/api/cron/digest` (Vercel Cron, `vercel.json`) currently emails one test digest to `DIGEST_TEST_TO`.
- The dashboard UI is still mock data. News items, stats, and the user name are hardcoded in `components/HomeTab.js` and `components/ArchiveTab.js`.
- Login/signup only redirect to `/dashboard`; there is no auth or DB yet.
- `pages/billing.js` links to a Stripe **test-mode** payment link.

## Rules
- Secrets go in `.env.local` (gitignored). Add every new variable to `.env.example`.
- News: store and show summaries plus a link to the original article. Never republish full article text.
- Don't commit to `main` directly; use a branch.
