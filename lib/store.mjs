// Where daily content is kept. Local JSON files for now (dev only);
// this moves to Supabase together with user accounts (build step 3).

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.join(process.cwd(), 'data', 'content')

export async function saveDailyContent(content) {
  const dir = path.join(ROOT, content.date)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'stories.json'), JSON.stringify(content.stories, null, 2))
  for (const [key, edition] of Object.entries(content.editions)) {
    await writeFile(path.join(dir, `${key}.json`), JSON.stringify(edition, null, 2))
  }
  return dir
}

export async function loadEdition(date, key) {
  return JSON.parse(await readFile(path.join(ROOT, date, `${key}.json`), 'utf8'))
}
