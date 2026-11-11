// Real captures of ugabuga.co.il/board-games/snakes-and-ladders/multiplication
// (src/pages/printables/SnakesLaddersMath.jsx). Controls panel clips at DSF 2, sheets as SVG -> PNG at DSF 4.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://ugabuga.co.il/board-games/snakes-and-ladders/multiplication', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const boxes = {};
  const bt = (re) => p.locator('button').filter({ hasText: re }).first();
  // the controls block = parent of the 3 role=group + the "new" button
  const ctl = p.locator('div[role="group"][aria-label="רמה"]').locator('xpath=..');
  boxes.ctl = await box(ctl);
  for (const [k, re] of [['lEasy', /^קל/], ['lFull', /^כל לוח הכפל/], ['lHard', /^מאתגר/], ['mFilled', /^עם תרגילים/], ['mBlank', /^ריק/], ['cYes', /^בצבע$/], ['cNo', /^שחור/], ['fresh', /תרגילים חדשים/]]) boxes[k] = await box(bt(re));
  boxes.print = await box(p.locator('button[data-print-main]'));
  const PAD = 24;
  // panel = controls + print button area
  const px = Math.min(boxes.ctl[0], boxes.print[0]) - PAD, py = boxes.ctl[1] - PAD;
  const pr = Math.max(boxes.ctl[0] + boxes.ctl[2], boxes.print[0] + boxes.print[2]) + PAD;
  boxes.panel = [px, py, pr - px, boxes.print[1] + boxes.print[3] + 40 - py];
  const clip = async (k) => { await p.waitForTimeout(350); const [x, y, w, h] = boxes.panel; await p.screenshot({ path: `shots/${k}.png`, fullPage: true, clip: { x, y, width: w, height: h } }); };
  const sheets = async (k) => {
    await p.waitForTimeout(350);
    const svgs = await p.locator('svg[aria-label]').evaluateAll((els) => els.filter((e) => /סולמות ונחשים|כרטיס תשובות/.test(e.getAttribute('aria-label'))).map((e) => [e.getAttribute('aria-label'), e.outerHTML]));
    svgs.forEach(([lbl, html], i) => fs.writeFileSync(`shots/${k}-${i}.svg`, html));
    return svgs.map((s) => s[0]);
  };
  console.log('labels', await sheets('full1'));
  await clip('cFull');
  await bt(/^קל/).click(); await clip('cEasy'); await sheets('easy1');
  await bt(/^מאתגר/).click(); await clip('cHard'); await sheets('hard1');
  await bt(/^כל לוח הכפל/).click(); await p.waitForTimeout(300);
  await bt(/תרגילים חדשים/).click(); await clip('cFresh'); await sheets('full2');
  await bt(/תרגילים חדשים/).click(); await sheets('full3');
  await bt(/^ריק/).click(); await clip('cBlank'); await sheets('blank');
  await bt(/^שחור/).click(); await clip('cBW'); await sheets('blankbw');
  await bt(/^עם תרגילים/).click(); await p.waitForTimeout(300); await sheets('bw');
  await bt(/^בצבע$/).click(); await p.waitForTimeout(300);
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  // rasterise sheet svgs at high res
  const files = fs.readdirSync('shots').filter((f) => f.endsWith('.svg'));
  const rp = await b.newPage({ viewport: { width: 1000, height: 1350 }, deviceScaleFactor: 2 });
  const css = await p.evaluate(() => [...document.styleSheets].map((s) => { try { return [...s.cssRules].map((r) => r.cssText).join('\n'); } catch { return ''; } }).join('\n'));
  for (const f of files) {
    const svg = fs.readFileSync('shots/' + f, 'utf8');
    await rp.setContent(`<!doctype html><html dir="rtl"><head><base href="https://ugabuga.co.il/"><style>${css}</style><style>html,body{margin:0;background:#fff}svg{width:1000px!important;height:1350px!important;display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
    await rp.waitForTimeout(300);
    await rp.locator('svg').first().screenshot({ path: 'shots/' + f.replace('.svg', '.png') });
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
