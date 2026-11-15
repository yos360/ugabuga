// Real captures of ugabuga.co.il/math/symmetry (src/math/SymmetryGuide.jsx).
// Game: level "קל" (6×6, vertical axis, the right half is given) — the first design; we paint the mirror cells,
// first with one wrong + one missing cell, then fixed. Quiz: square (right answer), rectangle (wrong answer 4).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('dialog')) continue; const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const vbox = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  const boxes = {};
  const scrollTo = async (loc, off) => { await loc.evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const shot = (k) => p.screenshot({ path: `shots/${k}.png` });
  const btn = (re, root = p) => root.getByRole('button', { name: re });
  await p.goto('https://ugabuga.co.il/math/symmetry', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500); await hide();
  const h1 = p.locator('h1');
  await scrollTo(h1, 30);
  boxes.top = { h1: await vbox(h1), game: await vbox(p.locator('a[href="#game"]')), quiz: await vbox(p.locator('a[href="#quiz"]')), print: await vbox(btn(/דפי עבודה להדפסה/).first()), what: await vbox(p.locator('#what-h').locator('..')) };
  await shot('top');

  // ---- game ----
  const game = p.locator('#game');
  await scrollTo(game, 20); await hide();
  const levels = game.locator('[aria-label="רמת קושי"] button');
  const grid = game.locator('div[dir="ltr"]');
  const cells = grid.locator('button');
  const n = Math.round(Math.sqrt(await cells.count()));
  const labels = await cells.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  const want = [];
  labels.forEach((l, i) => { if (l.startsWith('משבצת נתונה צבועה')) { const r = Math.floor(i / n), cc = i % n; want.push(r * n + (n - 1 - cc)); } });
  console.log('n', n, 'given painted', want.length);
  const fb = game.locator('[aria-live="polite"]');
  const grabG = async () => ({ levels: await vbox(game.locator('[aria-label="רמת קושי"]')), easy: await vbox(levels.nth(0)), hard: await vbox(levels.nth(2)), grid: await vbox(grid), check: await vbox(btn(/בדיקה/, game)), clear: await vbox(btn(/ניקוי/, game)), other: await vbox(btn(/ציור אחר/, game)), fb: await vbox(fb), cell: await vbox(cells.nth(0)), text: await vbox(game.locator('p').nth(1)) });
  boxes.game0 = await grabG(); await shot('game0');
  // paint half of the cells
  const half = Math.ceil(want.length / 2);
  for (let i = 0; i < half; i++) await cells.nth(want[i]).click();
  boxes.gameHalf = await grabG(); await shot('gameHalf');
  // the rest, but skip the last wanted cell and paint one wrong cell
  for (let i = half; i < want.length - 1; i++) await cells.nth(want[i]).click();
  let wrongIdx = -1;
  for (let i = 0; i < n * n; i++) { const cc = i % n; if (cc < n / 2 && !want.includes(i)) { wrongIdx = i; break; } }
  await cells.nth(wrongIdx).click();
  boxes.gameFull = await grabG(); await shot('gameFull');
  await btn(/בדיקה/, game).click(); await p.waitForTimeout(500);
  console.log('wrong fb:', (await fb.innerText()).replace(/\n/g, ' | '));
  boxes.gameWrong = { ...(await grabG()), wrongCell: await vbox(cells.nth(wrongIdx)), missCell: await vbox(cells.nth(want[want.length - 1])) };
  await shot('gameWrong');
  const showMiss = fb.getByRole('button', { name: /הראו לי איפה חסר/ });
  if (await showMiss.count()) { await showMiss.click(); await p.waitForTimeout(300); boxes.gameMiss = await grabG(); await shot('gameMiss'); }
  // fix
  await cells.nth(wrongIdx).click(); await cells.nth(want[want.length - 1]).click();
  await btn(/בדיקה/, game).click(); await p.waitForTimeout(600);
  console.log('ok fb:', (await fb.innerText()).replace(/\n/g, ' | '));
  boxes.gameOk = await grabG(); await shot('gameOk');
  // hard level
  await levels.nth(2).click(); await p.waitForTimeout(400);
  boxes.gameHard = await grabG(); await shot('gameHard');
  await levels.nth(0).click(); await p.waitForTimeout(300);

  // ---- quiz ----
  const quiz = p.locator('#quiz');
  await scrollTo(quiz, 40); await hide();
  const opts = quiz.locator('[aria-label="תשובות"] button');
  const grabQ = async () => ({ box: await vbox(quiz), opts: await vbox(quiz.locator('[aria-label="תשובות"]')), o4: await vbox(opts.filter({ hasText: /^4$/ })), o2: await vbox(opts.filter({ hasText: /^2$/ })), q: await vbox(quiz.locator('p.text-xl')), svg: await vbox(quiz.locator('svg').first()) });
  console.log('q1:', await quiz.locator('p.text-xl').innerText());
  boxes.quiz0 = await grabQ(); await shot('quiz0');
  await opts.filter({ hasText: /^4$/ }).click(); await p.waitForTimeout(400);
  boxes.quizOk = { ...(await grabQ()), ans: await vbox(quiz.locator('[aria-live="polite"]')), next: await vbox(btn(/לצורה הבאה/, quiz)) };
  console.log('ans1:', await quiz.locator('[aria-live="polite"]').innerText());
  await shot('quizOk');
  await btn(/לצורה הבאה/, quiz).click(); await p.waitForTimeout(400);
  console.log('q2:', await quiz.locator('p.text-xl').innerText());
  boxes.quiz1 = await grabQ(); await shot('quiz1');
  await opts.filter({ hasText: /^4$/ }).click(); await p.waitForTimeout(400);
  console.log('ans2:', (await quiz.locator('[aria-live="polite"]').innerText()).replace(/\n/g, ' | '));
  boxes.quizWrong = { ...(await grabQ()), ans: await vbox(quiz.locator('[aria-live="polite"]')) };
  await shot('quizWrong');

  // ---- print ----
  const ps = p.locator('#print-h').locator('..');
  await scrollTo(ps, 300); await hide();
  boxes.printSec = { box: await vbox(ps), show: await vbox(btn(/לתצוגה ולהדפסה/)), set: await vbox(btn(/סט אחר/)) };
  await shot('printSec');
  await btn(/לתצוגה ולהדפסה/).click(); await p.waitForTimeout(3000);
  const dlg = p.locator('dialog.buga-print-dialog');
  const pages = dlg.locator('.buga-preview-pages article');
  console.log('pages', await pages.count(), '| buttons:', (await dlg.locator('button').allInnerTexts()).map((s) => s.replace(/\n/g, ' ')).join(' / '));
  boxes.print = { pdf: await vbox(dlg.locator('[data-save-pdf]')), prn: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), page: await vbox(pages.first()), dlg: await vbox(dlg) };
  await shot('print1');
  for (const [k, i] of [['print2', 1], ['print3', 2]]) {
    await pages.nth(i).evaluate((e) => e.scrollIntoView({ block: 'start' })); await p.waitForTimeout(800);
    boxes[k] = { page: await vbox(pages.nth(i)) }; await shot(k);
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
