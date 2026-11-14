// Real captures of ugabuga.co.il/letters/week and /letters/mem/week
// (src/pages/letters/LetterWeek.jsx + src/components/printables/PrintableShell.jsx).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1080;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('[role=dialog]') || e.closest('dialog') || e.querySelector('[data-print-main]')) continue; const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const vbox = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  const boxes = {};
  const clipShot = async (k, y, h) => { await p.screenshot({ path: `shots/${k}.png`, clip: { x: 0, y, width: VW, height: h }, fullPage: true }); };
  const view = async (k) => { await p.screenshot({ path: `shots/${k}.png` }); };

  // hub
  await p.goto('https://ugabuga.co.il/letters/week', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500); await hide();
  boxes.hubH1 = await box(p.locator('h1'));
  const grid = p.locator('div.grid').filter({ has: p.locator('a[href="/letters/mem/week"]') }).first();
  boxes.hubGrid = await box(grid);
  boxes.hubMem = await box(p.locator('a[href="/letters/mem/week"]'));
  boxes.hubY = boxes.hubH1[1] - 20;
  await clipShot('hub', boxes.hubY, 900);

  // kit page for מ
  await p.goto('https://ugabuga.co.il/letters/mem/week', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500); await hide();
  boxes.kitH1 = await box(p.locator('h1'));
  boxes.printBtn = await box(p.locator('[data-print-main]'));
  boxes.printPanel = await box(p.locator('[data-print-main]').locator('xpath=..'));
  const sheets = p.locator('main svg[role=img]');
  const ns = await sheets.count(); console.log('page sheets:', ns);
  for (let i = 0; i < ns; i++) boxes['sheet' + i] = await box(sheets.nth(i));
  boxes.kitY = boxes.kitH1[1] - 20;
  await clipShot('kitTop', boxes.kitY, 1000);
  const plan = p.locator('h2', { hasText: 'תוכנית לשבוע' });
  boxes.plan = await box(plan.locator('xpath=..'));
  await clipShot('plan', boxes.plan[1] - 20, Math.min(900, boxes.plan[3] + 40));

  // print dialog
  await p.evaluate(() => scrollTo(0, 0));
  await p.locator('[data-print-main]').click(); await p.waitForTimeout(2500);
  await view('print');
  const pd = p.locator('dialog.buga-print-dialog');
  boxes.pdf = await vbox(pd.locator('[data-save-pdf]'));
  boxes.prn = await vbox(pd.getByRole('button', { name: /הדפסה/ }).last());
  const pages = pd.locator('.buga-preview-pages article');
  const n = await pages.count();
  console.log('pages:', n);
  for (let i = 0; i < n; i++) {
    const a = pages.nth(i);
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await a.screenshot({ path: `shots/pp${i}.png` });
    boxes['pp' + i] = await vbox(a);
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
