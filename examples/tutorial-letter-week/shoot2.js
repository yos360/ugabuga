// High-res captures of the four kit sheets on /letters/mem/week (DSF 4).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1280, height: 1080 }, deviceScaleFactor: 4, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/letters/mem/week', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const sheets = p.locator('main svg[role=img]');
  for (let i = 0; i < 4; i++) { await sheets.nth(i).screenshot({ path: `shots/sheet${i}.png` }); }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
