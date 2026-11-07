// Real captures of ugabuga.co.il/tools/secret-codes, element boxes measured in the DOM (image pixels).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL', permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('dialog')) continue; const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await hideFixed(); await p.waitForTimeout(350); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };

  await p.goto(BASE + '/tools/secret-codes', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);
  await shot('s0');
  const tool = p.locator('section[aria-labelledby="tool-h"]');
  boxes.tool = await abs(tool);
  boxes.ciphers = await abs(tool.getByRole('group', { name: 'בחירת צופן' }));
  boxes.shiftRow = await abs(tool.getByRole('group', { name: 'כמה אותיות מזיזים' }));
  const k3 = tool.getByRole('group', { name: 'כמה אותיות מזיזים' }).getByRole('button', { name: '3', exact: true });
  boxes.k3 = await abs(k3);
  await k3.click(); await shot('s1');
  boxes.result1 = await p.locator('[aria-live="polite"]').first().innerText();

  // step 2: write your own message
  const ta = tool.locator('textarea');
  boxes.ta = await abs(ta);
  await ta.fill('מחר בעשר ליד השער');
  boxes.out = await abs(p.locator('[aria-live="polite"]').first());
  await shot('s2');
  boxes.result2 = await p.locator('[aria-live="polite"]').first().innerText();
  const copyBtn = tool.getByRole('button', { name: /העתקת התוצאה/ });
  boxes.copy = await abs(copyBtn);
  await copyBtn.click(); await p.waitForTimeout(400); await shot('s3');

  // step 3: decode
  const dec = tool.getByRole('button', { name: /לפענח/ });
  boxes.dec = await abs(dec);
  await dec.click(); await p.waitForTimeout(300); await shot('s4');
  boxes.result4 = await p.locator('[aria-live="polite"]').first().innerText();
  boxes.ta4 = await ta.inputValue();
  const atb = tool.getByRole('group', { name: 'בחירת צופן' }).getByRole('button', { name: /א״ת ב״ש/ });
  boxes.atbash = await abs(atb);

  // step 4: the mission
  const mission = p.locator('section[aria-labelledby="mission-h"]');
  boxes.mission = await abs(mission);
  boxes.missionText = await mission.innerText();
  const inp = mission.locator('input');
  boxes.inp = await abs(inp);
  const hintBtn = mission.getByRole('button', { name: /רמז/ });
  boxes.hint = await abs(hintBtn);
  await hintBtn.click(); await p.waitForTimeout(300); await shot('m1');
  boxes.hintText = await mission.innerText();
  await inp.fill('בוגה אוהב עוגות'); await shot('m2');
  const checkBtn = mission.getByRole('button', { name: 'בדיקה' });
  boxes.check = await abs(checkBtn);
  await checkBtn.click(); await p.waitForTimeout(400); await shot('m3');
  boxes.mission3 = await mission.innerText();

  // step 5: printable sheets
  const pr = p.locator('section[aria-labelledby="print-h"]');
  boxes.print = await abs(pr);
  const all = p.getByRole('button', { name: /הדפסת כל הדפים/ });
  boxes.printAll = await abs(all);
  boxes.sheetNames = await pr.locator('button p').allInnerTexts();
  await all.click(); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'shots/d0.png' });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes).slice(0, 6000));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
