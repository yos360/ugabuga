// Real captures of ugabuga.co.il/tools/flip-clock (src/pages/tools/FlipClock.jsx).
// The page clock is pinned to 10:08:55 on 2026-11-10 (Playwright clock, time still flows) so every shot shows a clean time.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, PATH = 'https://ugabuga.co.il/tools/flip-clock';
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: DSF, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage();
  await p.clock.install({ time: new Date('2026-11-10T10:08:50+02:00') });
  await p.goto(PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.classList.contains('fc-stage')) e.style.display = 'none'; }
  });
  const boxes = {};
  const vb = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (k, wait = 400, ms = 780) => {
    await p.waitForTimeout(wait);
    // land between flips: the cards fall at the tick and finish 0.56 s later
    const now = await p.evaluate(() => Date.now() % 1000);
    await p.waitForTimeout((ms - now + 1000) % 1000);
    await p.screenshot({ path: `shots/${k}.png` });
  };
  const at = async (y) => { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(300); };
  const btn = (re) => p.locator('main button, button').filter({ hasText: re }).first();
  const stage = p.locator('.fc-stage');
  const stTop = await stage.evaluate((e) => e.getBoundingClientRect().top + scrollY);
  // ---- hook / page top
  await at(0); await shot('h0');
  boxes.h1 = await vb(p.locator('h1'));
  // ---- the controls view
  await at(stTop - 150); await shot('a0');
  boxes.stage = await vb(stage);
  boxes.full = await vb(btn(/מסך מלא/));
  boxes.sound = await vb(btn(/בלי צליל/));
  boxes.sec = await vb(btn(/שניות/));
  boxes.date = await vb(btn(/תאריך/));
  boxes.h12 = await vb(btn(/24 שעות/));
  boxes.themes = await vb(p.locator('[role=group][aria-label="צבע השעון"]'));
  boxes.dateLine = await vb(p.locator('.fc-date'));
  // ---- sound on
  await btn(/בלי צליל/).click(); await shot('s1');
  // ---- colours
  for (const [k, re] of [['t1', /כחול לילה/], ['t2', /רטרו כתום/], ['t3', /ורוד/], ['t4', /^.*לבן$/]]) {
    const l = p.locator('[role=group][aria-label="צבע השעון"] button').filter({ hasText: re }).first();
    boxes[k] = await vb(l); await l.click(); await shot(k);
  }
  // ---- options
  await p.locator('[role=group][aria-label="צבע השעון"] button').filter({ hasText: /שחור קלאסי/ }).click();
  await shot('o0');
  await btn(/שניות/).click(); await shot('o1');
  boxes.o1sec = await vb(btn(/שניות/)); boxes.o1h12 = await vb(btn(/24 שעות/));
  await btn(/24 שעות/).click(); await shot('o2');
  boxes.h12b = await vb(btn(/12 שעות/)); boxes.o2date = await vb(btn(/תאריך/));
  await btn(/תאריך/).click(); await shot('o3');
  boxes.o3date = await vb(btn(/תאריך/));
  // back to the default look
  await btn(/תאריך/).click(); await btn(/12 שעות/).click(); await btn(/שניות/).click();
  await p.waitForTimeout(300);
  // ---- full screen
  await at(stTop - 150);
  await btn(/מסך מלא/).click();
  await p.mouse.move(700, 500);
  await shot('f0', 600);
  // one second in three frames: top half falling, bottom half rising, settled
  for (let i = 1; i <= 3; i++) { await shot(`f${i}a`, 0, 130); await shot(`f${i}b`, 0, 400); await shot(`f${i}`, 0, 780); }
  const bar = p.locator('.fc-bar');
  if (await bar.count()) { boxes.bar = await vb(bar); boxes.exit = await vb(bar.getByRole('button', { name: /יציאה/ })); boxes.barSound = await vb(bar.getByRole('button').first()); }
  await p.waitForTimeout(3600);
  await shot('f4', 0);
  await shot('f5', 0, 130); await shot('f6', 0, 400); await shot('f7', 0, 780);
  boxes.dateFull = await vb(p.locator('.fc-date'));
  console.log('date text:', await p.locator('.fc-date').innerText());
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
