// Fetches today's top US headlines from GNews.
// Docs: https://gnews.io/docs/v4#top-headlines-endpoint

const GNEWS_URL = 'https://gnews.io/api/v4/top-headlines'

export async function fetchTopHeadlines({ category = 'general', max = 10 } = {}) {
  const apiKey = process.env.GNEWS_API_KEY
  if (!apiKey) throw new Error('GNEWS_API_KEY is not set')

  const params = new URLSearchParams({ category, lang: 'en', country: 'us', max: String(max), apikey: apiKey })
  const res = await fetch(`${GNEWS_URL}?${params}`)
  if (!res.ok) {
    throw new Error(`GNews request failed: HTTP ${res.status} ${await res.text()}`)
  }
  const data = await res.json()

  return data.articles
    .filter(a => a.title && a.description)
    .map(a => ({
      title: a.title,
      description: a.description,
      // GNews returns a truncated excerpt here, not the full article.
      content: a.content ?? '',
      url: a.url,
      source: a.source?.name ?? '',
      publishedAt: a.publishedAt,
    }))
}
