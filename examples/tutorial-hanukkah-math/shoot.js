// Real captures of ugabuga.co.il/holidays/hanukkah/math, element boxes measured in the DOM (image pixels).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('dialog')) continue; const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await hideFixed(); await p.waitForTimeout(350); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };

  await p.goto(BASE + '/holidays/hanukkah/math', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);
  const grades = p.getByRole('group', { name: 'בחירת כיתה' });
  boxes.grades = await abs(grades);
  await grades.getByRole('button', { name: 'כיתה א׳' }).click(); await p.waitForTimeout(300);
  await shot('s0');
  const g3 = grades.getByRole('button', { name: 'כיתה ג׳' });
  boxes.g3 = await abs(g3);
  await g3.click(); await p.waitForTimeout(300); await shot('s1');
  boxes.h1 = await abs(p.locator('h1'));

  // step 2: answer problem 1 on screen
  const items = p.locator('ol > li:has(input)');
  const li1 = items.nth(0), li2 = items.nth(1);
  boxes.li1 = await abs(li1); boxes.li2 = await abs(li2);
  boxes.q1 = await li1.locator('p').first().innerText();
  boxes.inp1 = await abs(li1.locator('input'));
  await li1.locator('input').fill('36'); await shot('s2');
  boxes.check1 = await abs(li1.getByRole('button', { name: 'בדיקה' }));
  await li1.getByRole('button', { name: 'בדיקה' }).click(); await p.waitForTimeout(300); await shot('s3');
  boxes.fb1 = await abs(li1.locator('p[aria-live]'));
  boxes.fb1Text = await li1.locator('p[aria-live]').innerText();

  // step 3: a wrong answer, then "how to solve"
  boxes.q2 = await li2.locator('p').first().innerText();
  boxes.inp2 = await abs(li2.locator('input'));
  await li2.locator('input').fill('40');
  boxes.check2 = await abs(li2.getByRole('button', { name: 'בדיקה' }));
  await li2.getByRole('button', { name: 'בדיקה' }).click(); await p.waitForTimeout(300); await shot('w1');
  boxes.fb2 = await abs(li2.locator('p[aria-live]'));
  boxes.fb2Text = await li2.locator('p[aria-live]').innerText();
  const how = li2.getByRole('button', { name: 'איך פותרים?' });
  boxes.how = await abs(how);
  await how.click(); await p.waitForTimeout(300); await shot('w2');
  boxes.sol2 = await abs(li2.locator('p.rounded-xl'));
  boxes.sol2Text = await li2.locator('p.rounded-xl').innerText();

  // step 4: the dreidel game, times-table level
  const game = p.locator('#dreidel-game');
  boxes.game = await abs(game);
  const modes = game.getByRole('group', { name: 'רמת המשחק' });
  boxes.modes = await abs(modes);
  const times = modes.getByRole('button', { name: /כפל/ });
  boxes.times = await abs(times);
  await times.click(); await p.waitForTimeout(300); await shot('g0');
  const spinBtn = game.getByRole('button', { name: 'סובבו את הסביבון' });
  boxes.spin = await abs(spinBtn);
  await spinBtn.click(); await p.waitForTimeout(1300); await shot('g1');
  const gq = await game.locator('form p').first().innerText();
  boxes.gq = gq;
  boxes.gqBox = await abs(game.locator('form p').first());
  const mm = gq.match(/(\d+)\s*×\s*(\d+)/);
  const ans = String(Number(mm[1]) * Number(mm[2]));
  boxes.gans = ans;
  const ginp = game.locator('form input');
  boxes.ginp = await abs(ginp);
  await ginp.fill(ans); await shot('g2');
  const gcheck = game.locator('form').getByRole('button', { name: 'בדיקה' });
  boxes.gcheck = await abs(gcheck);
  await gcheck.click(); await p.waitForTimeout(400); await shot('g3');
  boxes.gfb = await abs(game.locator('form p[aria-live]'));
  boxes.gfbText = await game.locator('form p[aria-live]').innerText();
  boxes.score = await game.locator('p', { hasText: 'תשובות נכונות' }).innerText().catch(() => '');

  // step 5: print the worksheet + answer sheet
  const pr = p.locator('button[data-print-main]');
  boxes.print = await abs(pr);
  await p.evaluate(() => scrollTo(0, 0));
  await pr.click(); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'shots/p0.png' });
  await p.mouse.wheel(0, 900); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/p1.png' });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
