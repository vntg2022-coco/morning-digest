# CLAUDE.md

Good Morning Digest: a language-learning news service. Users pick a native language and one or more learning languages from 12, and every morning get an email linking to 3 news articles written in their learning language at their level, shown side by side with a native-language translation, with click-to-define words and a vocab list. Site UI copy is English only. The owner communicates in Japanese.

**`docs/SPEC.md` is the agreed product spec** (plans, pricing, trial, LP sections, build order). Read it before product work and keep it updated when decisions change.

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
- The digest pipeline in `lib/` is v1 (Spanish only, 5 articles, full digest in the email); SPEC.md describes the v2 it is being replaced by. It lives in `lib/` (`news.mjs` → `summarize.mjs` → `email-template.mjs`, orchestrated by `digest.mjs`). `lib/` uses `.mjs` so the same code runs in Next.js and in plain Node scripts. `/api/cron/digest` (Vercel Cron, `vercel.json`) currently emails one test digest to `DIGEST_TEST_TO`.
- The landing page (`pages/index.js`, `components/landing/`) follows SPEC.md. The mailbox/key art in `components/landing/Mailbox.js` is a placeholder SVG to be replaced. `lib/languages.mjs` is the single list of the 12 languages.
- Login, signup, billing and the dashboard are still the old Japanese mock UI. The dashboard uses mock data. News items, stats, and the user name are hardcoded in `components/HomeTab.js` and `components/ArchiveTab.js`.
- Login/signup only redirect to `/dashboard`; there is no auth or DB yet.
- `pages/billing.js` links to a Stripe **test-mode** payment link.

## Rules
- Secrets go in `.env.local` (gitignored). Add every new variable to `.env.example`.
- News: store and show summaries plus a link to the original article. Never republish full article text.
- Don't commit to `main` directly; use a branch.
