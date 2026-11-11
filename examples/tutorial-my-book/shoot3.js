// The print row of /printables/my-book (red "הדפסה או PDF" + both previews), viewport shot at DSF 2.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/printables/my-book', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.querySelector('[data-print-main]')) e.style.visibility = 'hidden'; } });
  await p.locator('button').filter({ hasText: /חנוכה/ }).first().click();
  await p.locator('input[placeholder="אפשר להשאיר ריק"]').fill('נועה');
  await p.locator('button[data-print-main]').scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, 150)); await p.waitForTimeout(600);
  const r = (sel) => p.locator(sel).first().evaluate((e) => { const q = e.getBoundingClientRect(); return [q.x, q.y, q.width, q.height].map(Math.round); });
  const boxes = JSON.parse(fs.readFileSync('shots/boxes.json'));
  boxes.v_print = await r('button[data-print-main]');
  boxes.v_sheet = await r('svg[aria-label^="ספר מקופל"]');
  boxes.v_fold = await r('svg[aria-label="הוראות קיפול הספר"]');
  await p.screenshot({ path: 'shots/pr.png' });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(boxes.v_print, boxes.v_sheet, boxes.v_fold);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
