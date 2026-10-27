import { CHAPTERS } from '../data/chapters'
import type { Ofrenda } from '../types'
import { escapeHtml, formatDate } from './utils'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the photograph.'))
    reader.readAsDataURL(blob)
  })
}

async function embedPhoto(photo: string | undefined): Promise<string> {
  if (!photo) return ''
  if (/^data:image\/(png|jpeg|jpg|webp|svg\+xml);/i.test(photo)) return photo
  if (photo.startsWith('/')) {
    try {
      const response = await fetch(photo)
      if (!response.ok) return ''
      const data = await blobToDataUrl(await response.blob())
      return /^data:image\//i.test(data) ? data : ''
    } catch {
      return ''
    }
  }
  return ''
}

const STYLE = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #08070b;
  color: #f3ead8;
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
.glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(700px 420px at 50% 8%, rgba(255,143,62,.14), transparent 70%);
}
main { position: relative; width: min(100% - 2.5rem, 780px); margin: 0 auto; padding: 3rem 0 5rem; }
.masthead { display: flex; justify-content: space-between; gap: 1rem; padding-bottom: 1.2rem; border-bottom: 1px solid rgba(243,234,216,.16); }
.brand { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .72rem; letter-spacing: .26em; color: #f7c46c; }
.meta { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .6rem; letter-spacing: .16em; color: #a99d8b; text-transform: uppercase; }
.portrait-block { text-align: center; padding: 3rem 0 2.4rem; }
.portrait { width: 200px; height: 252px; margin: 0 auto 1.5rem; border-radius: 999px 999px 10px 10px; border: 1px solid rgba(247,196,108,.4); overflow: hidden; box-shadow: 0 0 70px rgba(255,143,62,.15); background: #171221; }
.portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; }
.initial { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 4rem; color: #f7c46c; }
h1 { margin: 0; font-weight: 400; font-size: clamp(2.8rem, 8vw, 4.4rem); line-height: 1; letter-spacing: -.03em; }
.life { margin-top: .8rem; font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: #a99d8b; }
.epitaph { margin: 2.2rem auto 0; max-width: 30ch; font-style: italic; font-size: 1.35rem; color: #f7c46c; line-height: 1.5; }
.remembrance { padding: 3rem 0 2rem; border-top: 1px solid rgba(243,234,216,.16); }
.kicker { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: #ff8f3e; }
h2 { font-weight: 400; font-size: clamp(1.8rem, 5vw, 2.5rem); line-height: 1.15; letter-spacing: -.02em; margin: .8rem 0 1.6rem; }
.body { font-size: 1.08rem; line-height: 1.85; color: #e4d9c5; }
.body p { margin: 0 0 1.2rem; }
.body p:first-child::first-letter { float: left; padding: .1em .14em 0 0; font-size: 3.6em; line-height: .78; color: #f7c46c; }
.source { margin-top: 1.4rem; font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .6rem; letter-spacing: .08em; color: #7e7466; }
.memories { padding: 2.5rem 0 1rem; border-top: 1px solid rgba(243,234,216,.16); }
.memory { padding: 1.6rem 0; border-bottom: 1px solid rgba(243,234,216,.1); }
.memory:last-child { border-bottom: 0; }
.memory .rite { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .58rem; letter-spacing: .18em; text-transform: uppercase; color: #f7c46c; }
.memory h3 { margin: .4rem 0 .7rem; font-weight: 400; font-size: 1.28rem; line-height: 1.3; }
.memory p { margin: 0; color: #d8cdb9; }
.artifact { display: inline-block; margin-top: .8rem; padding: .26rem .6rem; border: 1px solid rgba(247,196,108,.3); border-radius: 999px; font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .6rem; letter-spacing: .06em; color: #f7c46c; }
.offerings { padding: 2.5rem 0; border-top: 1px solid rgba(243,234,216,.16); }
.offerings ul { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0; padding: 0; list-style: none; }
.offerings li { padding: .4rem .7rem; border: 1px solid rgba(243,234,216,.16); border-radius: 999px; font-size: .78rem; color: #d8cdb9; }
.offerings li span { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .55rem; text-transform: uppercase; color: #f7c46c; margin-right: .35rem; }
footer { padding-top: 2.5rem; border-top: 1px solid rgba(243,234,216,.16); font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: .62rem; line-height: 1.8; color: #7e7466; }
footer p { margin: 0 0 .6rem; }
.mark { display: inline-block; width: 10px; height: 10px; margin-right: .4rem; border-radius: 50%; background: #f7c46c; box-shadow: 0 0 10px rgba(247,196,108,.7); vertical-align: -1px; }
.demo { color: #f7c46c; }
@media print {
  :root { color-scheme: light; }
  body { background: #fff; color: #1a1610; }
  .glow { display: none; }
  main { width: 100%; padding: 1rem 0; }
  .masthead, .memory, footer { border-color: #d8cdb9; }
  .brand, .life, .epitaph, .kicker, .memory .rite, .artifact, .offerings li span { color: #8a4a12; }
  .source, footer, .meta { color: #5c5348; }
  .body, .memory p, .offerings li { color: #2b251d; }
  .portrait { box-shadow: none; }
  .body p:first-child::first-letter { color: #8a4a12; }
}
`

export async function buildKeepsakeHtml(ofrenda: Ofrenda): Promise<string> {
  const { person, remembrance } = ofrenda
  const photo = await embedPhoto(person.photo)
  const answered = CHAPTERS.flatMap((chapter) => {
    const entry = ofrenda.entries.find((item) => item.id === chapter.id)
    return entry && !entry.skipped && entry.answer.trim() ? [{ chapter, entry }] : []
  })

  const body = (remembrance?.body ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join('')

  const memories = answered
    .map(
      ({ chapter, entry }) => `<article class="memory">
  <div class="rite">${escapeHtml(chapter.rite)} · ${escapeHtml(chapter.label)}</div>
  <h3>${escapeHtml(chapter.prompt)}</h3>
  <p>${escapeHtml(entry.answer.trim())}</p>
  ${entry.artifact ? `<span class="artifact">${escapeHtml(entry.artifact.label)}</span>` : ''}
</article>`,
    )
    .join('')

  const offerings = answered
    .filter(({ entry }) => entry.artifact)
    .map(
      ({ entry }) =>
        `<li><span>${escapeHtml(entry.artifact?.kind ?? '')}</span>${escapeHtml(
          entry.artifact?.label ?? '',
        )}</li>`,
    )
    .join('')

  const source = remembrance
    ? remembrance.source === 'gemma'
      ? `Gemma 2 · 2B · written on this device${
          remembrance.latencyMs ? ` · ${(remembrance.latencyMs / 1000).toFixed(1)}s` : ''
        }`
      : remembrance.source === 'ollama'
        ? `${escapeHtml(remembrance.modelLabel ?? 'Ollama')} · written on this device`
        : remembrance.source === 'demo'
          ? 'Written for the fictional demo'
          : 'Candle mode · your own words, arranged'
    : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Ghostlight">
<title>${escapeHtml(person.name)} — A Ghostlight keepsake</title>
<style>${STYLE}</style>
</head>
<body>
<div class="glow" aria-hidden="true"></div>
<main>
  <header class="masthead">
    <div class="brand"><span class="mark"></span>GHOSTLIGHT</div>
    <div class="meta">A remembrance · kept locally</div>
  </header>

  <section class="portrait-block">
    <div class="portrait">${
      photo
        ? `<img src="${escapeHtml(photo)}" alt="A portrait of ${escapeHtml(person.name)}">`
        : `<div class="initial">${escapeHtml(person.name.trim().charAt(0).toUpperCase() || '·')}</div>`
    }</div>
    <h1>${escapeHtml(person.name)}</h1>
    <div class="life">${[person.years, person.relation]
      .filter((value): value is string => Boolean(value))
      .map(escapeHtml)
      .join(' · ')}</div>
    ${
      remembrance?.epitaph
        ? `<p class="epitaph">${escapeHtml(remembrance.epitaph)}</p>`
        : ''
    }
  </section>

  ${
    remembrance
      ? `<section class="remembrance">
    <div class="kicker">The remembrance</div>
    <h2>${escapeHtml(remembrance.title)}</h2>
    <div class="body">${body}</div>
    <div class="source">${source}</div>
  </section>`
      : ''
  }

  <section class="memories">
    <div class="kicker">The archive</div>
    <h2>${answered.length} ${answered.length === 1 ? 'memory' : 'memories'} kept</h2>
    ${memories}
  </section>

  ${
    offerings
      ? `<section class="offerings">
    <div class="kicker">On the altar</div>
    <h2>The offerings</h2>
    <ul>${offerings}</ul>
  </section>`
      : ''
  }

  <footer>
    <p><span class="mark"></span>Exported from Ghostlight on ${escapeHtml(formatDate(new Date().toISOString()))}.</p>
    <p>This file is yours. It needs no internet, no account, and no server. Open it in twenty years and it will still be here.</p>
    ${ofrenda.isDemo ? '<p class="demo">This is a fictional demo archive, written by the builders.</p>' : ''}
    <p>Ghostlight is a memory tool, not a medium. It cannot talk to the dead. It helps you keep what you know.</p>
  </footer>
</main>
</body>
</html>`
}
