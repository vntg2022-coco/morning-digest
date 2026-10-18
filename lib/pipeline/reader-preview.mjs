// Renders one edition as a standalone HTML page with tappable words, so the
// pipeline output can be checked in a browser before the real reader page exists.

import { LANGUAGE_BY_CODE } from '../languages.mjs'

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Wraps each marked word of a sentence in a tappable span.
function markup(sentence) {
  let out = ''
  let pos = 0
  for (const w of sentence.words) {
    const at = sentence.text.indexOf(w.surface, pos)
    if (at === -1) continue
    out += esc(sentence.text.slice(pos, at))
    out += `<span class="w" data-lemma="${esc(w.lemma)}">${esc(w.surface)}</span>`
    pos = at + w.surface.length
  }
  return out + esc(sentence.text.slice(pos))
}

export function renderEditionPreview(edition, date) {
  const lang = LANGUAGE_BY_CODE[edition.lang]
  const native = LANGUAGE_BY_CODE[edition.native]

  const articles = edition.articles
    .map((a, i) => {
      const glossary = Object.fromEntries(
        a.glossary.map(g => [g.lemma, { ...g, ...(a.translation.glossary[g.lemma] ?? {}) }])
      )
      const rows = a.sentences
        .map(
          (s, j) => `<div class="row"><p dir="${lang.rtl ? 'rtl' : 'ltr'}" lang="${lang.code}">${markup(s)}</p>
            <p class="tr" dir="${native.rtl ? 'rtl' : 'ltr'}" lang="${native.code}">${esc(a.translation.sentences[j])}</p></div>`
        )
        .join('')
      return `<article data-glossary="${esc(JSON.stringify(glossary))}">
        <div class="meta">${i + 1} · ${esc(a.topic)} · ${esc(a.source)}</div>
        <div class="row head"><h2 dir="${lang.rtl ? 'rtl' : 'ltr'}">${markup(a.headline)}</h2>
          <h2 class="tr" dir="${native.rtl ? 'rtl' : 'ltr'}">${esc(a.translation.headline)}</h2></div>
        ${rows}
        <a href="${esc(a.url)}" target="_blank" rel="noopener">Original article (English) →</a>
      </article>`
    })
    .join('')

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(lang.name)} ${esc(edition.level)} · ${esc(native.name)} — ${esc(date)}</title>
<style>
body{margin:0;background:#f0eee9;color:#121212;font-family:'Helvetica Neue',Arial,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px 16px 120px}
header{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:16px}
article{background:#fff;border:1px solid #dfdfdf;border-radius:4px;padding:24px;margin-bottom:20px}
.meta{font-size:12px;color:#5a5a5a;margin-bottom:10px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:28px;border-bottom:1px solid #f0f0f0;padding:8px 0}
.row.head{border:none}
h2{font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0}
p{margin:0;font-size:18px;line-height:1.7;font-family:Georgia,serif}
.tr{color:#5a5a5a;font-size:15px;font-family:inherit}
h2.tr{font-size:18px}
.w{border-bottom:1px dotted #326891;cursor:pointer}
.w.on{background:#e8eef3}
a{color:#326891;font-size:13px;display:inline-block;margin-top:12px}
#pop{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(560px,calc(100% - 32px));background:#121212;color:#fff;border-radius:4px;padding:14px 18px;display:none}
#pop b{font-family:Georgia,serif;font-size:20px}#pop .r{color:#cfcfcf;margin-left:8px}#pop .m{margin:4px 0 8px}#pop .e{font-size:14px;color:#e2e2e2}
@media(max-width:700px){.row{grid-template-columns:1fr;gap:4px}}
</style></head><body><main>
<header>${esc(date)} · ${esc(lang.name)} (${esc(edition.level)}) · translation: ${esc(native.name)}</header>
${articles}
</main><div id="pop"></div>
<script>
const pop=document.getElementById('pop');let on;
document.addEventListener('click',e=>{const w=e.target.closest('.w');if(!w){pop.style.display='none';on&&on.classList.remove('on');return}
on&&on.classList.remove('on');on=w;w.classList.add('on');
const g=JSON.parse(w.closest('article').dataset.glossary)[w.dataset.lemma]||{};
const t=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
pop.innerHTML='<b>'+t(w.dataset.lemma)+'</b><span class="r">'+t(g.reading||'')+' · '+t(g.part_of_speech||'')+'</span><div class="m">'+t(g.meaning||'(no entry)')+'</div><div class="e">'+t(g.example||'')+'<br>'+t(g.example_translation||'')+'</div>';
pop.style.display='block'});
</script></body></html>`
}
