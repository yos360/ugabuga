import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5203'
const paths = JSON.parse(readFileSync('docs/audit-data-2026-10-14.json')).print.nativePdf.map(r => r.path)
mkdirSync('out/audit', { recursive: true })
writeFileSync('out/audit/native-pages.jsonl', paths.map(path => JSON.stringify({ path, viewport: 'phone', printButtons: [{}] })).join('\n'))
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
const page = await browser.newPage({ viewport: { width: Number(process.env.AUDIT_WIDTH || 1280), height: 1000 } })
await page.route('**/*', r => r.request().url().startsWith(base) && ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort())
await page.addInitScript(() => { window.print = () => { throw new Error('Native printing must not run when opening preview') } })
const results = [], edits = []
async function open() {
  await page.locator('main [data-print-main]').first().click()
  await page.locator('dialog[open] .buga-qr').first().waitFor()
}
async function close() { await page.getByRole('button', { name: 'סגירת תצוגת ההדפסה', exact: true }).click() }
try {
  for (const path of paths) {
    await page.goto(base + path)
    await page.locator('main [data-print-main]').first().waitFor()
    await open()
    const geometry = await page.locator('dialog .buga-a4').evaluateAll(es => es.map(s => {
      const page = s.getBoundingClientRect(), qr = s.querySelector('.buga-qr').getBoundingClientRect()
      const outside = [...s.querySelectorAll('.legacy-print p,.legacy-print h1,.legacy-print h2,.legacy-print h3,.legacy-print li,.legacy-print img,.legacy-print input,.legacy-print textarea,[data-print-marker]')].filter(e => {
        const r = e.getBoundingClientRect()
        return r.width && r.height && (r.left < page.left - 1 || r.right > page.right + 1 || r.bottom > qr.top - 1)
      }).map(e => ({ tag: e.tagName, text: e.textContent.slice(0, 70) }))
      return { ratio: page.width / page.height, outside }
    }))
    await page.locator('dialog [data-print-count]').selectOption('2')
    const copies = await page.locator('dialog .buga-a4').count()
    const pass = copies === geometry.length * 2 && geometry.every(g => !g.outside.length && Math.abs(g.ratio - 210 / 297) < .005)
    results.push({ path, geometry, copies, pass })
    console.log(path, pass)
  }
  await page.goto(base + '/printables/roots-project')
  await page.getByLabel('שם התלמיד/ה', { exact: true }).fill('תמר בדיקה')
  await page.getByPlaceholder('כותרת העבודה', { exact: true }).fill('הסיפור המשפחתי לבדיקה')
  await page.locator('input[type=file]').first().setInputFiles({ name: 'photo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="blue"/></svg>') })
  const photo = await page.locator('main .cover-photo img').getAttribute('src')
  await open()
  assert.ok((await page.locator('dialog .legacy-print').allTextContents()).join('').includes('תמר בדיקה'))
  assert.equal(await page.locator('dialog .cover-photo img').getAttribute('src'), photo)
  await close()
  assert.equal(await page.getByLabel('שם התלמיד/ה', { exact: true }).inputValue(), 'תמר בדיקה')
  edits.push({ case: 'roots title/name/photo survive preview and close', pass: true })
  await page.getByRole('button', { name: '＋ הוסיפו ענף לעץ', exact: true }).click()
  await page.getByRole('button', { name: '＋ הוסיפו ענף לעץ', exact: true }).click()
  await open()
  assert.ok(await page.locator('dialog .buga-a4').count() >= 6)
  assert.equal(await page.locator('dialog .family-view > div').count(), 6)
  await close()
  edits.push({ case: 'expanded family tree paginates all six members', pass: true })
  await page.goto(base + '/tools/experiment-maker')
  const note = 'בדיקת חקר: המים השתנו לאחר הוספת החומר. '.repeat(12)
  await page.locator('main textarea').first().fill(note)
  await open()
  assert.ok((await page.locator('dialog .legacy-print').allTextContents()).join('').includes(note))
  await close()
  assert.equal(await page.locator('main textarea').first().inputValue(), note)
  edits.push({ case: 'experiment long notes retained', pass: true })
  await page.goto(base + '/tools/bring-list')
  await page.getByLabel('פריט', { exact: true }).first().fill('ענבים לבדיקה')
  await open()
  assert.equal(await page.locator('dialog input[aria-label="פריט"]').first().inputValue(), 'ענבים לבדיקה')
  await close()
  edits.push({ case: 'bring list item edits retained without publishing', pass: true })
  await page.goto(base + '/tools/crossword-maker')
  for (let i = 0; i < 5; i++) {
    await page.locator('nav[aria-label="סוג החידה"] button').nth(i).click()
    if (i === 2) await page.getByLabel('גודל הלוח').selectOption('hard')
    await open()
    assert.ok(await page.locator('dialog .puzzle-paper').count())
    if (i === 2) assert.equal(await page.locator('dialog .sudoku-board > div').count(), 81)
    await close()
    edits.push({ case: `puzzle type ${i}${i === 2 ? ', 9x9' : ''}`, pass: true })
  }
  writeFileSync(process.env.AUDIT_LEGACY_OUTPUT || 'out/audit/legacy-print-desktop.json', JSON.stringify({ results, edits }, null, 2))
  assert.ok(results.every(r => r.pass), 'every legacy sheet must fit A4 and its QR strip')
} finally { await browser.close() }
