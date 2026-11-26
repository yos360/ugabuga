// THE FILM (9:16) — "איזה סמל מופיע בשני הקלפים?": the Hanukkah match game (/holidays/hanukkah/match-game) in the site own look. Pure function of t.
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


  const BOX = (ctx, x, y, w, h, o) => card(ctx, x, y, w, h, o);
  // a chip (rounded pill) at center x,y with given fill
  function chip(ctx, cx, cy, w, h, s, { on = false, color = C.blue, size = 34, seed = 1 } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : C.line });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: on ? '#fff' : C.ink, maxW: w - 24 });
  }

  // the mascot (the owner's logo character); falls back to the old logo
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }


  // ---- the game's own data/logic (src/data/hanukkahMatchGame.js): small deck = projective plane of order 3 ----
  const SYM13 = [['hanukkiah', '🕎', 'חנוכייה'], ['sevivon', null, 'סביבון'], ['sufganiya', '🍩', 'סופגנייה'], ['candle', '🕯️', 'נר'], ['coin', '🪙', 'מטבע'], ['olive', '🫒', 'זית'], ['gift', '🎁', 'מתנה'], ['star', '⭐', 'כוכב'], ['oil', '🪔', 'כד שמן'], ['flame', '🔥', 'להבה'], ['latke', '🥞', 'לביבה'], ['elephant', '🐘', 'פיל'], ['crown', '👑', 'כתר']];
  function buildDeck(n) {
    const cards = [], grid = (x, y) => x * n + y, slope = (k) => n * n + k;
    for (let k = 0; k < n; k++) for (let b = 0; b < n; b++) { const c = []; for (let x = 0; x < n; x++) c.push(grid(x, (k * x + b) % n)); c.push(slope(k)); cards.push(c); }
    for (let x = 0; x < n; x++) { const c = []; for (let y = 0; y < n; y++) c.push(grid(x, y)); c.push(slope(n)); cards.push(c); }
    const inf = []; for (let k = 0; k <= n; k++) inf.push(slope(k)); cards.push(inf);
    return cards;
  }
  const SMALL = buildDeck(3).map((c) => c.map((i) => SYM13[i]));
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  function layout(count, seed) {
    const r = rng(seed), ring = count - 1, start = r() * Math.PI * 2;
    const out = [{ x: 50, y: 50, scale: 0.9 + r() * 0.3, rot: Math.round((r() - 0.5) * 60) }];
    for (let i = 0; i < ring; i++) { const a = start + (i / ring) * Math.PI * 2, rad = count > 4 ? 31 : 28; out.push({ x: 50 + Math.cos(a) * rad, y: 50 + Math.sin(a) * rad, scale: 0.75 + r() * 0.4, rot: Math.round((r() - 0.5) * 90) }); }
    return out;
  }
  // the dreidel is drawn in SVG on the site (there is no dreidel emoji)
  function sevivon(c, size) {
    const k = size / 52; c.save(); c.translate(-20 * k, -26 * k); c.scale(k, k);
    c.fillStyle = '#8a5a2b'; c.beginPath(); c.roundRect(17, 1, 6, 11, 2); c.fill();
    c.fillStyle = '#2f6fd6'; c.strokeStyle = '#173b7a'; c.lineWidth = 2; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(6, 12); c.lineTo(34, 12); c.lineTo(34, 32); c.lineTo(20, 50); c.lineTo(6, 32); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(6, 32); c.lineTo(34, 32); c.lineWidth = 1.5; c.stroke();
    he(c, 'נ', 20, 27, { size: 15, w: 900, color: '#ffd23f' });
    c.restore();
  }
  function symbol(c, s, x, y, size, rot, mode) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const word = s[2];
    if (mode === 'words') he(c, word, 0, size * 0.13, { size: Math.max(size * 0.38, 26), w: 900 });
    else {
      const off = mode === 'both' ? -size * 0.16 : 0;
      if (s[0] === 'sevivon') { c.save(); c.translate(0, off); sevivon(c, size * 0.95); c.restore(); }
      else he(c, s[1], 0, off + size * 0.34, { size, w: 400, dir: 'ltr' });
      if (mode === 'both') he(c, word, 0, size * 0.62, { size: Math.max(size * 0.28, 24), w: 800 });
    }
    c.restore();
  }
  // a round card; returns the centre of every symbol (for the tap)
  function rcard(ctx, cx, cy, d, syms, seed, { mode = 'pics', mark = null, shadow = 8, lw = 5, k = 1.12 } = {}) {
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(shadow * 0.8, shadow, d / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fffdf5'; ctx.beginPath(); ctx.arc(0, 0, d / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6a4bb3'; ctx.lineWidth = lw; ctx.stroke();
    const pos = layout(syms.length, seed), unit = d / 13, base = syms.length > 4 ? 2.1 : 2.6;
    syms.forEach((s, i) => {
      const p = pos[i], px = (p.x - 50) / 100 * d, py = (p.y - 50) / 100 * d, size = base * p.scale * unit * k;
      if (mark && mark === s[0]) { ctx.fillStyle = 'rgba(35,135,77,0.3)'; ctx.beginPath(); ctx.arc(px, py, size * 0.78, 0, Math.PI * 2); ctx.fill(); }
      symbol(ctx, s, px, py, size, p.rot * Math.PI / 180 * (mode === 'pics' ? 1 : 1 / 3), mode);
    });
    ctx.restore();
  }
  const posOf = (cx, cy, d, n, seed, idx) => { const p = layout(n, seed)[idx]; return [cx + (p.x - 50) / 100 * d, cy + (p.y - 50) / 100 * d]; };
  const dot = (c, s, x, y, sz) => symbol(c, s, x, y, sz, 0, 'pics');

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    for (let i = 0; i < 14; i++) { const x = 90 + U.hash(i * 3 + 1) * 900, y = 120 + U.hash(i * 3 + 2) * 1500, a = 0.25 + 0.25 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,191,63,${a + 0.1})`; ctx.beginPath(); ctx.arc(x, y, 4 + U.hash(i) * 5, 0, Math.PI * 2); ctx.fill(); }
    popAt(ctx, t, 0.05, W / 2, 290, (c) => pill(c, 0, 0, '🕎 חנוכה מתקרב', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 465, (c) => he(c, 'איזה סמל מופיע', 0, 0, { size: 96, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 615, (c) => he(c, 'בשני הקלפים? 🔍', 0, 0, { size: 122, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    const d = 420, A = S.hookOpts;
    popAt(ctx, t, A[0].t, 300, 985, (c) => rcard(c, 0, 0, d, S.HOOK_CARDS[0].map(([id, e]) => [id, e, '']), 7919 * 3, { mode: 'pics' }), { rot: -0.06, dur: 0.3, over: 1.6 });
    popAt(ctx, t, A[1].t, 780, 985, (c) => rcard(c, 0, 0, d, S.HOOK_CARDS[1].map(([id, e]) => [id, e, '']), 7919 * 6, { mode: 'pics' }), { rot: 0.06, dur: 0.3, over: 1.6 });
    popAt(ctx, t, A[2].t, W / 2, 985, (c) => { c.fillStyle = C.ink; c.beginPath(); c.arc(4, 6, 50, 0, Math.PI * 2); c.fill(); c.fillStyle = C.yellow; c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke(); he(c, '?', 0, 26, { size: 76, w: 900, color: C.red, dir: 'ltr' }); }, { dur: 0.3, over: 2 });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1330); ctx.rotate(-0.02); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'מה הסמל המשותף? כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 40, maxW: SAFE.w });
      ctx.restore();
    }
    mascot(ctx, W / 2, 1690 - (t > ev.q2 + 0.45 ? hop(t, 10) : 0), 410, t, ev.q2);
  }

  // ================= 1. PICK A DECK =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD, picked = t >= ev.pick;
    [['🧸 חפיסה קטנה לגן', 745, 0], ['🎴 חפיסה גדולה', 335, 1]].forEach(([lb, x, i]) => {
      const on = i === 0 && picked;
      popAt(ctx, t, A[i].t, x + 0, 580, (c) => { const pr = on ? 1 + 0.05 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 390, 110, lb, { on, color: C.blue, size: 38, seed: 30 + i }); }, { dur: 0.25, over: 1.6, rot: [0.01, -0.01][i] });
    });
    UI.tap(ctx, 745, 595, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    S.DECKS.forEach(([e, lb, info, age], i) => {
      const on = i === 0 && picked, y = 805 + i * 215;
      popAt(ctx, t, A[2 + i].t, W / 2, y, (c) => {
        card(c, -440, -95, 880, 190, { fill: on ? '#eef4ff' : '#fff', r: 28, seed: 33 + i, shadow: 9, lw: 4.5 });
        he(c, e + ' ' + lb, 400, -28, { size: 52, w: 900, align: 'right', color: i ? C.red : C.blue, maxW: 560 });
        pill(c, -290, -42, age, { size: 38, w: 900, bg: C.lilac, seed: 34 + i, padX: 26 });
        he(c, info, 400, 52, { size: 42, w: 700, align: 'right', maxW: 810 });
      }, { dur: 0.3, over: 1.4, rot: [0.006, -0.006][i] });
    });
    popAt(ctx, t, A[4].t, W / 2, 1250, (c) => {
      card(c, -440, -100, 880, 200, { fill: C.yellow, r: 28, seed: 37, shadow: 9, lw: 4.5 });
      he(c, 'בכל שני קלפים יש תמונה אחת', 400, -18, { size: 54, w: 900, align: 'right', maxW: 810 });
      he(c, 'בדיוק שמופיעה בשניהם', 400, 54, { size: 54, w: 900, align: 'right', color: C.red, maxW: 810 });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    popAt(ctx, t, S.pills[0], W / 2, 1420, (c) => pill(c, 0, 0, 'שתי חפיסות: לגן ולכיתה', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1525, (c) => pill(c, 0, 0, 'כל זוג קלפים נבדק: תמונה אחת משותפת', { size: 40, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. WHAT IS ON THE CARDS =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const cols = [C.blue, C.red, C.green], on = (i) => i === 2 && t >= ev.topic;
    S.MODES_L.forEach((lb, i) => {
      const y = 590 + i * 150;
      popAt(ctx, t, S.TOPICS[i].t, W / 2, y, (c) => {
        const pr = on(i) ? 1 + 0.03 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr);
        card(c, -440, -62, 880, 124, { fill: on(i) ? '#f4edff' : '#fff', r: 28, seed: 40 + i, shadow: 8, lw: on(i) ? 5 : 4.5 });
        he(c, lb, 400, 17, { size: 52, w: 900, align: 'right', color: cols[i], maxW: 470 });
        G.rrect(c, -405, -42, 330, 84, 22, { fill: C.paper, lw: 3, seed: 44 + i, stroke: C.line });
        if (i === 0) dot(c, SYM13[2], -240, 0, 66);
        if (i === 1) { dot(c, SYM13[2], -240, -8, 52); he(c, 'סופגנייה', -240, 32, { size: 24, w: 800, maxW: 300 }); }
        if (i === 2) he(c, 'סופגנייה', -240, 14, { size: 44, w: 900, maxW: 300 });
      }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008][i % 2] });
    });
    UI.tap(ctx, 340, 905, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.TOPICS[3].t, W / 2, 1050, (c) => he(c, 'גם על המסך וגם בהדפסה', 0, 0, { size: 42, w: 800, color: C.muted, maxW: SAFE.w }), { dur: 0.25 });
    popAt(ctx, t, ev.reasonCard, W / 2, 1255, (c) => {
      card(c, -440, -125, 880, 250, { fill: '#fffdf7', r: 28, seed: 50, shadow: 9, lw: 4.5 });
      he(c, '🔤 תרגול קריאה', 410, -62, { size: 50, w: 900, align: 'right', color: C.green, maxW: 830 });
      wrap(c, S.TEACH_READ, 38, 810, 600, 3).forEach((ln, i) => he(c, ln, 410, 4 + i * 52, { size: 38, w: 600, align: 'right', maxW: 830 }));
    }, { dur: 0.3, over: 1.4, rot: -0.008 });
    popAt(ctx, t, S.pills[2], W / 2, 1440, (c) => pill(c, 0, 0, 'כיתה א׳: תמונה ומילה, ואז מילים', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1535, (c) => pill(c, 0, 0, 'בגן: מתחילים בחפיסה הקטנה', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. PLAY ON SCREEN =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, picked = t >= ev.mode, d = 420, cy = 985, SA = 7919 * 11, SB = 7919 * 12;
    popAt(ctx, t, M0[0].t, W / 2, 610, (c) => {
      card(c, -440, -80, 880, 160, { fill: '#eef4ff', r: 28, seed: 60, shadow: 9, lw: 4.5 });
      he(c, 'מצאו את התמונה שמופיעה בשני הקלפים', 400, -8, { size: 46, w: 900, align: 'right', maxW: 810 });
      he(c, 'ולחצו עליה', 400, 52, { size: 46, w: 900, align: 'right', color: C.red, maxW: 810 });
    }, { dur: 0.28, over: 1.4, rot: -0.008 });
    const mk = picked ? S.PLAY_COMMON : null;
    popAt(ctx, t, M0[1].t, 300, cy, (c) => rcard(c, 0, 0, d, S.PLAY_CARDS[0], SA, { mode: 'both', mark: mk, k: 0.8 }), { rot: -0.05, dur: 0.3, over: 1.6 });
    popAt(ctx, t, M0[2].t, 780, cy, (c) => rcard(c, 0, 0, d, S.PLAY_CARDS[1], SB, { mode: 'both', mark: mk, k: 0.8 }), { rot: 0.05, dur: 0.3, over: 1.6 });
    const [tx, ty] = posOf(300, cy, d, 4, SA, 1);
    UI.tap(ctx, tx, ty + 10, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, M0[3].t, W / 2, 1275, (c) => pill(c, 0, 0, '⁦3⁩ מתוך ⁦10⁩', { size: 48, w: 900, bg: C.lilac, seed: 62, padX: 50 }), { rot: -0.02, dur: 0.25 });
    popAt(ctx, t, S.explainT, W / 2, 1375, (c) => {
      card(c, -440, -62, 880, 124, { fill: '#e5f7ec', r: 28, seed: 66, shadow: 8, lw: 4.5 });
      he(c, '✔️ נכון! מטבע', 400, 18, { size: 60, w: 900, align: 'right', color: C.green, maxW: 810 });
    }, { dur: 0.3, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[4], W / 2, 1480, (c) => pill(c, 0, 0, 'סבב אחד הוא ⁦10⁩ זוגות', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1572, (c) => pill(c, 0, 0, 'ובסוף רואים כמה זמן זה לקח', { size: 40, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. PRINT =================
  function page(c, i) {
    card(c, -150, -212, 300, 424, { fill: '#fff', r: 12, seed: 90 + i, shadow: 9, lw: 4 });
    if (i === 0) {
      he(c, '🕎 מצא את הזהה — חנוכה · עמוד ⁦1⁩ מתוך ⁦3⁩', 135, -182, { size: 14, w: 900, align: 'right', maxW: 270 });
      for (let k = 0; k < 6; k++) {
        const x = k % 2 === 0 ? 70 : -70, y = -108 + Math.floor(k / 2) * 126;
        rcard(c, x, y, 112, SMALL[k], (k + 1) * 7919, { mode: 'pics', shadow: 0, lw: 1.5, k: 0.95 });
      }
    } else {
      he(c, '🕎 מצא את הזהה — איך משחקים', 135, -182, { size: 15, w: 900, align: 'right', maxW: 270 });
      S.GAMES.forEach(([e, ttl], k) => {
        const y = -150 + k * 82;
        G.rrect(c, -132, y, 264, 70, 8, { fill: '#fff', lw: 1.5, seed: 95 + k, stroke: '#aaa' });
        he(c, `${e} ${ttl}`, 124, y + 24, { size: 15, w: 900, align: 'right', maxW: 240 });
        c.fillStyle = '#bbb'; c.fillRect(-120, y + 38, 232, 3); c.fillRect(-120, y + 50, 180, 3);
      });
    }
  }
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, T(8, 0.05), W / 2, 570, (c) => { c.scale(press, press); pill(c, 0, 0, '🖨️ הדפסת הקלפים', { size: 54, w: 900, bg: C.purple, fg: '#fff', padX: 80, seed: 83 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 585, t, ev.go, { color: 'rgba(138,79,216,0.8)', size: 120 });
    S.ROWS.slice(0, 2).forEach((r) => {
      popAt(ctx, t, r.t, 735 - r.i * 400, 945, (c) => { c.scale(1.18, 1.18); page(c, r.i); }, { dur: 0.3, over: 1.5, rot: [-0.03, 0.025][r.i] });
    });
    popAt(ctx, t, S.ROWS[2].t, W / 2, 1290, (c) => { chip(c, 245, 0, 420, 90, 'עמודי קלפים: ⁦6⁩ בעמוד', { on: true, color: C.orange, size: 32, seed: 86 }); chip(c, -245, 0, 420, 90, 'עמוד כללים', { on: false, size: 32, seed: 87 }); }, { dur: 0.25, over: 1.5, rot: 0.008 });
    popAt(ctx, t, ev.ans, W / 2, 1390, (c) => pill(c, 0, 0, 'מוכן להדפסה! 🖨️', { size: 58, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1360, { n: 50, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[6], W / 2, 1488, (c) => pill(c, 0, 0, 'עדיף על נייר עבה או בריסטול', { size: 40, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[7], W / 2, 1572, (c) => pill(c, 0, 0, 'גוזרים לפי העיגול', { size: 40, w: 900, bg: C.yellow, seed: 86, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. FOUR WAYS TO PLAY =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems, cols = [C.blue, C.red, C.orange, C.green];
    const SHORT = ['מי שמוצא ראשון — לוקח את הקלף', 'מנצח מי שנגמרים לו הקלפים ראשון', 'חמישה סבבים, ומי שאסף הכי הרבה מנצח', 'בלי מנצחים, לגן ולמפגש'];
    S.GAMES.forEach(([e, ttl], i) => {
      popAt(ctx, t, I[i].t, W / 2, 575 + i * 125, (c) => {
        card(c, -440, -52, 880, 104, { fill: '#fff', r: 26, seed: 100 + i, shadow: 7, lw: 4.5 });
        he(c, e, 395, 20, { size: 50, w: 400 });
        he(c, ttl, 335, -6, { size: 42, w: 900, align: 'right', color: cols[i], maxW: 700 });
        he(c, SHORT[i], 335, 36, { size: 31, w: 600, align: 'right', color: C.muted, maxW: 740 });
      }, { dur: 0.25, over: 1.5, rot: [0.006, -0.006][i % 2] });
    });
    popAt(ctx, t, I[4].t, W / 2, 1180, (c) => {
      card(c, -440, -125, 880, 250, { fill: '#fffdf7', r: 28, seed: 110, shadow: 9, lw: 4.5 });
      he(c, 'בחפיסה הקטנה: ⁦13⁩ סמלים', 405, -68, { size: 44, w: 900, align: 'right', maxW: 820 });
      he(c, 'וכל אחד מופיע ב־⁦4⁩ קלפים', 405, -14, { size: 36, w: 700, align: 'right', color: C.muted, maxW: 820 });
    }, { dur: 0.3, over: 1.3, rot: 0.006 });
    for (let k = 0; k < 8; k++) {
      const p = UI.pop(t, S.dotsT(k), 0.25, 2); if (p <= 0) continue;
      ctx.save(); ctx.translate(795 - k * 94, 1235); ctx.scale(p, p); dot(ctx, SYM13[k], 0, 0, 70); ctx.restore();
    }
    popAt(ctx, t, I[5].t, W / 2, 1405, (c) => {
      card(c, -440, -62, 880, 124, { fill: '#fff4bb', r: 28, seed: 112, shadow: 8, lw: 4.5 });
      he(c, '🍎 לגננת ולמורה', 405, -10, { size: 50, w: 900, align: 'right', maxW: 820 });
      he(c, 'בגן שואלים "מה זה?" והמשחק הופך לשיחה על החג', 405, 38, { size: 31, w: 700, align: 'right', color: C.muted, maxW: 820 });
    }, { dur: 0.3, over: 1.3, rot: -0.006 });
    popAt(ctx, t, ev.printBtn, W / 2, 1540, (c) => pill(c, 0, 0, 'חינם, על המסך ולהדפסה', { size: 46, w: 900, bg: C.green, fg: '#fff', padX: 44, seed: 113, maxW: SAFE.w }), { rot: -0.03, dur: 0.35 });
  }

  // the two hook cards again, small, under the question (answer still open)
  function endCards(ctx, t, t0) {
    popAt(ctx, t, t0, 330, 1570, (c) => rcard(c, 0, 0, 300, S.HOOK_CARDS[0].map(([id, e]) => [id, e, '']), 7919 * 3, { shadow: 6, lw: 4 }), { rot: -0.05, dur: 0.3 });
    popAt(ctx, t, t0 + 0.1, 750, 1570, (c) => rcard(c, 0, 0, 300, S.HOOK_CARDS[1].map(([id, e]) => [id, e, '']), 7919 * 6, { shadow: 6, lw: 4 }), { rot: 0.05, dur: 0.3 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 440); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 440, 340, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 720 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'מצא את הזהה: משחק קלפים לחנוכה', W / 2, 800, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 885, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 990, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'באתר: חנוכה ← מצא את הזהה 🃏', W / 2, 1090, { size: 40, w: 800, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1230, (c) => { card(c, -450, -82, 900, 164, { fill: C.red, r: 40, seed: 192, shadow: 8, lw: 4.5 }); he(c, 'איזה סמל מופיע', 0, -14, { size: 54, w: 900, color: '#fff', maxW: 840 }); he(c, 'בשני הקלפים? 🔍', 0, 52, { size: 54, w: 900, color: '#fff', maxW: 840 }); }, { rot: 0.015, dur: 0.35 });
    popAt(ctx, t, L[4].t + 0.35, W / 2, 1385, (c) => pill(c, 0, 0, 'מה הסמל המשותף? כתבו בתגובות 👇', { size: 46, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    endCards(ctx, t, L[4].t + 0.7);
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }
  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotAud },
    { t0: T(4), fn: shotTopics },
    { t0: T(6), fn: shotModes },
    { t0: T(8), fn: shotPlay },
    { t0: T(10), fn: shotPrint },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.logo = (await L('img/mascot.png')) || (await L('img/logo.svg'));
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
