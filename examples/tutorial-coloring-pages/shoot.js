// Real captures of ugabuga.co.il coloring pages (src/pages/printables/ColoringPages.jsx, ColoringSubject.jsx,
// ColoringDrawing.jsx, data/coloringSubjects.js + coloringDrawings.js). Viewport 1280×1100, DSF 2, viewport shots (org [0,0]).
// BASE env: site origin (default live). FIXRANGE=1 mirrors the ⁦…⁩ fix for the age ranges in the page text.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100, BASE = process.env.BASE || 'https://ugabuga.co.il', N = 100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage();
  const boxes = {};
  const hide = () => p.evaluate((fix) => {
    if (document.activeElement) document.activeElement.blur();
    let st = document.getElementById('nt');
    if (!st) { st = document.createElement('style'); st.id = 'nt'; document.head.appendChild(st); }
    st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}';
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('[data-print-main]')) e.style.visibility = 'hidden'; }
    if (fix) { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/\d–\d/.test(n.nodeValue) && !/\u2066/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/(\d+)–(\d+)/g, '\u2066$1–$2\u2069'); }
  }, !!process.env.FIXRANGE);
  const vbox = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }); };
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(600); };
  const shot = async (k, extra = {}) => { await hide(); await p.waitForTimeout(400); const o = {}; for (const [n, l] of Object.entries(extra)) o[n] = await vbox(l); boxes[k] = o; await p.screenshot({ path: `shots/${k}.png` }); };
  // wait only for images inside the viewport (lazy ones below never load), at most 6s
  const settle = async () => {
    await p.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(1200);
    await p.waitForFunction(() => [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; }).every((i) => i.complete), null, { timeout: 6000 }).catch(() => console.log('images: timeout'));
  };

  // 1. the hub: badge, h1, subject grid
  await p.goto(`${BASE}/printables/coloring`); await settle(); await hide();
  await scrollTo(p.locator('h1'), 70);
  await shot('hub', { badge: p.locator('header span.rounded-full').first(), h1: p.locator('h1') });
  const grid = p.getByRole('heading', { name: 'דפי צביעה לפי נושא' });
  await scrollTo(grid, 20);
  // images are lazy: give them time after the scroll
  await p.waitForTimeout(1500); await settle();
  await shot('subjects', { grid, hanukkiah: p.locator('a[href="/printables/coloring/hanukkiah"]'), unicorn: p.locator('a[href="/printables/coloring/unicorn"]') });
  // scroll the grid to the hanukkiah card
  await scrollTo(p.locator('a[href="/printables/coloring/hanukkiah"]'), 380); await p.waitForTimeout(1500); await settle();
  await shot('subjects2', { hanukkiah: p.locator('a[href="/printables/coloring/hanukkiah"]'), space: p.locator('a[href="/printables/coloring/space"]') });

  // 2. the subject page
  await p.goto(`${BASE}/printables/coloring/hanukkiah`); await settle(); await hide();
  await scrollTo(p.locator('h1'), 70);
  await shot('subject', { badge: p.locator('header span.rounded-full').first(), h1: p.locator('h1'), all: p.locator('button[data-print-main]') });
  const fig = p.locator(`a[href="/printables/coloring/hanukkiah/${N}"]`).first();
  await scrollTo(fig, 200); await p.waitForTimeout(1200); await settle();
  const figure = p.locator('figure').filter({ has: p.locator(`a[href="/printables/coloring/hanukkiah/${N}"]`) });
  await shot('grid', { fig: figure, quick: figure.getByRole('button', { name: /הדפסה/ }) });

  // 3. the drawing page
  await p.goto(`${BASE}/printables/coloring/hanukkiah/${N}`); await settle(); await hide();
  await scrollTo(p.locator('h1'), 40);
  const pbtn = p.locator('button[data-print-main]');
  await shot('drawing', { h1: p.locator('h1'), sub: p.locator('h1 + p'), print: pbtn });
  console.log('h1', await p.locator('h1').innerText(), '| sub', await p.locator('h1 + p').innerText());
  await scrollTo(pbtn, 700); await p.waitForTimeout(600);
  await shot('drawing2', { print: pbtn });

  // 4. the print preview
  await pbtn.click(); await p.waitForTimeout(1800);
  const dlg = p.locator('dialog.buga-print-dialog');
  await shot('preview', { bar: dlg.locator('.buga-print-toolbar'), pdf: dlg.locator('button[data-save-pdf]'), prn: dlg.getByRole('button', { name: /🖨️ הדפסה/ }), tip: dlg.locator('.buga-print-tip').first(), page: dlg.locator('.buga-preview-pages .buga-a4').first(), copies: dlg.locator('.buga-print-count') });
  console.log('toolbar', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n+/g, ' | '));
  await dlg.locator('button[aria-label="סגירת תצוגת ההדפסה"]').click(); await p.waitForTimeout(600);

  // 5. the guide: level, tip, fact + question, simpler / harder
  const gh = p.locator('#drawing-guide-title');
  await scrollTo(gh, 30);
  await p.waitForTimeout(1200); await settle();
  const sec = p.locator('section[aria-labelledby="drawing-guide-title"]');
  await shot('guide', { gh, tools: gh.locator('xpath=following-sibling::p[1]'), tip: sec.locator('li').nth(1), fact: sec.locator('div.rounded-2xl').first(), next: sec.getByRole('heading', { name: /פשוט יותר או מאתגר יותר/ }) });
  const nx = sec.getByRole('heading', { name: /פשוט יותר או מאתגר יותר/ });
  await scrollTo(nx, 120); await p.waitForTimeout(1200); await settle();
  const cards = nx.locator('xpath=following-sibling::div[1]');
  await shot('next', { nx, cards, simpler: cards.locator('a').nth(0), harder: cards.locator('a').nth(1) });
  console.log('guide', (await sec.innerText()).slice(0, 900).replace(/\n+/g, ' | '));

  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
