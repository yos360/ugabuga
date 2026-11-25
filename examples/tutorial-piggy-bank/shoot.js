// Real captures of ugabuga.co.il/learn/money/piggy-bank (src/learn/subjects/PiggyBank.jsx, piggyBankMath.js, PrintableShell.jsx).
// Full-page screenshots at DSF 2 -> img/<state>.png; big sheet renders -> img/sheet-<k>.png; boxes (page CSS) -> boxes.js.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  await c.route(/supabase\.co\//, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const p = await c.newPage();
  await p.goto(process.env.SHOOT_URL || 'https://ugabuga.co.il/learn/money/piggy-bank', { waitUntil: 'networkidle' });
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
  const lab = (t) => p.locator('label', { hasText: t });
  const calc = p.locator('section[aria-labelledby="pb-calc"]');
  const grab = async () => ({
    what: await box(grp('מה להדפיס')), both: await box(btn('קופה + לוח חיסכון')), size: await box(grp('גודל הקופה')), tall: await box(btn('גבוהה (4.4×4.4×7)')),
    name: await box(lab('שם הילד או הילדה')), goal: await box(lab('מה אני חוסך')), target: await box(lab('כמה המטרה עולה')), coinLine: await box(p.locator('p', { hasText: 'מ־20 המטבעות' })),
    color: await box(grp('צבע')), bw: await box(btn('שחור-לבן, לצביעה בבית')),
    preview: await box(p.locator('[aria-label^="תצוגה מקדימה"]')), print: await box(p.locator('[data-print-main]')),
    calc: await box(calc), cTarget: await box(calc.locator('label').nth(0)), cWeekly: await box(calc.locator('label').nth(1)), cSaved: await box(calc.locator('label').nth(2)), status: await box(calc.locator('[role=status]')),
  });
  const shot = async (k) => { await hide(); await p.waitForTimeout(300); boxes[k] = await grab(); await p.screenshot({ path: `img/${k}.png`, fullPage: true }); console.log(k, JSON.stringify(boxes[k])); };
  const svgs = async () => {
    await p.locator('[data-print-main]').click(); await p.waitForTimeout(1200);
    const d = p.locator('dialog.buga-print-dialog');
    const out = await d.locator('.buga-preview-pages article.buga-a4 svg').evaluateAll((l) => l.filter((e) => e.getAttribute('role') === 'img' && !e.parentElement.closest('svg')).map((e) => e.outerHTML));
    await d.getByRole('button', { name: 'סגירת תצוגת ההדפסה' }).click(); await p.waitForTimeout(500);
    console.log('sheets', out.length); return out;
  };

  await shot('start');
  console.log('preview label:', await p.locator('[aria-label^="תצוגה מקדימה"]').first().getAttribute('aria-label'));
  await shot('tall');
  await lab('שם הילד או הילדה').locator('input').fill('נועם'); await p.waitForTimeout(200); await shot('named');
  await lab('מה אני חוסך').locator('input').fill('אופניים'); await p.waitForTimeout(200); await shot('goal');
  console.log('coinLine:', await p.locator('p', { hasText: 'מ־20 המטבעות' }).innerText());
  const sheetsColor = await svgs();
  await calc.locator('input').nth(2).fill('30'); await p.waitForTimeout(250); await shot('calc');
  console.log('status:', await calc.locator('[role=status]').innerText());
  await btn('שחור-לבן, לצביעה בבית').click(); await p.waitForTimeout(250); await shot('bw');
  const sheetsBw = await svgs();
  console.log('pages:', await p.locator('p.font-bold.text-lg').first().innerText(), '| print:', await p.locator('[data-print-main]').innerText());
  await p.locator('[data-print-main]').click(); await p.waitForTimeout(1500);
  await hide();
  const dlg = p.locator('dialog.buga-print-dialog');
  const vp = (l) => l.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.dialog = { toolbar: await vp(dlg.locator('.buga-print-toolbar')), pdf: await vp(dlg.locator('[data-save-pdf]')), printBtn: await vp(dlg.getByRole('button', { name: '🖨️ הדפסה' })) };
  console.log('dialog', JSON.stringify(boxes.dialog));
  await p.screenshot({ path: 'img/dialog.png' });
  // big renders of the real sheets (same SVG markup as the page), 900 CSS px wide at DSF 2
  const q = await c.newPage(); await q.setViewportSize({ width: 900, height: 1215 });
  const render = async (svg, k) => { await q.setContent(`<html><body style="margin:0;background:#fff">${svg.replace('<svg', '<svg style="width:900px;height:auto;display:block"')}</body></html>`); await q.waitForTimeout(300); await q.screenshot({ path: `img/sheet-${k}.png`, fullPage: true }); };
  await render(sheetsColor[0], 'box'); await render(sheetsColor[1], 'tracker'); await render(sheetsBw[1], 'trackerBw'); await render(sheetsBw[0], 'boxBw');
  fs.writeFileSync('boxes.js', 'globalThis.BOXES = ' + JSON.stringify(boxes) + ';\n');
  await b.close();
})();
