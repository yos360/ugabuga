// Real PDF downloads and browser comparison images for every puzzle level.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5203'
const out = 'docs/screenshots/audit-followup'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } })
await page.route('**/*', r => r.request().url().startsWith(base) && ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort())
const results = []
try {
  for (let level = 0; level < 4; level++) {
    await page.goto(base + '/logic-puzzles/print')
    await page.locator('nav[aria-label="רמת קושי"] button').nth(level).click()
    await page.getByRole('button', { name: /הדפסת כל/ }).click()
    await page.locator('dialog .buga-qr').first().waitFor()
    await page.evaluate(() => document.fonts.ready)
    const sheet = page.locator('dialog .buga-a4').first()
    const labels = await sheet.locator('.lp-col-label').evaluateAll(es => es.map(svg => {
      const text = svg.querySelector('text'), box = text.getBBox()
      return { text: text.textContent, label: svg.getAttribute('aria-label'), height: +svg.getAttribute('height'), length: text.getComputedTextLength(), box: { width: box.width, height: box.height } }
    }))
    assert.ok(labels.length)
    for (const label of labels) { assert.equal(label.label, label.text); assert.ok(label.height >= label.length + 7) }
    const captureStyle = await page.addStyleTag({ content: 'dialog.buga-print-dialog{max-height:none!important;position:absolute!important;top:0!important;margin:0 auto!important}.buga-print-toolbar{position:static!important}' })
    await sheet.locator('.lp-grids').screenshot({ path: `${out}/level-${level + 1}-browser.png` })
    await captureStyle.evaluate(el => el.remove())
    if (process.env.HEADERS_SCREENSHOTS_ONLY) continue
    const download = page.waitForEvent('download', { timeout: 180000 })
    await page.locator('[data-save-pdf]').click()
    const pdf = `out/audit/vertical-${level + 1}.pdf`
    await (await download).saveAs(pdf)
    execFileSync('pdftoppm', ['-f', '1', '-singlefile', '-scale-to', '1400', '-png', pdf, `${out}/level-${level + 1}-pdf`])
    results.push({ level, labels, pdf })
    console.log(`Level ${level + 1}: SVG bounds and PDF download passed`)
  }
  writeFileSync('out/audit/vertical-headers.json', JSON.stringify(results, null, 2))
} finally { await browser.close() }
