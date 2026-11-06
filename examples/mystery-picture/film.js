// THE FILM (9:16) — "מה מסתתר בציור הזה?": color by number and mandalas, in the site's own look. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio, D = globalThis.CBN;
  const { T, BEAT, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff', cell: '#c6cce0', num: '#4b5068' };
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
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, h, seed = 3, shadow = 7, dir = 'rtl', fam, maxW } = {}) {
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam) + padX * 2; if (mw > maxW) sz *= maxW / mw; }
    const ww = measure(ctx, s, sz, w, fam) + padX * 2, hh = h || size * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + sz * 0.36, { size: sz, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
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
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step header ----------
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

  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }

  // ---------- the picture board: the site's real grid, legend numbers in the cells ----------
  // amount(r, c) → 0 (blank, number shows) … 1 (painted)
  function board(ctx, pic, x, y, cell, amount, { numbers = true, frame = true } = {}) {
    const gw = pic.cols * cell, gh = pic.rows * cell;
    if (frame) card(ctx, x - 10, y - 10, gw + 20, gh + 20, { r: 14, seed: 5, shadow: 9, lw: 4 });
    ctx.save();
    ctx.lineWidth = Math.max(1, cell * 0.04); ctx.strokeStyle = C.cell;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
    const fs = Math.round(cell * 0.5);
    for (let r = 0; r < pic.rows; r++) for (let c = 0; c < pic.cols; c++) {
      const n = pic.grid[r][c];
      if (n <= 0) continue;
      const cx = x + c * cell, cy = y + r * cell, a = amount(r, c);
      ctx.fillStyle = '#fff'; ctx.fillRect(cx, cy, cell, cell);
      if (a > 0) {
        const k = 0.6 + 0.4 * a, s = cell * k, o = (cell - s) / 2;
        ctx.globalAlpha = clamp(a * 2);
        ctx.fillStyle = pic.legend[n - 1].hex; ctx.fillRect(cx + o, cy + o, s, s);
        ctx.globalAlpha = 1;
      }
      ctx.strokeRect(cx, cy, cell, cell);
      if (numbers && a < 1 && fs >= 7) {
        ctx.globalAlpha = 1 - a;
        ctx.fillStyle = C.num; ctx.font = `700 ${n > 9 ? fs * 0.82 : fs}px "Heebo", sans-serif`;
        ctx.fillText(String(n), cx + cell / 2, cy + cell / 2 + 1);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }
  // a legend chip: color swatch + its number
  function legendChip(ctx, cx, cy, w, h, l, on, seed) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, 20, { fill: on ? C.yellow : '#fff', lw: on ? 5.5 : 3, seed, stroke: on ? C.ink : C.line });
    const sw = h * 0.58, sx = cx + w / 2 - sw - 14;
    ctx.fillStyle = l.hex; ctx.beginPath(); ctx.roundRect(sx, cy - sw / 2, sw, sw, 10); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    he(ctx, String(l.num), sx - 14, cy + h * 0.2, { size: h * 0.56, w: 900, align: 'right', dir: 'ltr' });
  }

  // ---------- the mystery picture: only some cells are ever painted ----------
  const P = D.dragon;
  const list = (test) => { const o = []; P.grid.forEach((row, r) => row.forEach((n, c) => { if (test(n, r, c)) o.push([r, c]); })); return o; };
  const shuffle = (a, seed) => a.map((x, i) => [U.hash(seed * 31 + i * 13), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const FILL = new Map();
  const put = (cells, t0, t1) => cells.forEach(([r, c], i) => FILL.set(r + '-' + c, lerp(t0, t1, cells.length > 1 ? i / (cells.length - 1) : 0)));
  // hook: part of the wing and the belly (numbers 2, 3, 9 and 4)
  put(shuffle(list((n, r, c) => (c >= 11 && r <= 7 && [2, 3, 9].includes(n)) || n === 4), 3), ev.fill0, ev.fill1);
  // step 1: the four tapped numbers, cell after cell
  const AUD = S.AUD;
  AUD.forEach((a, i) => put(list((n) => n === a.num), a.t + 0.12, Math.min(a.t + 1.1, (AUD[i + 1] ? AUD[i + 1].t : T(3, 3)) - 0.1)));
  const mysteryAmount = (t) => (r, c) => { const t0 = FILL.get(r + '-' + c); return t0 === undefined ? 0 : clamp((t - t0) / 0.12); };
  const mysteryCount = (t) => { let k = 0; FILL.forEach((t0) => { if (t >= t0) k++; }); return k; };

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 262, (c) => pill(c, 0, 0, '🎨 צביעה לפי מספרים', { size: 48, w: 900, bg: C.purple, fg: '#fff', padX: 46, seed: 12 }), { rot: -0.03 });
    popAt(ctx, t, ev.q1, W / 2, 445, (c) => he(c, 'מה מסתתר', 0, 0, { size: 158, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 600, (c) => he(c, 'בציור הזה?', 0, 0, { size: 150, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    const gp = UI.pop(t, ev.q2, 0.32, 1.6);
    if (gp > 0) {
      ctx.save(); ctx.translate(W / 2, 960); ctx.scale(gp, gp); ctx.translate(-W / 2, -960);
      board(ctx, P, 120, 660, 35, mysteryAmount(t));
      ctx.restore();
    }
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(695, 1410); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ענו בראש… 🤔', { size: 60, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 255, 1420 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 440, t, ev.q2);
  }

  // ================= 1. PICK A COLOR, PAINT =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    board(ctx, P, 120, 480, 34, mysteryAmount(t));
    let active = 2; // the color left selected on the hook
    AUD.forEach((a) => { if (t >= a.t) active = a.num; });
    P.legend.forEach((l, i) => {
      const col = i % 5, row = Math.floor(i / 5), cx = 524 + (2 - col) * 168, cy = 1120 + row * 100;
      popAt(ctx, t, T(2, 0.05) + i * 0.03, cx, cy, (c) => legendChip(c, 0, 0, 152, 86, l, active === l.num, 200 + i), { dur: 0.22, over: 1.6 });
    });
    AUD.forEach((a) => {
      const i = a.num - 1, col = i % 5, row = Math.floor(i / 5);
      UI.tap(ctx, 524 + (2 - col) * 168, 1120 + row * 100, t, a.t, { color: 'rgba(34,107,215,0.8)', size: 120 });
    });
    popAt(ctx, t, T(2, 0.5), W / 2, 1335, (c) => pill(c, 0, 0, `נצבעו נכון ${mysteryCount(t)} מתוך 408 משבצות`, { size: 42, w: 800, bg: '#dff3e5', seed: 66, maxW: SAFE.w }), { rot: -0.01, dur: 0.25, over: 1.6 });
    popAt(ctx, t, T(3, 3.4), W / 2, 1445, (c) => pill(c, 0, 0, '🤔 כבר ניחשתם מה זה?', { size: 50, w: 900, bg: C.yellow, seed: 67 }), { rot: 0.02 });
  }

  // ================= 2. A MANDALA OPENS =================
  const M = D['mandala-sun'];
  const RING = new Map();
  { const mid = (M.cols - 1) / 2; let max = 0;
    M.grid.forEach((row, r) => row.forEach((n, c) => { if (n > 0) max = Math.max(max, Math.hypot(r - mid, c - mid)); }));
    M.grid.forEach((row, r) => row.forEach((n, c) => { if (n > 0) RING.set(r + '-' + c, lerp(ev.ring0, ev.topic - 0.15, Math.hypot(r - mid, c - mid) / max)); })); }
  const ringAmount = (t) => (r, c) => { const t0 = RING.get(r + '-' + c); return t0 === undefined ? 0 : clamp((t - t0) / 0.14); };
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const X = 180, Y = 480, CELL = 34, cx = X + M.cols * CELL / 2, cy = Y + M.rows * CELL / 2;
    const p = 1 + 0.035 * pulse(t, ev.topic, 7);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); ctx.translate(-cx, -cy);
    board(ctx, M, X, Y, CELL, ringAmount(t), { frame: false });
    ctx.restore();
    let act = 0, best = -1;
    M.grid.forEach((row, r) => row.forEach((n, c) => { const t0 = RING.get(r + '-' + c); if (t0 !== undefined && t >= t0 && t0 > best) { best = t0; act = n; } }));
    M.legend.forEach((l, i) => legendChip(ctx, 520 + (1.5 - i) * 180, 1225, 160, 84, l, act === l.num, 220 + i));
    popAt(ctx, t, T(5, 1.8), W / 2, 1345, (c) => pill(c, 0, 0, '🪞 כל צד בדיוק כמו הצד שמולו', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.015 });
    popAt(ctx, t, T(5, 2.6) + 0.2, W / 2, 1455, (c) => pill(c, 0, 0, '🌀 11 מנדלות לפי מספרים', { size: 48, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
    confetti(ctx, t, ev.topic, cx, cy, { n: 50, seed: 4, spread: 800 });
  }

  // ================= 3. LEVELS =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const X = SAFE.x, Wc = SAFE.w, full = () => 1;
    S.MODES.forEach((f, i) => {
      const y = 480 + i * 262, on = (i === 1 && t >= ev.mode);
      popAt(ctx, t, f.t, X + Wc / 2, y + 115, (c) => {
        card(c, -Wc / 2, -115, Wc, 230, { seed: 30 + i, fill: on ? C.yellow : C.card, shadow: 9, r: 28 });
        const pic = D[f.slug], cell = Math.floor(190 / pic.cols);
        c.save(); c.translate(Wc / 2 - 28 - cell * pic.cols, -cell * pic.rows / 2); board(c, pic, 0, 0, cell, full, { numbers: false, frame: false }); c.restore();
        const tx = Wc / 2 - 255;
        he(c, f.label, tx, -38, { size: 54, w: 900, align: 'right', maxW: Wc - 300 });
        he(c, f.name, tx, 22, { size: 38, w: 700, align: 'right', color: C.muted, maxW: Wc - 300 });
        he(c, `⁦${f.size}⁩ משבצות · ${f.colors} צבעים`, tx, 76, { size: 36, w: 600, align: 'right', color: C.muted, maxW: Wc - 300 });
      }, { dur: 0.3, over: 1.7, rot: [0.006, -0.006, 0.006][i] });
    });
    UI.tap(ctx, X + Wc / 2, 480 + 262 + 115, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 130 });
    popAt(ctx, t, T(7, 2), W / 2, 1320, (c) => pill(c, 0, 0, '🦄 חד קרן · 🧜‍♀️ בת ים · 🦚 טווס · 🐼 פנדה', { size: 42, w: 800, bg: C.lilac, seed: 66, maxW: SAFE.w + 40 }), { rot: -0.015 });
    popAt(ctx, t, T(7, 2.8), W / 2, 1435, (c) => pill(c, 0, 0, '🦕 דינוזאור, פיל, רובוט ועוד הרבה', { size: 42, w: 800, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.015 });
  }

  // ================= 4. ONLINE =================
  const PD = D.panda;
  const stroke = (() => { const o = []; PD.grid.forEach((row, r) => row.forEach((n, c) => { if (n === 1) o.push([r, c]); })); return o; })(); // black = number 1
  const STROKE_T = new Map();
  stroke.forEach(([r, c], i) => STROKE_T.set(r + '-' + c, { i, t: lerp(ev.go + 0.12, ev.undo - 0.15, i / (stroke.length - 1)) }));
  const UNDONE_FROM = Math.floor(stroke.length * 0.7);
  function pandaAmount(t) {
    return (r, c) => {
      if (t >= ev.ans) return 1; // "הצגת הפתרון"
      const s = STROKE_T.get(r + '-' + c);
      if (!s) return 0;
      if (t >= ev.undo && t < ev.redo && s.i >= UNDONE_FROM) return 0;
      return clamp((t - s.t) / 0.1);
    };
  }
  function pandaCount(t) {
    let k = 0;
    for (const { i, t: t0 } of STROKE_T.values()) if (t >= t0 && !(t >= ev.undo && t < ev.redo && i >= UNDONE_FROM)) k++;
    return k;
  }
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const bar = [['↩️ ביטול', ev.undo], ['↪️ שחזור', ev.redo], ['🧽 מחק'], ['🗑️ ניקוי הכול']];
    bar.forEach(([s, tt], k) => {
      const cx = RIGHT - 106 - k * 220, on = tt !== undefined && t >= tt && t < tt + 0.5;
      G.rrect(ctx, cx - 104, 480, 208, 72, 20, { fill: on ? C.yellow : '#fff', lw: on ? 5 : 3.5, seed: 170 + k, stroke: on ? C.ink : C.line });
      he(ctx, s, cx, 529, { size: 33, w: 800, maxW: 186 });
      if (tt !== undefined) UI.tap(ctx, cx, 516, t, tt, { color: 'rgba(224,138,0,0.8)', size: 110 });
    });
    const X = 216, Y = 584, CELL = 38;
    board(ctx, PD, X, Y, CELL, pandaAmount(t));
    const on = t >= ev.ans ? 0 : 1;
    PD.legend.forEach((l, i) => legendChip(ctx, 520 + (2 - i) * 172, 1270, 156, 84, l, on === l.num, 240 + i));
    UI.tap(ctx, 520 + 2 * 172, 1270, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 120 });
    const label = t >= ev.ans ? '🎨 ככה הציור נראה בסוף' : `נצבעו נכון ${pandaCount(t)} מתוך 212 משבצות`;
    pill(ctx, 340, 1395, label, { size: 36, w: 800, bg: '#dff3e5', seed: 66, maxW: 540, padX: 26, h: 76 });
    const press = t >= ev.ans ? 1 - 0.08 * pulse(t, ev.ans, 10) : 1;
    ctx.save(); ctx.translate(790, 1395); ctx.scale(press, press);
    pill(ctx, 0, 0, '👀 הצגת הפתרון', { size: 32, w: 800, bg: C.yellow, seed: 67, padX: 18, h: 76, maxW: 280 });
    ctx.restore();
    UI.tap(ctx, 790, 1395, t, ev.ans, { color: 'rgba(224,138,0,0.8)', size: 120 });
  }

  // ================= 5. PRINT =================
  function sheet(ctx, x, y, w, h, title, sub, pic, solved) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 8, -h / 2 + 10, w, h, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 12); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
    he(ctx, 'עוגה בוגה', 0, -h / 2 + 36, { size: 24, w: 900, color: C.muted });
    he(ctx, title, 0, -h / 2 + 80, { size: 36, w: 900, maxW: w - 30 });
    he(ctx, sub, 0, -h / 2 + 116, { size: 24, w: 600, color: C.muted, maxW: w - 30 });
    const cell = 20, gw = pic.cols * cell;
    board(ctx, pic, -gw / 2, -h / 2 + 150, cell, () => (solved ? 1 : 0), { frame: false });
    ctx.restore();
  }
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const pic = D['mandala-star'];
    const a = ease.outBack(clamp((t - T(10, 0.5)) / 0.4), 1.4), b = ease.outBack(clamp((t - T(10, 2)) / 0.4), 1.4);
    if (a > 0) { ctx.save(); ctx.translate(0, (1 - a) * 300); ctx.globalAlpha = clamp(a * 2); ctx.rotate(0.03); sheet(ctx, 735, 760, 390, 500, 'מנדלת כוכב', 'צובעים לפי המספרים', pic, false); ctx.restore(); }
    if (b > 0) { ctx.save(); ctx.translate(0, (1 - b) * 300); ctx.globalAlpha = clamp(b * 2); ctx.rotate(-0.03); sheet(ctx, 345, 760, 390, 500, 'דף פתרון', 'לבדיקה בסוף', pic, true); ctx.restore(); }
    const press = t >= ev.printBtn ? 1 - 0.08 * pulse(t, ev.printBtn, 10) : 1;
    if (t >= T(10, 3)) {
      ctx.save(); ctx.translate(W / 2, 1120); ctx.scale(press, press);
      pill(ctx, 0, 0, '🖨️ הדפסת כל 11 המנדלות', { size: 48, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 58, maxW: SAFE.w });
      ctx.restore();
      UI.tap(ctx, W / 2 + 120, 1120, t, ev.printBtn, { color: 'rgba(20,22,45,0.7)', size: 120 });
    }
    popAt(ctx, t, S.extras[0].t, W / 2, 1260, (c) => pill(c, 0, 0, '🧮 גם בגרסה עם תרגילי חשבון', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1385, (c) => pill(c, 0, 0, 'חיבור עד 10, חיבור עד 20, לוח הכפל', { size: 42, w: 800, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 560, 430, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 885 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'מנדלות וציורים לפי מספרים', W / 2, 980, { size: 54, w: 700, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1082, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1200, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט: להדפסה ← צביעה לפי מספרים', W / 2, 1322, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1440, (c) => pill(c, 0, 0, '✍️ מה מסתתר בציור? כתבו בתגובות', { size: 46, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 192, maxW: SAFE.w + 60 }), { rot: 0.02, dur: 0.35 });
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
