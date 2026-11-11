// The A4 preview SVGs of /printables/my-book as element shots at DSF 6 (same clicks as shoot.js).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 6, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/printables/my-book', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  await p.evaluate(() => { for (const e of document.querySelectorAll('span,div')) if (e.children.length === 0 && /^[0-9]$/.test(e.textContent.trim()) && e.getBoundingClientRect().width < 40) e.style.visibility = 'hidden'; });
  const sheet = p.locator('svg[aria-label^="ספר מקופל"]').first();
  const hideBadges = () => p.evaluate(() => { for (const svg of document.querySelectorAll('svg[aria-label^="ספר מקופל"], svg[aria-label="הוראות קיפול הספר"]')) { const r = svg.getBoundingClientRect(); for (const [dx, dy] of [[-4, 4], [-8, 8], [-12, 2]]) { const e = document.elementFromPoint(r.right + dx, r.top + dy); if (e && !svg.contains(e) && !e.contains(svg)) e.style.visibility = 'hidden'; } } });
  const shot = async (k) => { await p.waitForTimeout(400); await hideBadges(); await sheet.screenshot({ path: `shots/${k}.png` }); };
  const bt = (re) => p.locator('button').filter({ hasText: re }).last();
  await shot('sh0');
  await p.locator('button').filter({ hasText: /חנוכה/ }).first().click(); await shot('sh1');
  await p.locator('input[placeholder="אפשר להשאיר ריק"]').fill('נועה'); await shot('sh2');
  for (const [k, re] of [['shs1', /רק ציור/], ['shs2', /ציור ו/], ['shs3', /כתיבה/], ['shs4', /^.*קומיקס$/]]) { await bt(re).click(); await shot(k); }
  await hideBadges(); await p.locator('svg[aria-label="הוראות קיפול הספר"]').first().screenshot({ path: 'shots/fold.png' });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
