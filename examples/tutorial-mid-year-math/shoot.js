// Real captures of ugabuga.co.il/math/tests/grade-4/mid-year (src/math/MathPages.jsx: MathMidYearTest → TestPage
// midYear, Quiz, PrintSheets; src/components/ui/PrintPreview.jsx). Math.random is seeded so the same test comes
// back on the second pass: pass 1 reads the right answers from the review, pass 2 answers them (two on purpose wrong).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il', PATH = '/math/tests/grade-4/mid-year';
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
const SEED_JS = `(() => { let a = 20261110; Math.random = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
const PICK = ['כפל וחילוק', 'מספרים'];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  await c.addInitScript(SEED_JS);
  const p = await c.newPage();
  const hideChrome = () => p.evaluate(() => {
    for (const e of document.querySelectorAll('body *')) {
      if (e.closest('dialog')) continue;
      const s = getComputedStyle(e); if (s.position === 'fixed' || (s.position === 'sticky' && e.closest('header'))) e.style.display = 'none';
    }
    for (const h of document.querySelectorAll('header')) if (!h.closest('main') && !h.closest('dialog')) h.style.display = 'none';
  });
  const boxes = {};
  const vb = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await p.mouse.move(2, 2); await p.waitForTimeout(450); await hideChrome(); await p.screenshot({ path: `shots/${n}.png` }); };
  const top = async (loc, y = 20) => { await loc.evaluate((e, y) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - y), y); await p.waitForTimeout(300); };
  const go = async (url) => { await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); await hideChrome(); };

  // ---- 1. the grade page → mid-year button
  await go('/math/grade-4');
  const mid = p.getByRole('link', { name: /מבחן אמצע שנה/ }).first();
  await top(p.locator('h1'), 30);
  await shot('a0');
  boxes.midBtn = await vb(mid);
  boxes.testBtn = await vb(p.locator('.mth-actions a').first());

  // ---- 2. tick the topics learned so far
  const setup = async () => {
    await go(PATH);
    const pick = p.locator('section', { hasText: 'מה למדתם עד עכשיו' }).first();
    return pick;
  };
  let pick = await setup();
  await top(p.locator('h1'), 30);
  await shot('a1');
  boxes.h1 = await vb(p.locator('h1'));
  await top(pick, 20);
  await shot('b0');
  boxes.pick = await vb(pick);
  boxes.count0 = await vb(pick.locator('p', { hasText: 'נבחרו' }));
  boxes.clear = await vb(pick.getByRole('button', { name: 'ניקוי הבחירה' }));
  await pick.getByRole('button', { name: 'ניקוי הבחירה' }).click();
  await shot('b1');
  // the topic chips of the first strands, in page order
  const chips = await pick.locator('div.mt-4 button').allInnerTexts();
  console.log('topics:', JSON.stringify(chips));
  const strands = await pick.locator('div.mt-4 > p').allInnerTexts();
  console.log('strands:', JSON.stringify(strands));
  const chosen = chips.slice(0, 5);
  boxes.chips = [];
  for (const name of chosen) {
    const ch = pick.locator('div.mt-4 button', { hasText: name.trim() }).first();
    boxes.chips.push(await vb(ch));
    await ch.click();
  }
  await shot('b2');
  boxes.count = await vb(pick.locator('p', { hasText: 'נבחרו' }));
  boxes.countText = await pick.locator('p', { hasText: 'נבחרו' }).innerText();
  boxes.chosen = chosen;

  // ---- 3. level + number of questions
  const set = p.locator('section[aria-label="הגדרות המבחן"]');
  await top(set, 120);
  await shot('c0');
  boxes.set = await vb(set);
  boxes.lvMid = await vb(set.getByRole('button', { name: /בינוני/ }));
  boxes.c10 = await vb(set.getByRole('button', { name: '10 שאלות' }));
  boxes.c20 = await vb(set.getByRole('button', { name: '20 שאלות' }));
  boxes.timer = await vb(set.getByRole('button', { name: /שעון/ }));
  boxes.start = await vb(set.getByRole('button', { name: /מתחילים מבחן/ }));
  boxes.print = await vb(set.getByRole('button', { name: /הדפסת מבחן/ }));
  await set.getByRole('button', { name: /בסיסי/ }).click();
  await shot('c1');
  boxes.lvBasic = await vb(set.getByRole('button', { name: /בסיסי/ }));

  // pass 1: blank test, read the right answers
  await set.getByRole('button', { name: /מתחילים מבחן/ }).click();
  await p.waitForTimeout(500);
  const dots = p.locator('.mth-dots button');
  const n = await dots.count();
  await dots.nth(n - 1).click();
  await p.getByRole('button', { name: /סיום ובדיקה/ }).click();
  await p.waitForTimeout(600);
  const rights = await p.locator('.mth-review > li').evaluateAll((lis) => lis.map((li) => { const ps = [...li.querySelectorAll('p')].filter((q) => q.textContent.includes('התשובה הנכונה')); const b = ps.length ? ps[0].querySelectorAll('bdi') : []; return b.length ? b[b.length - 1].textContent.trim() : ''; }));
  console.log('answers:', JSON.stringify(rights));

  // pass 2: same seed → same test
  pick = await setup();
  await pick.getByRole('button', { name: 'ניקוי הבחירה' }).click();
  for (const name of chosen) await pick.locator('div.mt-4 button', { hasText: name.trim() }).first().click();
  const set2 = p.locator('section[aria-label="הגדרות המבחן"]');
  await set2.getByRole('button', { name: /בסיסי/ }).click();
  await set2.getByRole('button', { name: /מתחילים מבחן/ }).click();
  await p.waitForTimeout(500);
  const card = p.locator('section.mth-card');
  // the test on screen now: read its items from the Quiz component (React fiber) — the right answers
  const items = await card.evaluate((el) => {
    const k = Object.keys(el).find((x) => x.startsWith('__reactFiber'));
    let f = el[k];
    while (f && !(f.memoizedProps && Array.isArray(f.memoizedProps.items))) f = f.return;
    return f ? f.memoizedProps.items.map((ex) => ({ type: ex.type, answer: String(ex.answer), choices: ex.choices || null })) : null;
  });
  console.log('items:', JSON.stringify(items));
  if (items) items.forEach((it, k) => { rights[k] = it.answer; });
  const WRONG = new Set([3, 7]);
  const answer = async (k) => {
    const want = WRONG.has(k) ? null : rights[k];
    const choices = card.locator('.mth-choice');
    if (await choices.count()) {
      const all = await choices.allInnerTexts();
      let idx = want ? all.findIndex((t) => t.trim() === want) : all.findIndex((t) => t.trim() !== rights[k]);
      if (idx < 0) idx = 0;
      await choices.nth(idx).click();
    } else {
      const inp = card.locator('input.mth-input');
      let v = want;
      if (!want) { const num = parseFloat(String(rights[k]).replace('−', '-')); v = isNaN(num) ? '1' : String(num + 1); }
      await inp.fill(v.replace('−', '-'));
    }
    await p.waitForTimeout(150);
  };
  await top(card, 20);
  await shot('d0');
  boxes.quiz = await vb(card);
  boxes.score = await vb(card.locator('.mth-score'));
  boxes.dots = await vb(card.locator('.mth-dots'));
  boxes.ex = await vb(card.locator('.mth-ex'));
  await answer(0);
  await shot('d1');
  boxes.next = await vb(card.getByRole('button', { name: /הבאה/ }));
  boxes.input0 = await vb(card.locator('.mth-ex input, .mth-choices').first());
  for (let k = 0; k < n; k++) {
    await dots.nth(k).click(); await p.waitForTimeout(120);
    const cur = await card.locator('.mth-ex input').first().inputValue().catch(() => '');
    if (k === 0 && cur) continue;
    await answer(k);
  }
  await dots.nth(4).click(); await p.waitForTimeout(200);
  await top(card, 20);
  await shot('d2');
  await dots.nth(n - 1).click(); await p.waitForTimeout(200);
  await top(card, 20);
  await shot('d3');
  boxes.finish = await vb(card.getByRole('button', { name: /סיום ובדיקה/ }));
  boxes.dots3 = await vb(card.locator('.mth-dots'));
  await card.getByRole('button', { name: /סיום ובדיקה/ }).click();
  await p.waitForTimeout(900);
  const res = p.locator('section.mth-card');
  await top(res, 20);
  await shot('e0');
  boxes.res = await vb(res);
  boxes.resH = await vb(res.locator('h2'));
  boxes.resText = await res.locator('h2').innerText();
  boxes.again = await vb(res.getByRole('button', { name: /מבחן חדש/ }));
  boxes.printQ = await vb(res.getByRole('button', { name: /הדפסת המבחן/ }));
  const wrong = res.locator('.mth-review > li.no').first();
  await top(wrong, 140);
  await shot('e1');
  boxes.wrong = await vb(wrong);
  boxes.explain = await vb(wrong.locator('.mth-explain'));

  // ---- 5. print with an answer sheet
  await res.getByRole('button', { name: /הדפסת המבחן/ }).click();
  await p.waitForTimeout(1800);
  await shot('f0');
  const dlg = p.locator('dialog[open]');
  boxes.dlgButtons = await dlg.locator('button').allInnerTexts();
  console.log('dialog buttons:', JSON.stringify(boxes.dlgButtons));
  const key = dlg.locator('article.mth-print').nth(1);
  if (await key.count()) {
    await key.evaluate((e) => e.scrollIntoView({ block: 'start' }));
    await p.waitForTimeout(500);
    await shot('f1');
    boxes.key = await vb(key);
  }
  await dlg.locator('article.mth-print').first().evaluate((e) => e.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(400);
  boxes.sheet = await vb(dlg.locator('article.mth-print').first());
  const pr = dlg.getByRole('button', { name: /הדפס|PDF/ });
  boxes.prBtns = [];
  for (let i = 0; i < await pr.count(); i++) boxes.prBtns.push([await pr.nth(i).innerText(), await vb(pr.nth(i))]);
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
