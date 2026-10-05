// Renders a digest as email-safe HTML (tables + inline styles).

const NAVY = '#0D1B3E'
const BLUE = '#2563EB'
const SUBTEXT = '#5A6A8A'
const BORDER = '#E0E6F0'

const LEVEL_LABELS = { beginner: 'Beginner (A2)', intermediate: 'Intermediate (B1)', advanced: 'Advanced (B2–C1)' }

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderArticle(a) {
  const sentences = a.sentences
    .map(
      s => `<p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:${NAVY}">${esc(s.es)}<br>
        <span style="font-size:13px;color:${SUBTEXT}">${esc(s.en)}</span></p>`
    )
    .join('')

  const vocab = a.vocabulary
    .map(v => `<li style="margin:0 0 4px"><b>${esc(v.es)}</b> — ${esc(v.en)}</li>`)
    .join('')

  return `<tr><td style="padding:24px 0;border-top:1px solid ${BORDER}">
    <div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${BLUE};margin-bottom:6px">${esc(a.source)}</div>
    <div style="font-size:19px;font-weight:700;color:${NAVY};line-height:1.35">${esc(a.headline_es)}</div>
    <div style="font-size:13px;color:${SUBTEXT};margin:4px 0 14px">${esc(a.headline_en)}</div>
    ${sentences}
    <div style="background:#F7F8FC;border-radius:8px;padding:12px 16px;margin-top:6px">
      <div style="font-size:11px;font-weight:600;color:${SUBTEXT};margin-bottom:6px">VOCABULARY</div>
      <ul style="margin:0;padding-left:18px;font-size:14px;color:${NAVY}">${vocab}</ul>
    </div>
    <div style="margin-top:10px;font-size:12px"><a href="${esc(a.url)}" style="color:${BLUE}">Read the original article (English) →</a></div>
  </td></tr>`
}

export function renderDigestEmail(digest, { date = new Date() } = {}) {
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const subject = `Buenos días! Your Spanish news for ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid ${BORDER};border-radius:12px">
  <tr><td style="padding:28px 28px 8px">
    <div style="font-size:18px;font-weight:700;color:${NAVY}">Good Morning Digest</div>
    <div style="font-size:13px;color:${SUBTEXT};margin-top:4px">${esc(dateLabel)} · Spanish · ${esc(LEVEL_LABELS[digest.level] ?? digest.level)}</div>
  </td></tr>
  <tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${digest.articles.map(renderArticle).join('')}
  </table></td></tr>
  <tr><td style="padding:20px 28px 28px;font-size:11px;color:${SUBTEXT};line-height:1.6;border-top:1px solid ${BORDER}">
    Summaries are written by AI from short news excerpts; follow the links for the full original reporting.
    Copyright of the original articles belongs to their publishers.
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  return { subject, html }
}
