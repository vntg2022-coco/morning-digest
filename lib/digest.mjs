// Builds the daily digest: fetch news -> summarize for a level -> render email.

import { fetchTopHeadlines } from './news.mjs'
import { summarizeForLevel } from './summarize.mjs'
import { renderDigestEmail } from './email-template.mjs'

export const ARTICLES_PER_DIGEST = 5

export async function buildDigest({ level = 'intermediate' } = {}) {
  const headlines = await fetchTopHeadlines({ max: 10 })
  if (headlines.length === 0) throw new Error('GNews returned no usable articles')

  const digest = await summarizeForLevel(headlines.slice(0, ARTICLES_PER_DIGEST), level)
  const email = renderDigestEmail(digest)
  return { digest, ...email }
}
