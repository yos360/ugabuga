// Re-shoot of the answer page only (print2.png), from the fixed build (BASE=http://localhost:4199).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage(); p.setDefaultTimeout(5000);
  await p.goto((process.env.BASE || 'https://ugabuga.co.il') + '/math/mixed-numbers', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.getByRole('button', { name: /לתצוגה ולהדפסה/ }).click(); await p.waitForTimeout(2000);
  await p.evaluate(() => {
    const st = document.createElement('style'); st.textContent = '*{transition:none!important;animation:none!important}'; document.head.appendChild(st);

    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('dialog')) e.style.visibility = 'hidden'; }
  });
  const ol = p.locator('dialog.buga-print-dialog .buga-preview-pages article').nth(1).locator('ol');
  await ol.evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
  console.log(JSON.stringify(await ol.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); })));
  console.log((await ol.innerText()).replace(/\n/g, ' | '));
  await p.mouse.move(2, 2);
  await p.screenshot({ path: 'img/print2.png' });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
