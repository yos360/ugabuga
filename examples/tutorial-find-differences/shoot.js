// Real captures of ugabuga.co.il/online-games/find-differences (src/arcade/games/SpotDiff.jsx)
// and /printables/activity/find-differences/animals (src/pages/printables/ActivityWorksheet.jsx).
// Level 1 differences come from spotLevel(1) (diffs.mjs): giraffe removed, rabbit and pig resized.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const DIFFS = [[31.01, 10.69], [29.95, 33.08], [90.45, 9.52]];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const boxes = {};
  // ---------- the game ----------
  {
    const c = await b.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2, locale: 'he-IL' });
    const p = await c.newPage();
    await p.clock.install();
    await p.goto('https://ugabuga.co.il/online-games/find-differences', { waitUntil: 'networkidle' });
    await p.clock.runFor(1500);
    await p.getByText('שחקו עכשיו').first().click();
    await p.clock.runFor(2500);
    const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
    const shot = async (k) => { await p.clock.runFor(450); await p.screenshot({ path: `shots/${k}.png` }); };
    boxes.levels = await box(p.locator('.fb-levels'));
    boxes.lv1 = await box(p.locator('.fb-lv').first());
    boxes.hud = await box(p.locator('.fb-levels').locator('xpath=ancestor::div[contains(@class,"arc-game")]').locator('> *').first());
    await shot('m0');
    await p.locator('.fb-lv').first().click();
    await p.clock.runFor(2000);
    const panels = await p.locator('svg.spot-panel').evaluateAll((es) => es.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
    boxes.panels = panels;
    const at = (pi, d) => [panels[pi][0] + d[0] / 100 * panels[pi][2], panels[pi][1] + d[1] / 70 * panels[pi][3]];
    boxes.diffs = DIFFS.map((d) => [at(0, d), at(1, d)]);
    await shot('g0');
    let [x, y] = at(1, DIFFS[2]); await p.mouse.click(x, y); await shot('g1');           // pig, right picture
    await p.clock.runFor(8000);
    const hb = p.locator('button[aria-label="רמז"], button[title="רמז"]').first();
    boxes.hint = await box(hb);
    await shot('g1b');                                                                     // hint button lit (10 s+)
    await hb.click(); await shot('g2');                                                    // orange ring on the giraffe
    [x, y] = at(0, DIFFS[0]); await p.mouse.click(x, y); await shot('g3');                // giraffe, left picture
    [x, y] = at(1, DIFFS[1]); await p.mouse.click(x, y); await shot('g4');                // rabbit → all found
    await p.clock.runFor(4000); await shot('w0');
    boxes.hudRow = await box(p.locator('button[aria-label="שלבים"], button[title="שלבים"]').first());
    await p.locator('button[aria-label="שלבים"]').first().evaluate((e) => e.click()); await shot('m1');
    boxes.lv2 = await box(p.locator('.fb-lv').nth(1));
    await c.close();
  }
  // ---------- the printable ----------
  {
    const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL' });
    const p = await c.newPage();
    await p.goto('https://ugabuga.co.il/printables/activity/find-differences/animals', { waitUntil: 'networkidle' });
    await p.waitForTimeout(2000);
    await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
    const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
    const bt = (re) => p.locator('button').filter({ hasText: re }).first();
    boxes.pThemes = await box(bt(/חיות/).locator('..'));
    for (const [k, re] of [['pAnimals', /חיות/], ['pSpace', /חלל/], ['a34', /גיל 3/], ['a56', /גיל 5/], ['a78', /גיל 7/], ['swap', /החליפו/], ['print', /הדפיסו דף זה/]]) boxes[k] = await box(bt(re));
    const sheet = p.locator('.spot-sheet').locator('xpath=ancestor::*[contains(@class,"print-sheet")][1]');
    const sheetEl = (await sheet.count()) ? sheet : p.locator('.spot-sheet').locator('..').locator('..');
    boxes.sheet = await box(sheetEl);
    boxes.key = await box(p.locator('.spot-key'));
    const ctl = async (k) => { const [x0, y0] = [boxes.pThemes[0] - 30, boxes.pThemes[1] - 30]; const x1 = boxes.pThemes[0] + boxes.pThemes[2] + 30, y1 = boxes.print[1] + boxes.print[3] + 30; boxes.ctl = [x0, y0, x1 - x0, y1 - y0]; await p.waitForTimeout(400); await p.screenshot({ path: `shots/${k}.png`, fullPage: true, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } }); };
    const sh = async (k) => { await p.waitForTimeout(400); await sheetEl.screenshot({ path: `shots/${k}.png` }); };
    await ctl('p0'); await sh('s0');
    await bt(/גיל 3/).click(); await ctl('p1'); await sh('s1');
    await bt(/החליפו/).click(); await ctl('p2'); await sh('s2');
    await bt(/חלל/).click(); await ctl('p3'); await sh('s3');
    await p.locator('.spot-key').screenshot({ path: 'shots/key.png' });
    boxes.sheet3 = await box(sheetEl); boxes.key3 = await box(p.locator('.spot-key'));
    await c.close();
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
