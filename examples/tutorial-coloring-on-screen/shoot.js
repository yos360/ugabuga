// Real captures of ugabuga.co.il/printables/coloring/hanukkiah/27 and its on-screen colouring layer
// (src/pages/printables/PhoneColoring.jsx). Element boxes are measured in the DOM (image pixels).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il', PATH = '/printables/coloring/hanukkiah/27';
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = { taps: {} };
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await p.waitForTimeout(350); await p.screenshot({ path: `shots/${n}.png` }); };

  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await hideFixed();
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/d0.png', fullPage: true });
  boxes.open = await abs(p.getByRole('button', { name: /לצבוע את הציור במסך/ }));
  boxes.h1 = await abs(p.locator('h1'));

  // the colouring layer (fixed, full screen) — reload so nothing is hidden
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: /לצבוע את הציור במסך/ }).click();
  await p.waitForTimeout(2500);
  await shot('o0');
  const dlg = p.getByRole('dialog');
  const box = async (name) => abs(dlg.getByRole('button', { name }));
  boxes.undo = await box(/ביטול/); boxes.clear = await box(/מהתחלה/); boxes.save = await box(/שמירה/); boxes.close = await box('סגירה');
  boxes.palette = await abs(dlg.getByRole('radiogroup', { name: 'צבעים' }));
  boxes.hint = await abs(dlg.locator('p', { hasText: 'בוחרים צבע ומקישים' }));
  boxes.canvas = await abs(dlg.locator('canvas'));
  for (const n of ['כחול', 'צהוב', 'אדום', 'חום', 'תכלת', 'כתום', 'מחק (לבן)']) boxes['c_' + n] = await abs(dlg.getByRole('radio', { name: n, exact: true }));

  const pick = (n) => dlg.getByRole('radio', { name: n, exact: true }).click();
  const tap = async (k, x, y) => { await p.mouse.click(x, y); boxes.taps[k] = [Math.round(x * DSF), Math.round(y * DSF)]; await p.waitForTimeout(150); };
  await pick('כחול'); await shot('o0b');
  await tap('star', 394, 152); await shot('o1');
  await pick('צהוב'); await tap('mstar', 478, 400); await tap('flame', 478, 294); await shot('o2');
  await pick('אדום'); await tap('heart1', 424, 406); await tap('heart2', 532, 406); await shot('o3');
  await pick('חום'); await tap('table', 344, 566); await shot('o4');
  await dlg.getByRole('button', { name: /ביטול/ }).click(); await shot('o5');
  await pick('תכלת'); await tap('window', 608, 144); await pick('כתום'); await tap('blocks', 478, 452); await pick('חום'); await tap('table2', 344, 566); await shot('o6');
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
