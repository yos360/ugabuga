// Real captures of ugabuga.co.il/printables/routine-chart (src/pages/printables/RoutineChart.jsx, PrintableShell.jsx, PrintPreview.jsx).
// Full-page screenshots at DSF 2; boxes are page CSS coords (org [0,0]) -> shots/boxes.json.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  await c.route(/supabase\.co\//, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/printables/routine-chart', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const hide = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('[data-print-main]')) e.style.visibility = 'hidden'; }
  });
  const box = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map(Math.round); }); };
  const boxes = {};
  const btn = (name) => p.getByRole('button', { name, exact: true });
  const grp = (label) => p.locator(`[role=group][aria-label="${label}"]`);
  const grab = async () => ({
    controls: await box(p.locator('.bg-\\[var\\(--postit\\)\\]')), mode: await box(grp('סוג הלוח')), name: await box(p.locator('label').filter({ has: p.locator('input') }).first()),
    tasksHead: await box(p.locator('p', { hasText: /^משימות ב/ })), tasks: await box(grp('בחירת משימות')), face: await box(btn('💦 לשטוף פנים')), hair: await box(btn('💇 לסרק שיער')), water: await box(btn('🥛 לשתות מים')),
    order: await box(p.locator('ol.max-w-md')), orderHead: await box(p.locator('p', { hasText: 'הסדר בלוח' })),
    row3: await box(p.locator('ol.max-w-md li').nth(2)), row4: await box(p.locator('ol.max-w-md li').nth(3)), up4: await box(p.locator('ol.max-w-md li').nth(3).locator('button').nth(0)), x8: await box(p.locator('ol.max-w-md li').nth(7).locator('button').nth(2)),
    layout: await box(grp('עיצוב הלוח')), days: await box(grp('ימי השבוע')), color: await box(grp('צבע')),
    preview: await box(p.locator('[aria-label="תצוגה מקדימה של הדף הראשון"]')), pages: await box(p.locator('p', { hasText: /דפי A4|דף A4 אחד/ })), print: await box(p.locator('[data-print-main]')),
  });
  const shot = async (k) => { await hide(); await p.waitForTimeout(300); boxes[k] = await grab(); await p.screenshot({ path: `shots/${k}.png`, fullPage: true }); console.log(k, JSON.stringify(boxes[k])); };

  await shot('start');
  await p.locator('input').first().fill('נועם');
  await p.waitForTimeout(200);
  await shot('named');
  await btn('💦 לשטוף פנים').click(); await p.waitForTimeout(200); await shot('face');
  await btn('💇 לסרק שיער').click();
  await p.waitForTimeout(200);
  await shot('picked');
  console.log('head:', await p.locator('p', { hasText: /^משימות ב/ }).innerText());
  // move "לשטוף פנים" (8th) up to 4th: press ▲ on row 8 four times
  for (let i = 7; i > 3; i--) { await p.locator('ol.max-w-md li').nth(i).locator('button').nth(0).click(); await p.waitForTimeout(80); }
  // and "לסרק שיער" (now 9th) up to 6th
  for (let i = 8; i > 5; i--) { await p.locator('ol.max-w-md li').nth(i).locator('button').nth(0).click(); await p.waitForTimeout(80); }
  await shot('ordered');
  console.log('order:', (await p.locator('ol.max-w-md').innerText()).replace(/\n/g, ' | '));
  await btn('עמודה לכל יום בשבוע').click(); await p.waitForTimeout(300);
  await shot('days');
  await btn('לוח וכרטיסים לגזירה').click(); await p.waitForTimeout(300);
  await shot('cards');
  console.log('pages:', await p.locator('p', { hasText: /דפי A4|דף A4 אחד/ }).innerText());
  await p.locator('[data-print-main]').click(); await p.waitForTimeout(1500);
  await hide();
  const dlg = p.locator('dialog.buga-print-dialog');
  boxes.dialog = { toolbar: await box(dlg.locator('.buga-print-toolbar')), pdf: await box(dlg.locator('[data-save-pdf]')), printBtn: await box(dlg.getByRole('button', { name: '🖨️ הדפסה' })) };
  await p.screenshot({ path: 'shots/dialog.png' });
  boxes.dialogVp = await dlg.locator('.buga-print-toolbar').evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.dialogPdf = await dlg.locator('[data-save-pdf]').evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.dialogPrint = await dlg.getByRole('button', { name: '🖨️ הדפסה' }).evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  const arts = dlg.locator('.buga-preview-pages article.buga-a4');
  console.log('articles:', await arts.count());
  const svg2 = await arts.nth(1).locator('svg').first().evaluate((e) => e.outerHTML);
  await dlg.getByRole('button', { name: 'סגירת תצוגת ההדפסה' }).click(); await p.waitForTimeout(500);
  await p.locator('[aria-label="תצוגה מקדימה של הדף הראשון"]').evaluate((e, h) => { e.innerHTML = h; }, svg2);
  await shot('cardsSheet');
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  await b.close();
})();
