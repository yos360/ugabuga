const { chromium } = require(process.env.PRERENDER_PLAYWRIGHT || 'playwright')
const assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({headless:true, ...(process.platform === 'win32' ? {channel:'msedge'} : {})})
  try {
    for (const width of [390, 768, 1366]) {
      const page = await browser.newPage({viewport:{width,height:844}})
      await page.goto((process.env.BASE_URL || 'http://127.0.0.1:4180')+'/classroom/first-grade', {waitUntil:'networkidle'})
      assert.equal(await page.evaluate(()=>window.scrollY), 0, 'Do not scroll on initial load')
      const buttons = page.getByRole('navigation', {name:'מודולי תרגול'}).getByRole('button')
      assert.equal(await buttons.count(), 6)
      for (const index of [0,1,2,3,4,5,0,0]) {
        await buttons.nth(index).click()
        await page.waitForFunction(()=>document.activeElement?.id==='first-grade-activity')
        const box = await page.locator('#first-grade-activity').boundingBox()
        assert.ok(box.y >= 0 && box.y <= 20, `Activity must be at top: ${width}/${index}: ${box.y}`)
        assert.equal(await buttons.nth(index).getAttribute('aria-pressed'), 'true')
      }
      console.log(`PASS ${width}px: all modules, letters return and repeated selection`)
      await page.close()
    }
  } finally { await browser.close() }
})().catch(error=>{console.error(error);process.exitCode=1})
