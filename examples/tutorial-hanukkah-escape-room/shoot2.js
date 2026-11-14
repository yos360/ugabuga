// Print-kit captures in a tall viewport, each A4 page centred below the toolbar.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const fixRanges = require('./fixranges');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1280, height: 1500 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/escape-room', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.locator('[data-print-main]').click(); await p.waitForTimeout(2500); await fixRanges(p);
  const pd = p.locator('dialog.buga-print-dialog');
  const pages = pd.locator('.buga-preview-pages article');
  const n = await pages.count();
  const boxes = JSON.parse(fs.readFileSync('shots/boxes.json'));
  for (const [k, i] of [['pp0', 0], ['pp1', 1], ['ppLockSheet', n - 2], ['ppPaperLock', n - 1]]) {
    await pages.nth(i).evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(700);
    await p.screenshot({ path: `shots/${k}.png` });
    boxes[k] = await pages.nth(i).evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  }
  await pages.nth(0).evaluate(e => e.scrollIntoView({ block: 'start' }));
  await p.evaluate(() => document.querySelector('.buga-preview-pages')?.parentElement?.scrollTo?.(0, 0)); await p.waitForTimeout(700);
  await p.screenshot({ path: 'shots/print.png' });
  boxes.pdf = await pd.locator('[data-save-pdf]').evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.prn = await pd.getByRole('button', { name: /הדפסה/ }).last().evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.pp0top = await pages.nth(0).evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify({ pp0: boxes.pp0, pp1: boxes.pp1, ppLockSheet: boxes.ppLockSheet, ppPaperLock: boxes.ppPaperLock, pdf: boxes.pdf, prn: boxes.prn, pp0top: boxes.pp0top }));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
