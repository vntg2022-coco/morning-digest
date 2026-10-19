# CLAUDE.md

Good Morning Digest: a language-learning news service. Users pick a native language and one or more learning languages from 12, and every morning get an email linking to 3 news articles written in their learning language at their level, shown side by side with a native-language translation, with click-to-define words and a vocab list. Site UI copy is English only. The owner communicates in Japanese.

**`docs/SPEC.md` is the agreed product spec** (plans, pricing, trial, LP sections, build order). Read it before product work and keep it updated when decisions change.

## Commands
- `npm run digest:preview -- es:intermediate:en zh:beginner:ja` — builds today's content for those editions (learning:level:native), saves JSON to `data/content/`, writes tappable HTML to `previews/`. Costs real money (~$0.2 per learning×level, ~$0.1 per edition); the script prints an estimate.
- `npm run set-key -- NAME` / `npm run check-keys` — set/verify keys in `.env.local` without printing them. Never print or log key values.
- `npm run dev` — dev server on :3000
- `npm run verify` — lint + production build into `.next-verify/`; run before saying a change is done. Use this instead of `npm run build` while the dev server is running (a plain build overwrites the dev server's `.next`).
- `npm run lint` — ESLint (next/core-web-vitals)

## Stack
- Next.js 14 Pages Router, React 18, plain JavaScript (no TypeScript yet)
- Styling is mostly inline `style={{}}` objects; Tailwind is installed but barely used. Look is modeled on the New York Times site: serif headlines `var(--font-serif)` (Source Serif 4), sans body/buttons `var(--font-sans)` (Libre Franklin), text `#121212`, black square-ish buttons, off-white `#f0eee9` backgrounds, link/accent blue `#326891`. Don't use NYT's own fonts, logo or name.
- Deployed on Vercel from GitHub `vntg2022-coco/morning-digest`, branch `main`.

## State of the code
- Content pipeline v2 lives in `lib/pipeline/`: `select.mjs` picks 3 stories a day from GNews headlines (once per day) → `write.mjs` retells each story in the learning language with tappable words + glossary (once per learning language × level, one Claude call per story) → `translate.mjs` adds the native-language translation and word meanings (once per edition = learning × level × native). `daily.mjs` orchestrates and estimates cost. `lib/store.mjs` saves to local `data/content/` for now (moves to Supabase in step 3). `reader-preview.mjs` renders a tappable HTML preview. `/api/cron/digest` builds content for `DIGEST_EDITIONS` but does not save or email yet. `lib/` uses `.mjs` so the same code runs in Next.js and plain Node scripts.
- The landing page (`pages/index.js`, `components/landing/`) follows SPEC.md. The mailbox/key art in `components/landing/Mailbox.js` is a placeholder SVG to be replaced. `lib/languages.mjs` is the single list of the 12 languages.
- Supabase (project ref `mkrgkeotacpqcainvfyk`): schema in `supabase/migrations/*.sql`, applied with `npm run db:migrate` (Management API, needs `SUPABASE_ACCESS_TOKEN`). Never edit an applied migration; add a new numbered file. RLS is on everywhere: the browser can read/update only its own profile and settings; content, picks, vocab and adding languages go through API routes using `createSupabaseAdmin()` after checking the user and plan (`lib/plans.mjs`).
- Auth: email + password via Supabase Auth with cookie sessions (`lib/supabase/`). `/signup` → email link → `/auth/callback` → `/onboarding` (native language, first learning language + level, time zone, delivery time; `/api/onboarding`) → `/dashboard`. Pages that need a user call `requireUser(ctx)` in getServerSideProps.
- Reader (News box): `/dashboard` (today's 3 stories; Standard picks 1 via `/api/pick`), `/read/[id]` (side-by-side reader, `components/Reader.js`, tap a word → meaning; Premium saves to vocab via `/api/vocab`), `/archive`, `/vocab`, `/settings` (`/api/settings`: delivery, native language, add/remove languages within `languageLimit`). Who may open a story is decided only in `lib/access.mjs` (`storyAccess`), server-side. Content queries live in `lib/store.mjs`. Billing (Stripe) is build step 6.

## Rules
- Secrets go in `.env.local` (gitignored). Add every new variable to `.env.example`.
- News: store and show summaries plus a link to the original article. Never republish full article text.
- Don't commit to `main` directly; use a branch.
