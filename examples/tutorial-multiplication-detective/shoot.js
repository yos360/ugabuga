// Real captures of ugabuga.co.il/learn/multiplication-table/game (src/learn/MultiplicationDetective.jsx).
// Full-page shots; element boxes are measured in the DOM (image pixels, page coordinates).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il', PATH = '/learn/multiplication-table/game';
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  // seeded random so the round is the same on every run
  await c.addInitScript(() => { let s = 20261108; Math.random = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648); });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await p.waitForTimeout(300); await hideFixed(); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };
  const cell = (r, cc) => p.locator('table.mt-table tbody tr').nth(r - 1).locator('td').nth(cc - 1);

  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await hideFixed();
  await shot('s0');
  boxes.h1 = await abs(p.locator('h1'));
  boxes.modes = await abs(p.locator('.md-modes'));
  const modes = p.locator('.md-mode');
  boxes.mLight = await abs(modes.nth(0)); boxes.mHunt = await abs(modes.nth(1)); boxes.mTwins = await abs(modes.nth(2));
  boxes.chip5 = await abs(p.getByRole('button', { name: /קטן: עד 5×5/ }));
  boxes.chip10 = await abs(p.getByRole('button', { name: /רגיל: עד 10×10/ }));
  boxes.chipHide = await abs(p.getByRole('button', { name: /בלי מספרים בצדדים/ }));
  boxes.go = await abs(p.getByRole('button', { name: /יוצאים לחקירה/ }));

  // ---- light: a square lights up, write its exercise
  // restart until the first square is a 'nice' one (both factors 3..9, different)
  const litOf = () => p.evaluate(() => { const td = document.querySelector('table.mt-table td.hit'); const tr = td.parentElement; return [[...tr.parentElement.children].indexOf(tr) + 1, [...tr.querySelectorAll('td')].indexOf(td) + 1]; });
  for (let k = 0; k < 40; k++) {
    await p.getByRole('button', { name: /יוצאים לחקירה/ }).click(); await p.waitForTimeout(250);
    const [r, cc] = await litOf(); if (r >= 3 && cc >= 3 && r <= 9 && cc <= 9 && r !== cc) break;
    await p.getByRole('button', { name: /משימה אחרת/ }).click(); await p.waitForTimeout(150);
  }
  await p.waitForTimeout(300);
  await shot('L0');
  const lit = await litOf();
  boxes.litRC = lit;
  boxes.lit = await abs(cell(lit[0], lit[1]));
  boxes.bar = await abs(p.locator('.mt-bar'));
  boxes.qbox = await abs(p.locator('.ln-box').first());
  boxes.inA = await abs(p.getByLabel('המספר הראשון'));
  boxes.inB = await abs(p.getByLabel('המספר השני'));
  boxes.check = await abs(p.getByRole('button', { name: /בדיקה/ }));
  boxes.table = await abs(p.locator('table.mt-table'));
  boxes.rowHead = await abs(p.locator('table.mt-table tbody tr').nth(lit[0] - 1).locator('th'));
  boxes.colHead = await abs(p.locator('table.mt-table thead th').nth(lit[1]));
  await p.getByLabel('המספר הראשון').fill(String(lit[0]));
  await p.getByLabel('המספר השני').fill(String(lit[1]));
  await shot('L1');
  await p.getByRole('button', { name: /בדיקה/ }).click();
  await p.waitForTimeout(150);
  await shot('L2');
  boxes.fbL = await abs(p.locator('.md-fb'));
  boxes.lightText = await p.locator('.md-fb').innerText();

  // ---- hunt: an exercise appears, tap its square
  await p.getByRole('button', { name: /משימה אחרת/ }).click();
  await p.waitForTimeout(400);
  await p.locator('.md-mode').nth(1).click();
  for (let k = 0; k < 40; k++) {
    await p.getByRole('button', { name: /יוצאים לחקירה/ }).click(); await p.waitForTimeout(250);
    const q = (await p.locator('.md-eq').innerText()).match(/\d+/g).map(Number);
    if (q[0] >= 3 && q[1] >= 3 && q[0] <= 9 && q[1] <= 9 && q[0] !== q[1] && q[0] * q[1] !== boxes.litRC[0] * boxes.litRC[1]) break;
    await p.getByRole('button', { name: /משימה אחרת/ }).click(); await p.waitForTimeout(150);
  }
  await p.waitForTimeout(300);
  await shot('H0');
  const hq = (await p.locator('.md-eq').innerText()).match(/\d+/g).map(Number);
  boxes.huntRC = hq;
  boxes.hcell = await abs(cell(hq[0], hq[1]));
  boxes.qboxH = await abs(p.locator('.ln-box').first());
  boxes.rowHeadH = await abs(p.locator('table.mt-table tbody tr').nth(hq[0] - 1).locator('th'));
  boxes.colHeadH = await abs(p.locator('table.mt-table thead th').nth(hq[1]));
  await cell(hq[0], hq[1]).locator('button').click();
  await p.waitForTimeout(150);
  await shot('H1');
  boxes.huntText = await p.locator('.md-fb').innerText();

  // ---- twins: a number appears, find all its squares
  await p.getByRole('button', { name: /משימה אחרת/ }).click();
  await p.waitForTimeout(400);
  await p.locator('.md-mode').nth(2).click();
  for (let k = 0; k < 40; k++) {
    await p.getByRole('button', { name: /יוצאים לחקירה/ }).click(); await p.waitForTimeout(250);
    const n = Number(await p.locator('.md-eq b').innerText());
    if ([12, 24, 18, 20, 30, 40].includes(n)) break;
    await p.getByRole('button', { name: /משימה אחרת/ }).click(); await p.waitForTimeout(150);
  }
  await p.waitForTimeout(300);
  await shot('T0');
  const num = Number(await p.locator('.md-eq b').innerText());
  const cells = [];
  for (let r = 1; r <= 10; r++) for (let k = 1; k <= 10; k++) if (r * k === num) cells.push([r, k]);
  boxes.twinNum = num; boxes.twinCells = [];
  for (const [r, k] of cells) boxes.twinCells.push(await abs(cell(r, k)));
  boxes.qboxT = await abs(p.locator('.ln-box').first());
  for (let i = 0; i < cells.length; i++) {
    await cell(cells[i][0], cells[i][1]).locator('button').click();
    if (i === 1 && cells.length > 2) await shot('T1');
  }
  await p.waitForTimeout(150);
  await shot('T2');
  boxes.twinText = await p.locator('.md-fb').innerText();
  boxes.twinLine = await p.locator('.ln-box').first().innerText();
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

