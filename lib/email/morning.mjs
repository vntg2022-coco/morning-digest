// The morning email: "your stories are here", today's headlines per learning
// language, and a button to the News box. Email-safe HTML (tables, inline styles)
// plus a plain-text version.

import { LANGUAGE_BY_CODE } from '../languages.mjs'

const INK = '#121212'
const MUTED = '#5a5a5a'
const RULE = '#dfdfdf'
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Arial, sans-serif"

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// sections: [{ lang, level, articles: [{ topic, headline, translation }] }]
export function renderMorningEmail({ localDate, sections, chooseOne, newsBoxUrl, settingsUrl, unsubscribeUrl, postalAddress }) {
  const dateLabel = new Date(`${localDate}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const langNames = sections.map(s => LANGUAGE_BY_CODE[s.lang].name)
  const subject = `Good morning! Today's stories in ${langNames.join(' & ')}`
  const preheader = sections[0]?.articles[0]?.headline ?? 'Your stories are here.'

  const sectionHtml = sections
    .map(s => {
      const lang = LANGUAGE_BY_CODE[s.lang]
      const items = s.articles
        .map(
          (a, i) => `<tr><td style="padding:14px 0;border-top:1px solid ${RULE}">
            <div style="font:700 11px ${SANS};letter-spacing:.06em;text-transform:uppercase;color:${MUTED}">${i + 1} · ${esc(a.topic)}</div>
            <div dir="${lang.rtl ? 'rtl' : 'ltr'}" lang="${s.lang}" style="font:400 21px/1.3 ${SERIF};color:${INK};margin:4px 0">${esc(a.headline)}</div>
            <div style="font:400 14px/1.5 ${SANS};color:${MUTED}">${esc(a.translation)}</div>
          </td></tr>`
        )
        .join('')
      const button = newsBoxUrl(s.lang)
      return `<tr><td style="padding:24px 0 8px">
          <div style="font:700 13px ${SANS};letter-spacing:.04em;text-transform:uppercase;color:${INK}">${esc(lang.name)} · ${esc(s.level)}</div>
        </td></tr>
        ${items}
        <tr><td style="padding:16px 0 8px">
          <a href="${esc(button)}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font:700 15px ${SANS};padding:13px 22px;border-radius:3px">Read in ${esc(lang.name)} →</a>
        </td></tr>`
    })
    .join('')

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f0eee9">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0eee9"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid ${RULE}">
  <tr><td style="padding:24px 28px 0;text-align:center;border-bottom:1px solid ${INK}">
    <div style="font:700 28px ${SERIF};color:${INK}">Good Morning Digest</div>
    <div style="font:400 13px ${SANS};color:${MUTED};padding:6px 0 14px">${esc(dateLabel)}</div>
  </td></tr>
  <tr><td style="padding:8px 28px 0">
    <p style="font:400 16px/1.6 ${SANS};color:${INK};margin:16px 0 0">Good morning! Your stories are here.${
      chooseOne ? ' Pick the one you want to read today.' : ''
    }</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${sectionHtml}</table>
  </td></tr>
  <tr><td style="padding:20px 28px 26px;border-top:1px solid ${RULE};font:400 12px/1.6 ${SANS};color:${MUTED}">
    Stories are retold for language learners from reporting by their original publishers, linked in each story.<br>
    You get this email because you signed up for Good Morning Digest.
    <a href="${esc(settingsUrl)}" style="color:${MUTED}">Change delivery time</a> ·
    <a href="${esc(unsubscribeUrl)}" style="color:${MUTED}">Turn off morning emails</a>
    ${postalAddress ? `<br>${esc(postalAddress)}` : ''}
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const text = [
    `Good Morning Digest — ${dateLabel}`,
    '',
    `Good morning! Your stories are here.${chooseOne ? ' Pick the one you want to read today.' : ''}`,
    ...sections.flatMap(s => [
      '',
      `${LANGUAGE_BY_CODE[s.lang].name} (${s.level})`,
      ...s.articles.map((a, i) => `${i + 1}. ${a.headline}\n   ${a.translation}`),
      `Read: ${newsBoxUrl(s.lang)}`,
    ]),
    '',
    `Change delivery time: ${settingsUrl}`,
    `Turn off morning emails: ${unsubscribeUrl}`,
    postalAddress ?? '',
  ].join('\n')

  return { subject, html, text }
}
