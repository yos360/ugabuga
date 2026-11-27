// Real captures of ugabuga.co.il/holidays/hanukkah/decorations (src/pages/holidays/HanukkahDecorations.jsx).
// Element shots at DSF 2 -> img/<k>.png; boxes (page CSS px, relative to each shot's origin) -> boxes.js.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  await c.route(/supabase\.co\//, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/decorations', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const hide = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog')) e.style.visibility = 'hidden'; }
  });
  // box of an element relative to an origin element (CSS px)
  const rel = (loc, orgLoc) => loc.first().evaluate((e, o) => { const a = o.getBoundingClientRect(), r = e.getBoundingClientRect(); return [r.x - a.x, r.y - a.y, r.width, r.height].map(Math.round); }, orgLoc ? undefined : undefined);
  const relTo = async (loc, orgLoc) => { const o = await orgLoc.first().elementHandle(); return loc.first().evaluate((e, oo) => { const a = oo.getBoundingClientRect(), r = e.getBoundingClientRect(); return [r.x - a.x, r.y - a.y, r.width, r.height].map(Math.round); }, o); };
  const size = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  void rel;
  const B = {};
  await hide();

  // 1. the header + the version choice box
  const h1 = p.locator('h1').first();
  const box = p.locator('div.bg-blue-50').first();
  const shotTop = async (k) => {
    await hide();
    const a = await h1.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const n = await box.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const x0 = Math.min(a[0], n[0]) - 20, y0 = a[1] - 20, x1 = Math.max(a[0] + a[2], n[0] + n[2]) + 20, y1 = n[1] + n[3] + 20;
    await p.screenshot({ path: `img/${k}.png`, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, fullPage: true });
    const btns = await box.locator('button').all();
    B[k] = { size: [Math.round(x1 - x0), Math.round(y1 - y0)], box: [n[0] - x0, n[1] - y0, n[2], n[3]].map(Math.round), btns: [] };
    for (const bt of btns) { const r = await bt.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; }); B[k].btns.push([r[0] - x0, r[1] - y0, r[2], r[3]].map(Math.round)); }
  };
  await shotTop('top');
  console.log('version buttons:', await box.locator('button').allInnerTexts());

  // 2. sections
  const sec = (id) => p.locator(`section[aria-labelledby="k-${id}"]`);
  const shotSec = async (id, k) => {
    await hide();
    const s = sec(id);
    await s.screenshot({ path: `img/${k}.png` });
    B[k] = { size: await size(s), h2: await relTo(s.locator('h2'), s), lead: await relTo(s.locator('h2 + p'), s), printBtn: await relTo(s.locator('button[data-print-main]'), s), choice: [] };
    for (const bt of await s.locator('div[role=group] button').all()) B[k].choice.push(await relTo(bt, s));
    const inp = s.locator('input'); if (await inp.count()) B[k].input = await relTo(inp, s);
    const ol = s.locator('ol'); if (await ol.count()) B[k].ol = await relTo(ol, s);
    console.log(k, await s.locator('button[data-print-main]').innerText(), '| choice:', await s.locator('div[role=group] button').allInnerTexts());
  };
  await shotSec('bunting', 'bunting');
  await sec('bunting').locator('button', { hasText: 'חנוכה שמח' }).first().click(); await p.waitForTimeout(300);
  await shotSec('bunting', 'bunting2');
  await sec('bunting').locator('button', { hasText: 'חג אורים שמח' }).first().click(); await p.waitForTimeout(300);
  await shotSec('banner', 'banner');
  await sec('sign').locator('input').fill('גן תפוח'); await p.waitForTimeout(200);
  await sec('sign').locator('div[role=group] button').nth(2).click(); await p.waitForTimeout(300);
  await shotSec('sign', 'sign');

  // 3. print previews
  const dlg = p.locator('dialog.buga-print-dialog');
  await p.setViewportSize({ width: 1280, height: 1800 }); await p.waitForTimeout(400);
  const openPrint = async (id) => { await sec(id).locator('button[data-print-main]').click(); await p.waitForTimeout(1500); await hide(); };
  const closePrint = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(600); if (await dlg.count() && await dlg.first().isVisible()) { await dlg.getByRole('button', { name: /חזרה/ }).first().click().catch(() => {}); await p.waitForTimeout(600); } };
  const sheets = async (id, k, max = 12) => {
    await openPrint(id);
    const pages = dlg.locator('.buga-preview-pages article.buga-a4');
    const n = await pages.count();
    console.log(k, 'pages:', n);
    B['n_' + k] = n;
    for (let i = 0; i < Math.min(n, max); i++) await pages.nth(i).screenshot({ path: `img/${k}-${i}.png` });
    B.sheetSize = await size(pages.first());
    await closePrint();
    return n;
  };
  await sheets('bunting', 'flag');
  // the toolbar (once)
  await openPrint('sign');
  const tb = dlg.locator('.buga-print-toolbar');
  await tb.screenshot({ path: 'img/toolbar.png' });
  B.toolbar = { size: await size(tb), pdf: await relTo(dlg.locator('[data-save-pdf]'), tb), print: await relTo(dlg.getByRole('button', { name: '🖨️ הדפסה' }), tb) };
  console.log('toolbar:', (await tb.innerText()).replace(/\n/g, ' / '));
  const sp = dlg.locator('.buga-preview-pages article.buga-a4');
  await sp.first().screenshot({ path: 'img/sign-0.png' });
  await closePrint();
  await sheets('garland', 'garland');
  await sheets('window', 'window');
  await sheets('banner', 'banner');
  // outline versions
  await p.setViewportSize({ width: 1280, height: 1100 }); await p.waitForTimeout(300);
  await box.locator('button').nth(1).click(); await p.waitForTimeout(400);
  await p.evaluate(() => scrollTo(0, 0)); await shotTop('top2');
  await p.setViewportSize({ width: 1280, height: 1800 }); await p.waitForTimeout(300);
  await sheets('bunting', 'flagO', 1);
  await sheets('garland', 'garlandO', 1);
  await sheets('banner', 'bannerO', 2);
  fs.writeFileSync('boxes.js', 'globalThis.BOXES = ' + JSON.stringify(B) + ';\n');
  console.log(JSON.stringify(B));
  await b.close();
})();
