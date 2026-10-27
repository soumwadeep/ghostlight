import { chromium } from 'playwright'
import fs from 'node:fs'

const logFile = '/tmp/ghostlight-gemma.log'
const log = (msg) => { const line = `[${new Date().toISOString()}] ${msg}`; console.log(line); fs.appendFileSync(logFile, line + '\n') }
fs.writeFileSync(logFile, '')

const browser = await chromium.launchPersistentContext('/tmp/ghostlight-gemma-profile', {
  channel: 'chrome',
  headless: true,
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
  acceptDownloads: true,
  args: ['--enable-unsafe-webgpu'],
  timeout: 30000,
})
const page = await browser.newPage()
page.setDefaultTimeout(15000)
page.setDefaultNavigationTimeout(60000)
page.on('console', (msg) => {
  const text = msg.text()
  if (msg.type() === 'error' || /webgpu|WebGPU|mlc|gemma|fetch|error/i.test(text)) log('CONSOLE ' + msg.type() + ': ' + text.slice(0, 300))
})
page.on('pageerror', (err) => log('PAGEERROR: ' + err.message))
page.on('requestfailed', (req) => {
  const url = req.url()
  if (/huggingface|hf\.co|mlc/.test(url)) log('REQ FAILED ' + url.slice(0, 160) + ' :: ' + (req.failure()?.errorText ?? ''))
})
page.on('response', (res) => {
  const url = res.url()
  if (/huggingface|hf\.co|mlc/.test(url)) log('RESP ' + res.status() + ' ' + url.replace(/https:\/\/[^/]+/, '').slice(0, 140))
})

const textOf = async (selector) => {
  if (!(await page.locator(selector).count())) return ''
  return page.locator(selector).first().innerText({ timeout: 1000 }).catch(() => '')
}

try {
  await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.fill('#person-name', 'Asha Sen')
  await page.fill('#person-relation', 'grandmother')
  await page.fill('#person-years', '1938–2020')
  await page.fill('#person-pronoun', 'she/her')
  await page.click('.setup-form button[type=submit]')
  await page.waitForTimeout(400)
  const answers = [
    'Dal with a squeeze of lime at the end, and the pressure cooker going off like a small argument. She said the lime was the whole point.',
    'Rabindra Sangeet on the old transistor every Sunday, always a little too loud. She sang off-key and dared anyone to correct her.',
    'The terrace at dusk. She watered the tulsi and complained about the pigeons while the neighbourhood went dark, one window at a time.',
    '“Ei to shob — this is all there is.” She said it when the power went out, when someone cried, when the mango was too sour.',
    'A blue tin of sewing buttons. She knew which button belonged to which shirt, even in the dark. The tin smelled of thread and Vicks.',
    'I never asked her what she wanted to be before she was everyone’s mother. I keep thinking she would have laughed.',
  ]
  for (const answer of answers) {
    await page.fill('#chapter-answer', answer)
    await page.click('.chapter-form button[type=submit]')
    await page.waitForTimeout(200)
  }
  await page.waitForTimeout(400)
  log('URL at weave: ' + page.url())
  log('webgpu badge: ' + (await textOf('.model-badge')))
  log('engine: ' + (await textOf('.engine.is-selected .engine-copy b')))
  log('cta: ' + (await textOf('.weave-cta .btn-primary')))
  await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-before.png' })

  await page.locator('.weave-cta .btn-primary').click({ timeout: 10000 })
  log('clicked summon')

  let success = false
  const started = Date.now()
  let lastLog = 0
  const shotAt = new Set()
  while (Date.now() - started < 8 * 60 * 1000) {
    await page.waitForTimeout(2000)
    const elapsed = Math.round((Date.now() - started) / 1000)
    const url = page.url()
    if (url.includes('/ofrenda/')) { success = true; log('NAVIGATED ' + url); break }
    const progress = await textOf('.weaving-loading .progress-label')
    const message = await textOf('.weaving-loading .field-help')
    const stream = await textOf('.weaving-stream')
    const err = await textOf('.form-error')
    const engineErr = await textOf('.engine-detail .error')
    if (elapsed - lastLog >= 6) {
      lastLog = elapsed
      log(`t+${elapsed}s progress=${progress.replace(/\n/g, ' | ')} msg=${message.replace(/\n/g, ' ').slice(0, 140)} stream=${stream.slice(0, 100).replace(/\n/g, ' ')} err=${err.slice(0, 140)} engineErr=${engineErr.slice(0, 140)}`)
    }
    for (const mark of [10, 45, 100, 180]) {
      if (elapsed >= mark && !shotAt.has(mark)) {
        shotAt.add(mark)
        await page.screenshot({ path: `/tmp/ghostlight-shots/gemma-loading-${mark}.png` })
      }
    }
    if (err || engineErr) { log('ERROR STATE CAPTURED e=' + err + ' / ' + engineErr); await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-error.png' }); break }
  }

  if (success) {
    log('SUCCESS ' + page.url())
    await page.waitForTimeout(1200)
    await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-ofrenda-full.png', fullPage: true })
    await page.locator('.reading-section').scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-reading.png' })
    const title = await page.locator('.reading-title').innerText()
    const sourceChip = await page.locator('.reading-footer .chip').innerText()
    const body = await page.locator('.reading-body').innerText()
    fs.writeFileSync('/tmp/ghostlight-shots/gemma-result.txt', [title, sourceChip, body].join('\n\n---\n\n'))
    log('TITLE: ' + title)
    log('SOURCE: ' + sourceChip)
    log('BODY: ' + body.slice(0, 1600).replace(/\n/g, ' '))
    await page.locator('.ask-section').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    const askInput = page.locator('.ask-input-wrap input')
    await askInput.fill('What did she say when the power went out?')
    await page.click('.ask-form button[type=submit]')
    await page.waitForTimeout(4000)
    const answerSource = await page.locator('.ask-answer-top .mono').last().innerText().catch(() => 'n/a')
    const answer = await page.locator('.ask-answer-text').last().innerText().catch(() => 'n/a')
    log('ASK SOURCE: ' + answerSource)
    log('ASK ANSWER: ' + answer.slice(0, 300))
    await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-ask.png' })
  } else {
    log('NO SUCCESS WITHIN WINDOW')
    await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-timeout.png', fullPage: true })
  }
} catch (err) {
  log('FATAL: ' + (err instanceof Error ? err.stack : String(err)))
  try { await page.screenshot({ path: '/tmp/ghostlight-shots/gemma-fatal.png', fullPage: true }) } catch {}
} finally {
  await browser.close()
}
