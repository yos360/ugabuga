// Real captures of ugabuga.co.il/live (src/pages/live/LiveQuizHome.jsx, LiveQuizHost.jsx, LiveQuizPlay.jsx).
// The room screens are the live site's own UI; the Supabase RPC/REST answers are mocked with page.route,
// so no room or player is ever written to the database. Question = the real Hanukkah pack (hkm1..hkm6,
// src/data/liveQuizHanukkah.js). Player names are invented.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const CODE = 'HN8K2Q', TOKEN = 'demotokenhost000000000000000000', PTOKEN = 'demotokenplayer00000000000000';
const TITLE = 'חנוכה · בינוני';
const Q = [
  { id: 'hkm1', q: 'מי היה המנהיג המפורסם של המכבים?', options: ['יהודה המכבי', 'דוד המלך', 'משה רבנו', 'יהושע בן נון'], correct: 0 },
  { id: 'hkm2', q: 'מי היה אביו של יהודה המכבי?', options: ['אברהם', 'מתתיהו', 'אהרון', 'שמואל'], correct: 1 },
  { id: 'hkm4', q: 'לפי הסיפור, לכמה זמן היה אמור להספיק פך השמן הקטן?', options: ['יום אחד', 'שלושה ימים', 'שבוע', 'חודש'], correct: 0 },
  { id: 'hkm6', q: 'באיזה תאריך עברי מתחילה חנוכה?', options: ['א׳ בכסלו', 'כ״ה בכסלו', 'ט״ו בשבט', 'י״ד באדר'], correct: 1 },
  { id: 'hkm12', q: 'מה משתנה בכל ערב של חנוכה?', options: ['מוסיפים נר אחד', 'מורידים נר אחד', 'מחליפים חנוכייה', 'מדליקים בבוקר'], correct: 0 },
  { id: 'hkm8', q: 'נגד מי מרדו המכבים?', options: ['היוונים הסלווקים', 'הרומאים', 'הבבלים', 'המצרים'], correct: 0 },
];
const NAMES = ['נועה', 'יואב', 'מאיה', 'איתי', 'שירה', 'עומר', 'תמר', 'אורי', 'ליה', 'רון', 'הילה', 'גיא'];
const players = NAMES.map((name, i) => ({ id: `p${i}`, name }));
const LB = [['מאיה', 1840], ['נועה', 1790], ['איתי', 1650], ['יואב', 1520], ['שירה', 1410], ['עומר', 1300], ['תמר', 1150], ['אורי', 980], ['ליה', 900], ['רון', 760]].map(([name, score], i) => ({ name, score, rank: i + 1 }));
const LB1 = [['נועה', 960], ['מאיה', 940], ['איתי', 910], ['יואב', 880], ['שירה', 850]].map(([name, score], i) => ({ name, score, rank: i + 1 }));
const VW = 1280, VH = 800;
let host = null, pub = null, me = null;
const ends = (s) => new Date(Date.now() + s * 1000).toISOString();
async function mock(ctx) {
  await ctx.route(/supabase\.co\/(rest|realtime)\//, async (route) => {
    const url = route.request().url();
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    if (url.includes('live_quiz_host_state')) return json(host());
    if (url.includes('live_quiz_player_state')) return json(me());
    if (url.includes('live_quiz_public_states')) return json(pub());
    if (url.includes('/rpc/')) return json(null);
    return route.abort();
  });
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const boxes = {};
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  // ---------- home ----------
  {
    const c = await b.newContext({ viewport: { width: VW, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL' });
    await mock(c);
    const p = await c.newPage();
    const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
    await p.goto('https://ugabuga.co.il/live', { waitUntil: 'networkidle' });
    await p.waitForTimeout(2500); await hide();
    console.log('hero:', await p.locator('.live-hero-line').innerText());
    const sec = p.locator('.live-quick');
    boxes.h1 = await box(p.locator('.live-hero h1'));
    boxes.quick = await box(sec);
    boxes.grid = await box(sec.locator('.live-topic-grid'));
    boxes.hanukkah = await box(sec.locator('.live-topic-grid button', { hasText: 'חנוכה' }));
    boxes.levels = await box(sec.locator('.live-levels'));
    boxes.medium = await box(sec.locator('.live-levels button', { hasText: 'בינוני' }));
    boxes.more = await box(sec.locator('details.live-more summary'));
    boxes.go = await box(sec.locator('.live-go'));
    boxes.tabs = await box(p.locator('.live-tabbar'));
    await p.screenshot({ path: 'shots/home.png', fullPage: true });
    await sec.locator('.live-topic-grid button', { hasText: 'חנוכה' }).click(); await p.waitForTimeout(400);
    boxes.goH = await box(sec.locator('.live-go'));
    console.log('go:', await sec.locator('.live-go').innerText());
    await p.screenshot({ path: 'shots/homeH.png', fullPage: true });
    await sec.locator('details.live-more summary').click(); await p.waitForTimeout(400);
    boxes.moreOpen = await box(sec.locator('details.live-more'));
    boxes.goM = await box(sec.locator('.live-go'));
    await p.screenshot({ path: 'shots/homeMore.png', fullPage: true });
    await c.close();
  }
  // ---------- host ----------
  const base = { title: TITLE, questions: Q, settings: { seconds: 20 }, counts: {}, leaderboard: [], answer_count: 0, ends_at: null, question_index: 0 };
  const hc = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL' });
  await hc.addInitScript(([code, token, title]) => { try { localStorage.setItem('buga-live-owned', JSON.stringify([{ code, token, title, at: Date.now() }])); localStorage.setItem('buga-live-sound', '0'); } catch {} }, [CODE, TOKEN, TITLE]);
  await mock(hc);
  const hp = await hc.newPage();
  const hhide = () => hp.evaluate(() => { for (const e of document.querySelectorAll('.live-error,.live-connection')) e.style.visibility = 'hidden'; });
  const hshot = async (k, state, wait = 2200) => { host = () => state; await hp.goto(`https://ugabuga.co.il/live/${CODE}/host`, { waitUntil: 'networkidle' }); await hp.waitForTimeout(wait); await hhide(); await hp.screenshot({ path: `shots/${k}.png` }); };
  await hshot('lobby0', { ...base, phase: 'lobby', players: [] });
  await hshot('lobby', { ...base, phase: 'lobby', players });
  boxes.lCode = await box(hp.locator('.live-lobby-main h1'));
  boxes.lQr = await box(hp.locator('.live-qr'));
  boxes.lShare = await box(hp.locator('.live-share-buttons'));
  boxes.lPlayers = await box(hp.locator('.live-player-lobby'));
  boxes.lStart = await box(hp.locator('.live-start-button'));
  boxes.lUrl = await box(hp.locator('.live-url'));
  await hshot('hostQ', { ...base, phase: 'question', players, answer_count: 9, ends_at: ends(13.6) });
  boxes.qMeta = await box(hp.locator('.live-stage-meta'));
  boxes.qH1 = await box(hp.locator('.live-question-stage h1'));
  boxes.qOpts = await box(hp.locator('.live-host-options'));
  boxes.qReveal = await box(hp.locator('.live-reveal-now'));
  await hshot('hostR', { ...base, phase: 'reveal', players, answer_count: 12, counts: { 0: 10, 1: 1, 3: 1 }, leaderboard: LB1 });
  boxes.rOpts = await box(hp.locator('.live-results-options'));
  boxes.rLead = await box(hp.locator('.live-result-grid aside'));
  boxes.rNext = await box(hp.locator('.live-start-button'));
  const stats = Object.fromEntries([[0, 10], [1, 9], [2, 7], [3, 4], [4, 11], [5, 8]].map(([i, right]) => [i, { i, q: Q[i].q, answer: Q[i].options[Q[i].correct], answered: 12, right }]));
  await hp.evaluate(([k, v]) => localStorage.setItem(k, v), [`buga-live-stats-${CODE}-${TITLE}`, JSON.stringify(stats)]);
  host = () => ({ ...base, phase: 'finished', players, question_index: 5, leaderboard: LB });
  await hp.goto(`https://ugabuga.co.il/live/${CODE}/host`, { waitUntil: 'networkidle' }); await hp.waitForTimeout(2500); await hhide();
  boxes.fLead = await box(hp.locator('.live-finish-stage .live-leaders'));
  boxes.fSum = await box(hp.locator('.live-summary'));
  boxes.fCsv = await box(hp.locator('.live-summary button'));
  boxes.fReplay = await box(hp.locator('.live-replay-primary'));
  boxes.fH1 = await box(hp.locator('.live-finish-stage h1'));
  await hp.screenshot({ path: 'shots/hostF.png', fullPage: true });
  await hc.close();
  // ---------- phone ----------
  const pc = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, locale: 'he-IL', isMobile: true, hasTouch: true });
  await mock(pc);
  const pp = await pc.newPage();
  const phide = () => pp.evaluate(() => { for (const e of document.querySelectorAll('.live-connection,.live-error')) e.style.display = 'none'; for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' && !e.closest('.live-player-screen')) e.style.visibility = 'hidden'; } });
  const pubBase = { code: CODE, question_index: 0, ends_at: null, revision: 1 };
  pub = () => ({ ...pubBase, phase: 'lobby', payload: { title: TITLE, player_count: 12 } });
  me = () => null;
  await pp.goto(`https://ugabuga.co.il/play/${CODE}`, { waitUntil: 'networkidle' }); await pp.waitForTimeout(2200); await phide();
  await pp.locator('input').fill('נועה'); await pp.waitForTimeout(200);
  await pp.screenshot({ path: 'shots/phJoin.png' });
  const setPlayer = async () => pp.evaluate(([code, t]) => localStorage.setItem('buga-live-player', JSON.stringify({ [code]: { token: t, name: 'נועה' } })), [CODE, PTOKEN]);
  await setPlayer();
  const pshot = async (k, pState, meState, wait = 5200) => { pub = () => pState; me = () => meState; await pp.goto(`https://ugabuga.co.il/play/${CODE}`, { waitUntil: 'networkidle' }); await pp.waitForTimeout(wait); await phide(); await pp.screenshot({ path: `shots/${k}.png` }); };
  const qp = { title: TITLE, index: 1, total: 6, question: { q: Q[0].q, options: Q[0].options }, seconds: 20 };
  await pshot('phWait', { ...pubBase, phase: 'lobby', payload: { title: TITLE, player_count: 12 } }, { name: 'נועה', score: 0, answered: false, rank: 1 });
  await pshot('phQ', { ...pubBase, phase: 'question', ends_at: ends(16.6), payload: qp }, { name: 'נועה', score: 0, answered: false, rank: 1 });
  boxes.phOpts = await box(pp.locator('.live-player-options'));
  boxes.phOpt0 = await box(pp.locator('.live-player-options button').first());
  await pshot('phLocked', { ...pubBase, phase: 'question', ends_at: ends(14.6), payload: qp }, { name: 'נועה', score: 0, answered: true, option: 0, rank: 1 });
  await pshot('phRight', { ...pubBase, phase: 'reveal', payload: { ...qp, correct: 0 } }, { name: 'נועה', score: 960, answered: true, option: 0, correct: true, points: 960, rank: 1 });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
