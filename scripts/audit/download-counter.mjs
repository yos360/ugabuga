import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { offlineSiteResponse } from './offline-site.mjs'

const browser = await chromium.launch({headless:true})
// Human-sign gating is exercised only against intercepted local fixtures, never production analytics.
const context = await browser.newContext({acceptDownloads:true,userAgent:'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36 Instagram'})
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', {get:()=>false})
  const original = URL.createObjectURL.bind(URL)
  URL.createObjectURL = blob => {
    if (blob.type === 'application/pdf') {
      if (window.__failExport) throw new Error('Fixture export failure')
      window.__pdfReady = true
    }
    return original(blob)
  }
})
const counts = []
await context.route('**/*', route => {
  const url = new URL(route.request().url())
  if (url.hostname === '127.0.0.1') return route.fulfill(offlineSiteResponse(url.href))
  if (!url.pathname.includes('/rest/v1/rpc/')) return route.abort()
  const fn = url.pathname.split('/').at(-1)
  if (fn === 'record_pdf_download') counts.push(route.request().postDataJSON())
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fn === 'record_pdf_download' ? true : fn === 'public_download_counts' ? {total:counts.length,pages:{}} : null)})
})
const page = await context.newPage()
await page.goto('http://127.0.0.1:5199/food/kids-recipes/pancakes')
await page.locator('h1').first().waitFor()
await page.getByRole('button',{name:'🖨️ הדפסת המתכון',exact:true}).click()
await page.locator('.buga-preview-pages .buga-qr').waitFor()
await page.evaluate(()=>{window.__failExport=true})
await page.locator('[data-save-pdf]').click()
await page.getByRole('alert').filter({hasText:'לא הצלחנו ליצור PDF'}).waitFor()
assert.equal(counts.length,0,'failed export is not counted')
await page.evaluate(()=>{window.__failExport=false})
const recorded = page.waitForResponse(r=>r.url().endsWith('/record_pdf_download'))
await page.locator('[data-save-pdf]').click()
await recorded
assert.equal(counts.length,1,'successful export counted once')
assert.equal(counts[0].p_path,'/food/kids-recipes/pancakes')
assert.match(counts[0].p_request_id,/^[a-f0-9-]{36}$/)
await page.locator('[data-save-pdf]:not(:disabled)').waitFor()
await page.evaluate(()=>{
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true})
  Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError')}})
})
await page.locator('[data-save-pdf]').click()
await page.locator('[data-save-pdf]:not(:disabled)').waitFor()
assert.equal(counts.length,1,'cancelled native share is not counted')
await page.evaluate(()=>{localStorage.setItem('buga-owner-device','1');Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false})})
await page.locator('[data-save-pdf]').click()
await page.locator('[data-save-pdf]:not(:disabled)').waitFor()
assert.equal(counts.length,1,'owner exports excluded')
await browser.close()
console.log('PASS: failure=0, success=1, cancelled share=0, owner=0; one canonical path and random idempotency key per export.')
