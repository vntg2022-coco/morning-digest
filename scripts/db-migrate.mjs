// Applies supabase/migrations/*.sql that haven't run yet, in filename order,
// through the Supabase Management API (needs SUPABASE_ACCESS_TOKEN).
// Usage: npm run db:migrate            apply pending migrations
//        npm run db:migrate -- --dry   list pending migrations only

import { readdir, readFile } from 'node:fs/promises'

const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://missing').hostname.split('.')[0]
if (!token) throw new Error('SUPABASE_ACCESS_TOKEN is not set (npm run set-key -- SUPABASE_ACCESS_TOKEN)')

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`Supabase query failed (HTTP ${res.status}): ${body}`)
  return JSON.parse(body)
}

await query(`create table if not exists public.schema_migrations (
  name text primary key, applied_at timestamptz not null default now());
alter table public.schema_migrations enable row level security;`)

const applied = new Set((await query('select name from public.schema_migrations')).map(r => r.name))
const files = (await readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()
const pending = files.filter(f => !applied.has(f))

if (pending.length === 0) console.log('Database is up to date.')
for (const file of pending) {
  if (process.argv.includes('--dry')) {
    console.log(`pending: ${file}`)
    continue
  }
  const sql = await readFile(`supabase/migrations/${file}`, 'utf8')
  const name = file.replace(/'/g, "''")
  await query(`begin;\n${sql}\ninsert into public.schema_migrations (name) values ('${name}');\ncommit;`)
  console.log(`applied: ${file}`)
}
