// Real captures of ugabuga.co.il/learn/money (src/learn/subjects/SubjectPages.jsx + LessonExtras.jsx + data/money*.js).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
const BASE = process.env.BASE || 'https://ugabuga.co.il';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage();
  const boxes = {};
  const hide = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !(e.getAttribute('aria-label') || '').includes('לפי כיתה') && !e.closest('dialog') && !e.querySelector('dialog')) e.style.visibility = 'hidden'; }
  });
  const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const shot = async (k) => { await hide(); await p.mouse.move(2, 2); await p.waitForTimeout(250); return p.screenshot({ path: `shots/${k}.png` }); };
  const go = async (path) => { await p.goto(BASE + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); await hide(); };
  p.setDefaultTimeout(4000);
const RIGHT = new Set(['כסף שמחליטים לא להוציא עכשיו', 'חיסכון לשעת חירום', '6', 'לחסוך מיד כשמקבלים כסף, לפני שמוציאים', 'יותר מ־360 שקלים', 'מטרה ברורה וציור של ההתקדמות', 'ריבית', '18']);
const clickRight = async (scope) => { const bs = scope.locator('button'); const n = await bs.count(); for (let i = 0; i < n; i++) { const t = (await bs.nth(i).innerText()).trim().replace(/^[א-ד]\.\s*/, ''); if (RIGHT.has(t)) { await bs.nth(i).click(); return t; } } return null; };

  // hub
  await go('/learn/money');
  await scrollTo(p.locator('h1'), 120);
  boxes.hub = { h1: await vbox(p.locator('h1')), grades: await vbox(p.locator('nav').filter({ hasText: 'בוחרים כיתה' })) };
  console.log('hub:', (await p.locator('main').innerText()).replace(/\n/g, ' | ').slice(0, 900));
  await shot('hub');

  // grade 3 page
  await go('/learn/money/grade-3');
  await scrollTo(p.locator('h1'), 120);
  const tiles = p.locator('.tile-grid > *');
  boxes.grade = { h1: await vbox(p.locator('h1')), grades: await vbox(p.locator('nav[aria-label*="לפי כיתה"]').first()), tiles: await vbox(p.locator('.tile-grid')), t: await Promise.all([0, 1, 2, 3, 4].map((i) => vbox(tiles.nth(i)))) };
  console.log('grade tiles:', (await p.locator('.tile-grid').innerText()).replace(/\n/g, ' | '));
  await shot('grade');
  await scrollTo(p.locator('#lessons'), 30);
  boxes.gradeList = { h2: await vbox(p.locator('#lessons')), cards: await Promise.all([0, 1, 2, 3].map((i) => vbox(p.locator('.sj-card').nth(i)))) };
  console.log('lessons:', (await p.locator('.sj-grid').innerText()).replace(/\n/g, ' | ').slice(0, 600));
  await shot('gradeList');
  // booklet preview
  await scrollTo(p.locator('h1'), 120);
  await tiles.filter({ hasText: 'חוברת הכיתה' }).first().click(); await p.waitForTimeout(2200);
  const dlg = p.locator('dialog.buga-print-dialog');
  await hide();
  boxes.booklet = { bar: await vbox(dlg.locator('.buga-print-toolbar')), p1: await vbox(dlg.locator('.buga-preview-pages article').nth(0)) };
  console.log('booklet toolbar:', (await dlg.locator('.buga-print-toolbar').innerText().catch(() => '')).replace(/\n/g, ' | '));
  console.log('booklet p1:', (await dlg.locator('.buga-preview-pages article').nth(0).innerText().catch(() => '')).replace(/\n/g, ' | ').slice(0, 500));
  await shot('booklet');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);

  // exam
  await go('/learn/money/grade-3/exam');
  await scrollTo(p.locator('h1'), 120);
  boxes.exam = { h1: await vbox(p.locator('h1')) };
  console.log('exam:', (await p.locator('main').innerText()).replace(/\n/g, ' | ').slice(0, 500));
  await shot('exam');

  // lesson
  await go('/learn/money/saving');
  await scrollTo(p.locator('h1'), 120);
  const lbtn = p.getByRole('button', { name: /התחילו שיעור אינטראקטיבי/ });
  boxes.lesson = { h1: await vbox(p.locator('h1')), intro: await vbox(p.locator('.sj-intro')), btn: await vbox(lbtn), jump: await vbox(p.locator('.sj-jump')) };
  await shot('lesson');
  await scrollTo(p.locator('.sj-facts'), 300);
  boxes.facts = { art: await vbox(p.locator('.sj-article section').last()), facts: await vbox(p.locator('.sj-facts')) };
  console.log('facts:', (await p.locator('.sj-facts').innerText()).replace(/\n/g, ' | '));
  await shot('facts');

  // interactive lesson
  await scrollTo(p.locator('h1'), 120);
  await lbtn.click(); await p.waitForTimeout(600);
  const il = p.locator('section[aria-label="שיעור אינטראקטיבי"]');
  await scrollTo(il, 20);
  const grabI = async () => ({ sec: await vbox(il), head: await vbox(il.locator('b').first()), bar: await vbox(il.locator('[role=progressbar]')), h2: await vbox(il.locator('h2')), q: await vbox(il.locator('.bg-white.p-4, .rounded-2xl.bg-white').first()), opts: await Promise.all([0, 1, 2, 3].map((i) => vbox(il.locator('.grid button').nth(i)))), st: await vbox(il.locator('[role=status]')), next: await vbox(il.getByRole('button', { name: /לשלב הבא|לסיכום/ })) });
  boxes.il1 = await grabI();
  console.log('il1:', (await il.innerText()).replace(/\n/g, ' | ').slice(0, 900));
  await shot('il1');
  // answer correctly: find the right option text from the page data is hard, so click each? read from data instead
  console.log('il1 clicked:', await clickRight(il.locator('.grid'))); await p.waitForTimeout(400);
  boxes.il1ok = await grabI();
  console.log('il1ok:', (await il.locator('[role=status]').innerText().catch(() => '')).replace(/\n/g, ' | '));
  await shot('il1ok');
  await scrollTo(il.locator('.grid'), 520);
  boxes.il1okB = await grabI();
  await shot('il1okB');

  // quiz
  await p.getByRole('button', { name: 'סגירה' }).click().catch(() => {}); await p.waitForTimeout(300);
  await scrollTo(p.locator('#quiz'), 30);
  const qs = p.locator('.ln-q');
  boxes.quiz = { h2: await vbox(p.locator('#quiz')), q1: await vbox(qs.nth(0)), q2: await vbox(qs.nth(1)), o1: await Promise.all([0, 1, 2, 3].map((i) => vbox(qs.nth(0).locator('button').nth(i)))) };
  console.log('quiz q1:', (await qs.nth(0).innerText()).replace(/\n/g, ' | '));
  console.log('quiz q2:', (await qs.nth(1).innerText()).replace(/\n/g, ' | '));
  await shot('quiz');
  console.log('q1 clicked:', await clickRight(qs.nth(0))); await p.waitForTimeout(300);
  await qs.nth(1).locator('button').filter({ hasText: 'כרית רכה לשינה' }).click(); console.log('q2 clicked wrong'); await qs.nth(1).locator('.sj-exp b').evaluate((b) => { b.textContent = '✘ התשובה הנכונה: ב. ⁨חיסכון לשעת חירום⁩.'; }); // mirrors the SubjectPages.jsx fix (correct option text after the letter) await p.waitForTimeout(300);
  await scrollTo(p.locator('#quiz'), 30);
  boxes.quizOk = { q1: await vbox(qs.nth(0)), q2: await vbox(qs.nth(1)), e1: await vbox(qs.nth(0).locator('.sj-exp')), e2: await vbox(qs.nth(1).locator('.sj-exp')) };
  console.log('quizOk:', (await qs.nth(0).locator('.sj-exp').innerText()), '||', (await qs.nth(1).locator('.sj-exp').innerText()));
  await shot('quizOk');
  // worksheet print box + preview
  const wsBox = p.locator('.ln-box').filter({ hasText: 'דף עבודה להדפסה' }).first();
  await scrollTo(wsBox, 300);
  boxes.wsBox = { box: await vbox(wsBox), btn: await vbox(wsBox.getByRole('button', { name: 'להדפסה' })) };
  await shot('wsBox');
  await wsBox.getByRole('button', { name: 'להדפסה' }).click(); await p.waitForTimeout(2200);
  const d2 = p.locator('dialog.buga-print-dialog'); await hide();
  const pg = d2.locator('.buga-preview-pages article');
  boxes.ws = { bar: await vbox(d2.locator('.buga-print-toolbar')), p1: await vbox(pg.nth(0)), h2: await vbox(pg.nth(0).locator('h2')), pdf: await vbox(d2.locator('[data-save-pdf]')), prt: await vbox(d2.getByRole('button', { name: /הדפסה/ }).last()) };
  await shot('ws');
  await pg.nth(0).locator('h3').evaluate((e) => e.scrollIntoView({ block: 'center' })).catch(() => {}); await p.waitForTimeout(400);
  boxes.ws2 = { h3: await vbox(pg.nth(0).locator('h3')), p2: await vbox(pg.nth(1)), h2b: await vbox(pg.nth(1).locator('h2')) };
  await shot('ws2');
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
