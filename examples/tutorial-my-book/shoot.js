// Real captures of ugabuga.co.il/printables/my-book (src/pages/printables/MyBookComic.jsx).
// Panel clips at DSF 2 (CSS-px boxes in shots/boxes.json), sheet SVGs as element shots at DSF 4.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/printables/my-book', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const boxes = {};
  const panel = p.locator('textarea').locator('xpath=ancestor::div[contains(@class,"space-y-4")][1]/..');
  boxes.panel = await box(panel);
  const bt = (re) => p.locator('button').filter({ hasText: re }).first();
  const PAD = 20;
  const clip = async (k) => { await p.waitForTimeout(350); const [x, y, w, h] = boxes.panel; await p.screenshot({ path: `shots/${k}.png`, fullPage: true, clip: { x: x - PAD, y: y - PAD, width: w + PAD * 2, height: h + PAD * 2 } }); };
  const sheet = p.locator('svg[aria-label^="ספר מקופל"]').first();
  const sheetShot = async (k) => { await p.waitForTimeout(350); const c2 = await b.newContext(); await c2.close(); const svg = await sheet.evaluate((e) => e.outerHTML); fs.writeFileSync(`shots/${k}.svg`, svg); };
  for (const [k, re] of [['pAbout', /עליי/], ['pStory', /סיפור/], ['pFamily', /משפחה/], ['pHan', /חנוכה/], ['pWinter', /חורף/], ['pBlank', /ריק/]]) boxes[k] = await box(bt(re));
  boxes.title = await box(p.locator('input').first());
  boxes.name = await box(p.locator('input[placeholder="אפשר להשאיר ריק"]'));
  boxes.text = await box(p.locator('textarea'));
  for (const [k, re] of [['sDraw', /רק ציור/], ['sLines', /ציור ו/], ['sWrite', /כתיבה/], ['sComic', /^.*קומיקס$/]]) boxes[k] = await box(p.locator('button').filter({ hasText: re }).last());
  boxes.howYes = await box(bt(/^להוסיף$/));
  await clip('c0'); await sheetShot('sh0');
  await bt(/חנוכה/).click(); await clip('c1'); await sheetShot('sh1');
  await p.locator('input[placeholder="אפשר להשאיר ריק"]').fill('נועה'); await clip('c2'); await sheetShot('sh2');
  const st = [['s1', /רק ציור/], ['s2', /ציור ו/], ['s3', /כתיבה/], ['s4', /^.*קומיקס$/]];
  for (const [k, re] of st) { await p.locator('button').filter({ hasText: re }).last().click(); await clip('c' + k); await sheetShot('sh' + k); }
  await p.locator('button').filter({ hasText: /ציור ו/ }).last().click(); await p.waitForTimeout(400);
  // print area: previews + the red button
  const btn = p.locator('button[data-print-main]');
  boxes.print = await box(btn);
  const prev = p.locator('svg[aria-label="הוראות קיפול הספר"]').first();
  boxes.sheetSmall = await box(sheet); boxes.foldSmall = await box(prev);
  const area = [Math.min(boxes.print[0], boxes.foldSmall[0]) - 30, boxes.sheetSmall[1] - 60, 0, 0];
  area[2] = boxes.sheetSmall[0] + boxes.sheetSmall[2] + 30 - area[0]; area[3] = boxes.sheetSmall[3] + 110;
  boxes.printArea = area;
  await p.screenshot({ path: 'shots/pr.png', fullPage: true, clip: { x: area[0], y: area[1], width: area[2], height: area[3] } });
  fs.writeFileSync('shots/fold.svg', await prev.evaluate((e) => e.outerHTML));
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
