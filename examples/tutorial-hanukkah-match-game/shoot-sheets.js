// Clean renders of the printed sheets (first card page + the rules page) from the live print preview.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2, locale: 'he-IL' });
  await c.route(/supabase\.co\//, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/match-game', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.locator('button', { hasText: 'הדפסת הקלפים' }).click(); await p.waitForTimeout(1500);
  await p.setViewportSize({ width: 1280, height: 4000 }); await p.waitForTimeout(500);
  await p.addStyleTag({ content: '.buga-print-toolbar,.buga-print-tip{display:none!important}' });
  const arts = p.locator('dialog.buga-print-dialog .buga-preview-pages article.buga-a4');
  await arts.nth(0).scrollIntoViewIfNeeded(); await arts.nth(0).screenshot({ path: 'img/sheet-cards.png' });
  await arts.last().scrollIntoViewIfNeeded(); await arts.last().screenshot({ path: 'img/sheet-rules.png' });
  for (const k of [0, 3]) console.log(k, await arts.nth(k).evaluate((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height]; }));
  await b.close();
})();
