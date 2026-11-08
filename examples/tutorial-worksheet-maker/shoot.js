// Real captures of ugabuga.co.il/tools/worksheet-maker, element boxes measured in the DOM (image pixels).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il';
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('dialog') || e.querySelector('[data-print-main]')) continue; const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await hideFixed(); await p.waitForTimeout(400); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };

  await p.goto(BASE + '/tools/worksheet-maker', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);
  const title = p.getByLabel('כותרת הדף');
  const ta = p.locator('textarea');
  boxes.title = await abs(title); boxes.ta = await abs(ta);
  boxes.h1 = await abs(p.locator('h1'));
  await shot('s0');

  // step 1: our own title and words (no emoji yet)
  await title.fill('מילים של חורף');
  await ta.fill('גשם\nענן\nמטריה\nמגפיים\nשלולית');
  await p.waitForTimeout(300);
  await shot('s1');
  boxes.tasks = await abs(p.getByRole('group', { name: 'משימות' }));
  boxes.match = await abs(p.getByRole('button', { name: /מילה ותמונה/ }));
  boxes.need = await abs(p.locator('p', { hasText: 'צריך אימוג׳י' }));
  boxes.count = await abs(p.locator('p[aria-live="polite"]'));
  boxes.count1 = await p.locator('p[aria-live="polite"]').innerText();

  // step 2: an emoji after each word
  await ta.fill('גשם 🌧️\nענן ☁️\nמטריה ☂️\nמגפיים 👢\nשלולית 💧');
  await p.waitForTimeout(300);
  await shot('s2');
  boxes.ta2 = await abs(ta);
  boxes.match2 = await abs(p.getByRole('button', { name: /מילה ותמונה/ }));
  boxes.count2 = await p.locator('p[aria-live="polite"]').innerText();

  // step 3: add the copy task
  const copy = p.getByRole('button', { name: /העתקה/ });
  boxes.copy = await abs(copy);
  await copy.click(); await p.waitForTimeout(300);
  await shot('s3');
  boxes.tasks3 = await abs(p.getByRole('group', { name: 'משימות' }));
  boxes.count3 = await p.locator('p[aria-live="polite"]').innerText();
  boxes.countBox3 = await abs(p.locator('p[aria-live="polite"]'));

  // step 4: the answer key + the preview of every page
  const keyGrp = p.getByRole('group', { name: 'דף תשובות' });
  boxes.key = await abs(keyGrp);
  boxes.keyYes = await abs(keyGrp.getByRole('button', { name: 'כן' }));
  const prev = p.locator('[aria-label^="תצוגה מקדימה"]');
  boxes.prev = await abs(prev);
  boxes.prevLabel = await prev.getAttribute('aria-label');
  const cells = prev.locator(':scope > div');
  boxes.ncells = await cells.count();
  boxes.cells = [];
  for (let i = 0; i < boxes.ncells; i++) boxes.cells.push(await abs(cells.nth(i)));
  boxes.pages = await p.locator('p', { hasText: 'דפי A4 בהדפסה אחת' }).first().innerText().catch(() => '');
  const pr = p.locator('button[data-print-main]');
  boxes.print = await abs(pr);
  await shot('s4');

  // step 5: print
  await p.evaluate(() => scrollTo(0, 0));
  await pr.click(); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'shots/p0.png' });
  await p.mouse.wheel(0, 900); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/p1.png' });
  await p.mouse.wheel(0, 2400); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/p2.png' });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
