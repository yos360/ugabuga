// THE FILM (9:16) — "מסלול לוח הכפל": the site times-table path game in the site own look (paper + dot grid,
// ink-outlined cards with an offset shadow, Heebo), real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', lilacShadow: '#dcd0f7', line: '#dde2ed', card: '#ffffff', box: '#d9a76a', boxDark: '#b9824a' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // ---------- Hebrew text (Chrome RTL shaping, the site's font) ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", sans-serif`;
  function measure(ctx, s, size, w = 800, fam) { ctx.save(); ctx.font = fontOf(size, w, fam); ctx.direction = 'rtl'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
  function he(ctx, s, x, y, { size = 60, w = 800, color = C.ink, align = 'center', alpha = 1, maxW, dir = 'rtl', fam } = {}) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha *= clamp(alpha);
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam); if (mw > maxW) sz *= maxW / mw; }
    ctx.font = fontOf(sz, w, fam); ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.fillText(s, x, y);
    ctx.restore();
  }
  function card(ctx, x, y, w, h, { fill = C.card, r = 34, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink, shadowColor = C.ink } = {}) {
    if (shadow) { ctx.fillStyle = shadowColor; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke, amp: 1 });
  }
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, h, seed = 3, shadow = 7, dir = 'rtl', fam } = {}) {
    const ww = measure(ctx, s, size, w, fam) + padX * 2, hh = h || size * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + size * 0.36, { size, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
  }
  function img(ctx, im, cx, bottom, h, { flip = false, rot = 0, alpha = 1 } = {}) {
    if (!im) return;
    const w = im.width * h / im.height;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, bottom); ctx.rotate(rot); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
  }
  function checkMark(ctx, x, y, r, p, color = C.green) {
    if (p <= 0) return;
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r * (0.7 + 0.3 * ease.outBack(clamp(p * 2), 2)), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const q = clamp(p * 1.6);
    ctx.beginPath(); ctx.moveTo(x - r * 0.45, y + r * 0.02);
    if (q < 0.4) ctx.lineTo(x - r * 0.45 + r * 0.3 * q / 0.4, y + r * 0.02 + r * 0.32 * q / 0.4);
    else { ctx.lineTo(x - r * 0.15, y + r * 0.34); ctx.lineTo(x - r * 0.15 + r * 0.6 * (q - 0.4) / 0.6, y + r * 0.34 - r * 0.7 * (q - 0.4) / 0.6); }
    ctx.stroke(); ctx.restore();
  }
  function confetti(ctx, t, t0, cx, cy, { n = 60, spread = 900, seed = 1 } = {}) {
    const a = t - t0;
    if (a < 0 || a > 2.2) return;
    const cols = [C.red, C.blue, C.green, '#f2b705', C.purple, C.cyan, C.orange];
    for (let i = 0; i < n; i++) {
      const r = (k) => U.hash(seed * 1000 + i * 7 + k);
      const ang = -Math.PI / 2 + (r(1) - 0.5) * 2.6, sp = spread * (0.45 + r(2) * 0.6);
      const x = cx + Math.cos(ang) * sp * a, y = cy + Math.sin(ang) * sp * a + 900 * a * a;
      ctx.save(); ctx.globalAlpha = clamp(1.6 - a); ctx.translate(x, y); ctx.rotate(a * (4 + r(3) * 8)); ctx.scale(1, Math.abs(Math.cos(a * 7 + i)));
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-11, -6, 22, 12); ctx.restore();
    }
  }

  // ---------- backgrounds ----------
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => {
      x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.09)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }
  // the elections page hero: lilac → pink → yellow
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step header: number badge + title + subtitle (RTL) ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, RIGHT - 52, 318, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 22, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, RIGHT - 126 + dx, 345, { size: 72, w: 900, align: 'right', alpha: a, maxW: SAFE.w - 130 });
    he(ctx, f.sub, RIGHT, 428, { size: 40, w: 500, color: C.muted, align: 'right', alpha: UI.fadeIn(t, f.t + 0.2, 0.25), maxW: SAFE.w });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = RIGHT - 126, len = Math.min(measure(ctx, f.title, 72, 900), SAFE.w - 130) * u;
      G.line(ctx, [[x1, 366], [x1 - len, 370]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
  }

  // wrap a Hebrew line into at most `max` lines that fit width w
  function wrap(ctx, str, size, w, weight = 500, max = 2) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
  }


  // ---------- small helpers for this film ----------
  const GOLD = '#f5b700';
  function star(ctx, cx, cy, r, on, lw = 4) {
    ctx.save(); ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fillStyle = on ? GOLD : '#e3e6ee'; ctx.fill();
    ctx.strokeStyle = on ? '#8a6500' : '#c5cad6'; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  }
  const isHe = (s) => (/[א-ת]/.test(s) ? 'rtl' : 'ltr');
  function btn(ctx, cx, cy, w, h, s, { bg = '#fff', fg = C.ink, size = 34, seed = 5, lw = 3.5, stroke = C.ink, shadow = 6 } = {}) {
    card(ctx, cx - w / 2, cy - h / 2, w, h, { fill: bg, r: h / 2, seed, shadow, lw, stroke });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: fg, maxW: w - 30, dir: isHe(s) });
  }
  // the game card frame shared by steps 2 and 3
  function gameFrame(ctx, t, { q, progress, typed, state }) {
    const X = SAFE.x, Wc = SAFE.w, Y = 470;
    card(ctx, X, Y, Wc, 1010, { seed: 211, r: 36 });
    he(ctx, '✖️ הלוח של 7', RIGHT - 36, Y + 78, { size: 46, w: 900, align: 'right' });
    he(ctx, q.label, X + 36, Y + 76, { size: 34, w: 800, align: 'left' });
    G.rrect(ctx, X + 36, Y + 110, Wc - 72, 20, 10, { fill: '#eef0f6', lw: 2.5, seed: 212, stroke: C.line });
    if (progress > 0) G.rrect(ctx, X + 36 + (Wc - 72) * (1 - progress), Y + 110, (Wc - 72) * progress, 20, 10, { fill: C.green, lw: 0, seed: 213, stroke: C.green });
    const ex = X + 36, ey = Y + 160, ew = Wc - 72, eh = 170;
    const fill = state === 'right' ? '#e3f6ea' : state === 'wrong' ? '#ffe9ec' : '#fbfcff';
    G.rrect(ctx, ex, ey, ew, eh, 28, { fill, lw: 4, seed: 214, stroke: state === 'right' ? C.green : state === 'wrong' ? C.red : '#b9c0d4' });
    he(ctx, `${q.a} × ${q.b} = ${typed}`, W / 2, ey + 122, { size: 112, w: 900, dir: 'ltr', color: state === 'wrong' ? C.red : C.ink });
  }
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];
  const keyPos = (k) => { const i = KEYS.indexOf(k); return [W / 2 + ((i % 3) - 1) * 268, 940 + Math.floor(i / 3) * 124 + 54]; };
  function keypad(ctx, t, taps, check, alpha = 1) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    KEYS.forEach((k) => {
      const [x, y] = keyPos(k);
      const hit = taps.find((p) => p.k === k) || (k === '✓' && { t: check });
      const press = hit && t >= hit.t ? 1 - 0.08 * pulse(t, hit.t, 10) : 1;
      ctx.save(); ctx.translate(x, y); ctx.scale(press, press);
      btn(ctx, 0, 0, 250, 108, k, { bg: k === '✓' ? '#7dd87a' : '#fff', size: 52, seed: 220 + KEYS.indexOf(k), shadow: 5, lw: 3.5, stroke: C.ink });
      ctx.restore();
    });
    taps.concat([{ k: '✓', t: check }]).forEach((p) => { const [x, y] = keyPos(p.k); UI.tap(ctx, x, y, t, p.t, { color: 'rgba(35,135,77,0.8)', size: 120 }); });
    ctx.restore();
  }
  const typedAt = (t, taps) => taps.filter((p) => t >= p.t).map((p) => p.k).join('');

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'מי זוכר בלי לחשוב?', W / 2, 330, { size: 60, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q1, W / 2, 560, (c) => he(c, '7 × 8', 0, 0, { size: 250, w: 900, dir: 'ltr' }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 790, (c) => he(c, '= ?', 0, 0, { size: 250, w: 900, color: C.red, dir: 'ltr' }), { rot: 0.025 });
    popAt(ctx, t, ev.title, W / 2, 960, (c) => pill(c, 0, 0, 'מסלול לוח הכפל 🗺️', { size: 72, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 12 }), { rot: -0.03, dur: 0.35 });
    const ws = S.hookPills.map((p) => measure(ctx, `${p.e} ${p.s}`, 38, 800) + 52 + 14);
    let cx = W / 2 + ws.reduce((a, b) => a + b, 0) / 2;
    S.hookPills.forEach((p, k) => {
      const x = cx - ws[k] / 2; cx -= ws[k];
      popAt(ctx, t, p.t, x, 1085, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 38, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 26 }), { rot: [-0.03, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1210); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם, בלי הרשמה', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const gp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 250, 1640 + (1 - gp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 330, { rot: -0.03 });
    popAt(ctx, t, ev.q2 + 0.3, 520, 1430, (c) => he(c, '🤔', 0, 0, { size: 120, w: 400 }), { rot: 0.05 });
  }

  // ================= 1. THE PATH =================
  const PX = [540, 750, 540, 330];
  const nodeXY = (i) => [PX[i % 4], 600 + i * 61];
  function shotPath(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    pill(ctx, RIGHT - 100, 524, '⭐ 0 / 42', { size: 38, w: 900, bg: '#fff3c4', padX: 26, seed: 231, shadow: 5, dir: 'ltr' });
    he(ctx, 'מתחילים מהעיגול המהבהב', RIGHT - 270, 536, { size: 32, w: 600, color: C.muted, align: 'right', alpha: UI.fadeIn(t, S.nodes[3].t, 0.3) });
    // the road, drawn up to the last popped node
    const shown = S.nodes.filter((n) => t >= n.t).length;
    if (shown > 1) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); for (let i = 0; i < shown; i++) { const [x, y] = nodeXY(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = '#c9b37a'; ctx.lineWidth = 34; ctx.stroke();
      ctx.setLineDash([12, 14]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
    }
    S.nodes.forEach((n) => {
      const [x, y] = nodeXY(n.i);
      const first = n.i === 0 && t > S.nodes[0].t + 0.3;
      popAt(ctx, t, n.t, x, y, (c) => {
        const k = first ? 1 + 0.08 * Math.sin((t - S.nodes[0].t) * 6) : 1;
        c.scale(k, k);
        c.fillStyle = C.ink; c.beginPath();
        if (n.review) c.roundRect(-30 + 4, -30 + 5, 60, 60, 18); else c.arc(4, 5, 30, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = n.review ? '#c9b6ff' : '#ffd23f'; c.beginPath();
        if (n.review) c.roundRect(-30, -30, 60, 60, 18); else c.arc(0, 0, 30, 0, Math.PI * 2);
        c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        he(c, n.label, 0, 11, { size: n.review ? 32 : 34, w: 900, dir: 'ltr' });
      }, { dur: 0.22, over: 2.4 });
    });
    UI.tap(ctx, nodeXY(0)[0], nodeXY(0)[1], t, ev.unlock, { color: 'rgba(34,107,215,0.8)', size: 120 });
    const LG = [['#ffd23f', 'לוח אחד', false], ['#c9b6ff', 'שלב חזרה', true], ['🏆', 'האתגר הגדול', null]];
    const ws = LG.map(([, s]) => measure(ctx, s, 32, 800) + 84 + 12);
    let cx = W / 2 + ws.reduce((a, b) => a + b, 0) / 2;
    LG.forEach(([col, s, rev], k) => {
      const x = cx - ws[k] / 2; cx -= ws[k];
      popAt(ctx, t, S.legend[k].t, x, 1478, (c) => {
        pill(c, 0, 0, s, { size: 32, w: 800, bg: '#fff', padX: 26, seed: 240 + k, shadow: 5, h: 58 });
        const dx = measure(c, s, 32, 800) / 2 + 26;
        if (rev === null) he(c, col, dx + 4, 12, { size: 32, w: 400 });
        else { c.fillStyle = col; c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); if (rev) c.roundRect(dx - 12, -12, 24, 24, 7); else c.arc(dx, 0, 12, 0, Math.PI * 2); c.fill(); c.stroke(); }
      }, { dur: 0.25, over: 1.8 });
    });
  }

  // ================= 2. PLAY =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const second = t >= S.advance1;
    const q = second ? { a: 7, b: 7, label: 'תרגיל 4 מתוך 10' } : { a: 6, b: 7, label: 'תרגיל 3 מתוך 10' };
    const taps = second ? S.taps2 : S.taps1, check = second ? S.check2 : S.check1;
    const typed = typedAt(t, taps);
    const state = t >= check ? 'right' : 'ask';
    const swap = second ? ease.outCubic(clamp((t - S.advance1) / 0.2)) : 1;
    gameFrame(ctx, t, { q, progress: second ? 0.3 + 0.1 * swap : 0.2 + (t >= S.check1 ? 0.1 : 0), typed, state });
    if (state === 'right') {
      const praise = second ? 'מעולה! ⭐' : 'בול! 🎯';
      popAt(ctx, t, check, W / 2, 880, (c) => he(c, praise, 0, 0, { size: 54, w: 900, color: C.green }), { dur: 0.25 });
    }
    keypad(ctx, t, taps, check, second ? 1 - clamp((t - (S.playPills[0].t - 0.25)) / 0.2) : 1);
    he(ctx, 'חזרה למסלול', W / 2, 1462, { size: 30, w: 500, color: C.muted });
    const P = S.playPills;
    popAt(ctx, t, P[0].t, W / 2, 1020, (c) => pill(c, 0, 0, 'נכון? ישר לתרגיל הבא', { size: 46, w: 900, bg: C.yellow, seed: 250, padX: 40 }), { rot: -0.03 });
    popAt(ctx, t, P[1].t, W / 2, 1150, (c) => pill(c, 0, 0, '⌨️ גם במקלדת של המחשב', { size: 42, w: 800, bg: '#fff', seed: 251, padX: 36 }), { rot: 0.025 });
  }

  // ================= 3. HINT =================
  function shotHint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const typed = typedAt(t, S.wtaps), wrong = t >= S.wlines[0].t;
    gameFrame(ctx, t, { q: { a: 7, b: 8, label: 'תרגיל 5 מתוך 10' }, progress: 0.4, typed: wrong ? '56' : typed, state: wrong ? 'wrong' : 'ask' });
    keypad(ctx, t, S.wtaps, S.wlines[0].t, 1 - clamp((t - S.wlines[0].t) / 0.15));
    if (wrong) {
      const L = S.wlines;
      const bp = UI.pop(t, L[0].t, 0.3, 1.8);
      ctx.save(); ctx.translate(W / 2, 1100); ctx.scale(bp, bp);
      card(ctx, -SAFE.w / 2 + 36, -250, SAFE.w - 72, 500, { fill: '#fff1f1', stroke: '#e8a3a3', r: 28, seed: 260, shadow: 8, lw: 4 });
      he(ctx, 'לא בדיוק. התשובה הנכונה: ⁦7 × 8 = 56⁩', 0, -170, { size: 44, w: 900, maxW: SAFE.w - 130 });
      ctx.restore();
      popAt(ctx, t, L[1].t, W / 2, 985, (c) => he(c, 'מפרקים: 5 פעמים 8, ועוד 2 פעמים 8:', 0, 0, { size: 42, w: 700, maxW: SAFE.w - 130 }), { dur: 0.25 });
      popAt(ctx, t, L[2].t, W / 2, 1105, (c) => { const k = 1 + 0.05 * pulse(t, L[2].t, 8); c.scale(k, k); he(c, '40 + 16 = 56', 0, 0, { size: 96, w: 900, dir: 'ltr', color: C.red }); }, { dur: 0.3, over: 2.2, rot: -0.02 });
      popAt(ctx, t, L[3].t, W / 2, 1215, (c) => he(c, 'התרגיל הזה יחזור עוד פעם בסוף השלב 🔁', 0, 0, { size: 36, w: 600, color: C.muted, maxW: SAFE.w - 130 }), { dur: 0.25 });
      const press = t >= S.ev.next ? 1 - 0.08 * pulse(t, S.ev.next, 10) : 1;
      popAt(ctx, t, T(7, 2.5), W / 2, 1310, (c) => { c.scale(press, press); btn(c, 0, 0, 260, 84, 'הבא ←', { bg: '#7dd87a', size: 44, seed: 262 }); });
      UI.tap(ctx, W / 2 + 40, 1310, t, S.ev.next, { color: 'rgba(20,22,45,0.7)', size: 120 });
    }
    he(ctx, 'חזרה למסלול', W / 2, 1462, { size: 30, w: 500, color: C.muted });
  }

  // ================= 4. STARS =================
  function shotStars(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    pill(ctx, RIGHT - 100, 524, `⭐ ${t >= S.starsT[2].t ? 3 : 0} / 42`, { size: 38, w: 900, bg: '#fff3c4', padX: 26, seed: 231, shadow: 5, dir: 'ltr' });
    card(ctx, SAFE.x, 570, SAFE.w, 700, { seed: 270, r: 36 });
    he(ctx, 'הלוח של 7', W / 2, 650, { size: 44, w: 700 });
    S.starsT.forEach((s) => {
      const x = W / 2 + (1 - s.i) * 190, y = 780;
      popAt(ctx, t, s.t, x, y, (c) => star(c, 0, 0, 82, true, 6), { dur: 0.3, over: 3, rot: [-0.1, 0, 0.1][s.i] });
      if (t < s.t) star(ctx, x, y, 82, false, 6);
    });
    he(ctx, '10 מתוך 10 בניסיון הראשון', W / 2, 960, { size: 56, w: 900, alpha: UI.fadeIn(t, S.starsT[2].t, 0.25), maxW: SAFE.w - 80 });
    he(ctx, 'מושלם — 10 מתוך 10! 🏆', W / 2, 1035, { size: 44, w: 800, alpha: UI.fadeIn(t, S.starsT[2].t + 0.15, 0.25), maxW: SAFE.w - 80 });
    const press = t >= S.nextBtn ? 1 - 0.07 * pulse(t, S.nextBtn, 10) : 1;
    popAt(ctx, t, S.starsT[2].t + 0.3, W / 2, 1130, (c) => { c.scale(press, press); btn(c, 0, 0, 760, 90, 'לשלב הבא: חזרה: ⁦6, 7⁩ ו-⁦8⁩ ←', { bg: '#7dd87a', size: 38, seed: 271 }); });
    UI.tap(ctx, W / 2 + 80, 1130, t, S.nextBtn, { color: 'rgba(20,22,45,0.7)', size: 120 });
    const row = [['🔁 לשחק שוב', 240], ['🖨️ דף תרגול לשלב', 340], ['🗺️ למסלול', 200]];
    let rx = W / 2 + (row.reduce((a, [, w]) => a + w + 14, 0) - 14) / 2;
    row.forEach(([s, w], k) => { const x = rx - w / 2; rx -= w + 14; popAt(ctx, t, S.starsT[2].t + 0.45, x, 1225, (c) => btn(c, 0, 0, w, 66, s, { size: 28, seed: 275 + k, shadow: 4, lw: 3 }), { dur: 0.25 }); });
    he(ctx, 'הכוכבים לפי תשובות נכונות בניסיון הראשון', W / 2, 1352, { size: 34, w: 700, color: C.muted, alpha: UI.fadeIn(t, S.rules[0].t - 0.1, 0.25), maxW: SAFE.w });
    const R = [['10', 3], ['⁦8–9⁩', 2], ['⁦6–7⁩', 1]];
    const pad = (n) => 20 + n * 28;
    const ws = R.map(([s, n]) => measure(ctx, s, 36, 900) + 2 * pad(n));
    let cx = W / 2 + (ws.reduce((a, b) => a + b, 0) + 28) / 2;
    R.forEach(([s, n], k) => {
      const x = cx - ws[k] / 2; cx -= ws[k] + 14;
      popAt(ctx, t, S.rules[k].t, x, 1440, (c) => {
        pill(c, 0, 0, s, { size: 36, w: 900, bg: k === 0 ? C.yellow : '#fff', padX: pad(n), seed: 280 + k, shadow: 5, h: 70 });
        for (let j = 0; j < n; j++) star(c, ws[k] / 2 - 30 - j * 28, 0, 12, true, 2.5);
      }, { dur: 0.25, over: 1.8 });
    });
    confetti(ctx, t, S.starsT[2].t, W / 2, 800, { n: 70, seed: 6, spread: 950 });
  }

  // ================= 5. SHEET =================
  function sheetPage(ctx, t, answers) {
    const w = 420, h = 594;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 8, -h / 2 + 9, w, h, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 8); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
    he(ctx, answers ? 'תשובות — הלוח של 7' : 'מסלול לוח הכפל · הלוח של 7', 0, -h / 2 + 44, { size: 24, w: 900, maxW: w - 40 });
    if (!answers) he(ctx, 'שם: ________  הצלחתי: ___ מתוך 30', 0, -h / 2 + 78, { size: 17, w: 500, color: C.muted, maxW: w - 40 });
    S.SHEET.forEach(([a, b, v], i) => {
      const col = Math.floor(i / 10), row = i % 10, x = 136 - col * 136, y = -h / 2 + 125 + row * 36;
      const shown = !answers || t >= S.answerFill + (row + col * 0.5) * BEAT / 4;
      he(ctx, `${a} × ${b} = `, x + 14, y, { size: 19, w: 600, dir: 'ltr', align: 'right' });
      if (answers) { if (shown) he(ctx, String(v), x + 14, y, { size: 19, w: 900, dir: 'ltr', align: 'left', color: C.green }); }
      else he(ctx, '____', x + 14, y, { size: 19, w: 400, dir: 'ltr', align: 'left', color: '#999' });
    });
    if (!answers) {
      ctx.fillStyle = '#fff8db'; ctx.strokeStyle = '#c9a400'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-w / 2 + 20, h / 2 - 96, w - 40, 56, 10); ctx.fill(); ctx.stroke();
      he(ctx, 'כמה כוכבים הרווחתי?', w / 2 - 36, h / 2 - 60, { size: 20, w: 800, align: 'right' });
      for (let i = 0; i < 3; i++) star(ctx, -w / 2 + 60 + i * 38, h / 2 - 68, 14, false, 2);
    }
    he(ctx, 'עוגה בוגה · ugabuga.co.il', 0, h / 2 - 14, { size: 16, w: 500, color: C.muted });
  }
  function shotSheet(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    popAt(ctx, t, S.sheets[0].t, W / 2 + 222, 830, (c) => sheetPage(c, t, false), { rot: 0.025, dur: 0.3 });
    popAt(ctx, t, S.sheets[1].t, W / 2 - 222, 830, (c) => sheetPage(c, t, true), { rot: -0.025, dur: 0.3 });
    const P = S.sheetPills;
    popAt(ctx, t, P[0].t, W / 2, 1210, (c) => pill(c, 0, 0, '🖨️ 30 תרגילים ב-A4 + עמוד תשובות', { size: 40, w: 900, bg: C.yellow, seed: 290, padX: 34, h: 76 }), { rot: -0.02 });
    popAt(ctx, t, P[1].t, W / 2, 1320, (c) => pill(c, 0, 0, 'דף לכל אחד מ-14 השלבים', { size: 42, w: 800, bg: '#fff', seed: 291, padX: 36 }), { rot: 0.02 });
    popAt(ctx, t, P[2].t, W / 2, 1430, (c) => pill(c, 0, 0, '״תרגילים אחרים״ — דף חדש בכל לחיצה', { size: 36, w: 800, bg: '#fff', seed: 292, padX: 30 }), { rot: -0.015 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 580, (c) => {
      const s = 320;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'לוח הכפל כמסלול של כוכבים', W / 2, 1000, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'בחינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190, padX: 44 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט: לומדים ← משחק לוח הכפל 🗺️', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotPath },
    { t0: T(4), fn: shotPlay },
    { t0: T(6), fn: shotHint },
    { t0: T(8), fn: shotStars },
    { t0: T(10), fn: shotSheet },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.logo = await L('img/logo.svg');
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        const f = S.steps[i - 1] || { color: C.blue };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
