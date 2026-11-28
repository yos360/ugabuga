// THE FILM (9:16) — "איזה מספר חסר?": the sudoku section in the site own look (paper + dot grid,
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

  function chip(ctx, cx, cy, w, h, s, { on = false, color = C.blue, size = 34, seed = 1, dir = 'rtl', fam } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : C.line });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: on ? '#fff' : C.ink, maxW: w - 24, dir, fam });
  }
  // the mascot (the owner's logo character)
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }

  // ---------- the sudoku board, as on the site (src/sudoku/sudoku.css): ink box lines, given = ink, typed = blue ----------
  const BOX = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
  // vals[i] = { v, kind: 'given' | 'pen', pop (0..1.x) } or null; o.bg(i) = cell colour or null
  function sdkBoard(ctx, cx, cy, size, n, vals, o = {}) {
    const cs = size / n, x0 = cx - size / 2, y0 = cy - size / 2, [br, bc] = BOX[n], rad = n === 9 ? 14 : 18;
    ctx.save();
    if (o.shadow !== 0) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(x0 + 8, y0 + 11, size, size, rad); ctx.fill(); }
    ctx.beginPath(); ctx.roundRect(x0, y0, size, size, rad); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.save(); ctx.clip();
    for (let i = 0; i < n * n; i++) { const bgc = o.bg && o.bg(i); if (bgc) { ctx.fillStyle = bgc; ctx.fillRect(x0 + (i % n) * cs, y0 + Math.floor(i / n) * cs, cs, cs); } }
    ctx.strokeStyle = '#c9cdd8'; ctx.lineWidth = Math.max(1.5, size / 300);
    for (let k = 1; k < n; k++) { ctx.beginPath(); ctx.moveTo(x0, y0 + k * cs); ctx.lineTo(x0 + size, y0 + k * cs); ctx.moveTo(x0 + k * cs, y0); ctx.lineTo(x0 + k * cs, y0 + size); ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(3, size / 120);
    for (let k = 1; k < n; k++) {
      if (k % br === 0) { ctx.beginPath(); ctx.moveTo(x0, y0 + k * cs); ctx.lineTo(x0 + size, y0 + k * cs); ctx.stroke(); }
      if (k % bc === 0) { ctx.beginPath(); ctx.moveTo(x0 + k * cs, y0); ctx.lineTo(x0 + k * cs, y0 + size); ctx.stroke(); }
    }
    ctx.restore();
    const fs = cs * 0.58;
    for (let i = 0; i < n * n; i++) {
      const c = vals[i]; if (!c || !c.v) continue;
      const px = x0 + (i % n + 0.5) * cs, py = y0 + (Math.floor(i / n) + 0.5) * cs, pp = c.pop === undefined ? 1 : c.pop;
      if (pp <= 0) continue;
      ctx.save(); ctx.translate(px, py); ctx.scale(pp, pp);
      he(ctx, String(c.v), 0, fs * 0.36, { size: fs, w: c.kind === 'given' ? 800 : 700, color: c.kind === 'given' ? C.ink : C.blue, dir: 'ltr', fam: 'Fredoka' });
      ctx.restore();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(4, size / 100); ctx.beginPath(); ctx.roundRect(x0, y0, size, size, rad); ctx.stroke();
    ctx.restore();
    return { x0, y0, cs, cell: (i) => [x0 + (i % n + 0.5) * cs, y0 + (Math.floor(i / n) + 0.5) * cs] };
  }
  const givens = (g) => g.map((v) => (v ? { v, kind: 'given' } : null));
  const key = (ctx, cx, cy, w, h, label, { on = false, small, seed = 1, size = 40 } = {}) => {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2 + 5, w, h, 14); ctx.fill();
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, 14, { fill: on ? C.yellow : '#fff', lw: 3.5, seed, stroke: C.ink });
    he(ctx, label, cx, cy + size * 0.36 - (small !== undefined ? 6 : 0), { size, w: 700, dir: 'ltr', fam: 'Fredoka' });
    if (small !== undefined) he(ctx, String(small), cx + w / 2 - 15, cy + h / 2 - 11, { size: 19, w: 700, color: C.muted, dir: 'ltr', fam: 'Fredoka', align: 'center' });
  };

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    for (let i = 0; i < 14; i++) { const x = 90 + U.hash(i * 3 + 1) * 900, y = 120 + U.hash(i * 3 + 2) * 1500, a = 0.25 + 0.25 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,191,63,${a + 0.1})`; ctx.beginPath(); ctx.arc(x, y, 4 + U.hash(i) * 5, 0, Math.PI * 2); ctx.fill(); }
    popAt(ctx, t, 0.05, W / 2, 290, (c) => pill(c, 0, 0, '🔢 סודוקו', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 465, (c) => he(c, 'איזה מספר חסר', 0, 0, { size: 118, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 615, (c) => he(c, 'במשבצת הכתומה? 🔍', 0, 0, { size: 100, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    he(ctx, 'כל מספר פעם אחת בכל שורה, עמודה וריבוע', W / 2, 715, { size: 38, w: 700, color: '#3b3e5c', alpha: UI.fadeIn(t, ev.q1 + BEAT * 1.6, 0.25), maxW: SAFE.w });
    const B = S.BOARDS.hook, vals = givens(B.g);
    popAt(ctx, t, ev.q1 + BEAT * 1.3, 620, 1040, (c) => {
      sdkBoard(c, 0, 0, 460, 4, vals, { bg: (i) => (i === B.target ? '#ffb347' : null) });
      const pr = 1 + 0.06 * Math.sin(t * 6);
      c.save(); c.translate((B.target % 4 - 1.5) * 115, (Math.floor(B.target / 4) - 1.5) * 115); c.scale(pr, pr);
      he(c, '?', 0, 30, { size: 90, w: 900, color: C.ink, dir: 'ltr', fam: 'Fredoka' }); c.restore();
    }, { rot: 0.01, dur: 0.35, over: 1.6 });
    S.hookOpts.forEach((o) => {
      popAt(ctx, t, o.t, 540 + (o.i - 1.5) * 170, 1385, (c) => {
        c.fillStyle = C.ink; c.beginPath(); c.arc(4, 7, 62, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.yellow; c.beginPath(); c.arc(0, 0, 62, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
        he(c, String(o.i + 1), 0, 28, { size: 80, w: 800, dir: 'ltr', fam: 'Fredoka' });
      }, { dur: 0.3, over: 2 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1530); ctx.rotate(-0.02); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'איזה מספר? כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 40, maxW: SAFE.w });
      ctx.restore();
    }
    mascot(ctx, 165, 1100 - (t > ev.q2 + 0.45 ? hop(t, 10) : 0), 300, t, ev.q2);
  }

  // ================= 1. FOUR LEVELS =================
  function shotLevels(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.LEVELS.forEach((L) => {
      const y = 600 + L.i * 190;
      popAt(ctx, t, L.t, W / 2, y, (c) => {
        card(c, -440, -80, 880, 160, { fill: '#fff', r: 28, seed: 30 + L.i, shadow: 9, lw: 4.5 });
        he(c, L.e, 375, 26, { size: 80, w: 400 });
        he(c, L.label, 290, -8, { size: 54, w: 900, align: 'right', color: L.color, maxW: 520 });
        he(c, L.sub, 290, 44, { size: 36, w: 600, align: 'right', color: C.muted, maxW: 520 });
        he(c, L.stars, -400, 20, { size: 56, w: 900, align: 'left', color: L.color, dir: 'ltr', fam: 'Fredoka' });
      }, { dur: 0.3, over: 1.4, rot: [0.006, -0.006, 0.006, -0.006][L.i] });
    });
    popAt(ctx, t, S.levelPills[0], W / 2, 1395, (c) => pill(c, 0, 0, '✅ לכל לוח יש פתרון אחד בדיוק', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.levelPills[1], W / 2, 1500, (c) => pill(c, 0, 0, 'פותרים בהיגיון, בלי לנחש', { size: 44, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. KIDS =================
  function shotKids(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const K = S.kidT, B4 = S.BOARDS.k4, B6 = S.BOARDS.k6, taps = S.kidTaps;
    const v4 = givens(B4.g);
    taps.forEach((k) => { if (t >= k.t) v4[k.cell] = { v: k.v, kind: 'pen', pop: UI.pop(t, k.t, 0.3, 2.4) }; });
    // which cell is selected right now
    let sel = -1; taps.forEach((k) => { if (t >= k.tTap && t < k.t + 0.25) sel = k.cell; });
    const lastFill = taps.filter((k) => t >= k.t).slice(-1)[0];
    popAt(ctx, t, K[0].t, 740, 790, (c) => sdkBoard(c, 0, 0, 380, 4, v4, { bg: (i) => (i === sel ? '#ffe79a' : (lastFill && lastFill.v === v4[i]?.v && v4[i]?.kind === 'pen' ? '#cddcff' : null)) }), { rot: 0.012, dur: 0.3, over: 1.5 });
    popAt(ctx, t, K[1].t, 330, 790, (c) => sdkBoard(c, 0, 0, 380, 6, givens(B6.g)), { rot: -0.012, dur: 0.3, over: 1.5 });
    popAt(ctx, t, K[2].t, 740, 1030, (c) => pill(c, 0, 0, '🐣 ⁦4×4⁩ · מגיל ⁦5–6⁩', { size: 34, w: 900, bg: '#e3f6ea', seed: 41, padX: 24, maxW: 400 }), { rot: -0.02 });
    popAt(ctx, t, K[2].t + 0.3, 330, 1030, (c) => pill(c, 0, 0, '🐥 ⁦6×6⁩ · כיתות א׳–ב׳', { size: 34, w: 900, bg: '#fff4bb', seed: 42, padX: 24, maxW: 400 }), { rot: 0.02 });
    // the number keys under the boards
    popAt(ctx, t, K[2].t + 0.1, W / 2, 1190, (c) => { [1, 2, 3, 4].forEach((v) => { const on = taps.some((k) => k.v === v && t >= k.t && t < k.t + 0.3); key(c, (v - 2.5) * 140, 0, 120, 100, String(v), { on, seed: 50 + v, size: 52 }); }); }, { dur: 0.3, over: 1.5 });
    taps.forEach((k) => { UI.tap(ctx, 740 + ((k.cell % 4) - 1.5) * 95, 790 + (Math.floor(k.cell / 4) - 1.5) * 95, t, k.tTap, { color: 'rgba(35,135,77,0.8)', size: 110 }); UI.tap(ctx, 540 + (k.v - 2.5) * 140, 1190, t, k.t - 0.12, { color: 'rgba(20,22,45,0.7)', size: 110 }); });
    popAt(ctx, t, K[3].t, W / 2, 1360, (c) => {
      card(c, -440, -100, 880, 200, { fill: C.yellow, r: 28, seed: 44, shadow: 9, lw: 4.5 });
      he(c, 'כל מספר רק פעם אחת', 405, -12, { size: 54, w: 900, align: 'right', maxW: 810 });
      he(c, 'בשורה, בעמודה ובריבוע המודגש', 405, 56, { size: 46, w: 800, align: 'right', color: C.red, maxW: 810 });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    popAt(ctx, t, K[4].t, W / 2, 1520, (c) => pill(c, 0, 0, 'אפשר גם להדפיס 🖨️', { size: 44, w: 900, bg: C.lilac, seed: 45, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 3. THE PLAYER =================
  const PX = 540, PY = 935, PS = 780;
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const E = S.EASY, P = S.playT, taps = S.playTaps;
    const vals = givens(E.g); const done = [];
    taps.forEach((k) => { if (t >= k.t) { vals[k.cell] = { v: k.v, kind: 'pen', pop: UI.pop(t, k.t, 0.3, 2.4) }; done.push([k.cell, k.v]); } });
    let sel = -1; taps.forEach((k) => { if (t >= k.tTap && t < k.t + 0.5) sel = k.cell; });
    const last = taps.filter((k) => t >= k.t).slice(-1)[0];
    const selV = sel >= 0 && vals[sel] && vals[sel].v ? vals[sel].v : (last && t < last.t + 0.9 ? last.v : 0);
    const peers = (i) => { if (i < 0) return () => false; const r = Math.floor(i / 9), c = i % 9; return (j) => Math.floor(j / 9) === r || j % 9 === c || (Math.floor(Math.floor(j / 9) / 3) === Math.floor(r / 3) && Math.floor((j % 9) / 3) === Math.floor(c / 3)); };
    const isPeer = peers(sel);
    // the stats row
    popAt(ctx, t, P[0].t, W / 2, 515, (c) => {
      const secs = Math.max(0, Math.floor(t - S.S.play[0] - 0.3)), tm = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
      he(c, '⏱️', 380, 14, { size: 40, w: 400 }); he(c, tm, 335, 14, { size: 42, w: 800, align: 'right', dir: 'ltr', fam: 'Fredoka' });
      he(c, 'טעויות: ⁦0⁩', 0, 14, { size: 40, w: 800 });
      chip(c, -300, 4, 190, 52, 'בדיקת טעויות', { on: true, color: C.green, size: 25, seed: 60 });
    }, { dur: 0.25, over: 1.4 });
    popAt(ctx, t, P[0].t + 0.1, PX, PY, (c) => {
      c.translate(-PX, -PY);
      sdkBoard(c, PX, PY, PS, 9, vals, { bg: (i) => (i === sel ? '#ffe79a' : (selV && vals[i] && vals[i].v === selV ? '#cddcff' : (isPeer(i) ? '#eef3ff' : null))) });
    }, { dur: 0.3, over: 1.3 });
    const cellXY = (i) => [PX - PS / 2 + (i % 9 + 0.5) * PS / 9, PY - PS / 2 + (Math.floor(i / 9) + 0.5) * PS / 9];
    taps.forEach((k) => { const [x, y] = cellXY(k.cell); UI.tap(ctx, x, y, t, k.tTap, { color: 'rgba(207,47,86,0.8)', size: 100 }); });
    // tools: right to left ביטול, מחיקה, טיוטה, רמז
    popAt(ctx, t, P[1].t, W / 2, 1405, (c) => {
      [['↩️', 'ביטול'], ['⌫', 'מחיקה'], ['✏️', 'טיוטה'], ['💡', 'רמז']].forEach(([e, s], i) => chip(c, 292 - i * 195, 0, 185, 70, `${e} ${s}`, { size: 31, seed: 70 + i }));
    }, { dur: 0.3, over: 1.4 });
    // the number keys with how many of each are still missing (the small number)
    popAt(ctx, t, P[1].t + 0.15, W / 2, 1518, (c) => {
      for (let v = 1; v <= 9; v++) {
        const left = S.countLeft(v, done), on = taps.some((k) => k.v === v && t >= k.t && t < k.t + 0.3);
        key(c, (v - 5) * 87, 0, 80, 92, String(v), { on, small: left > 0 ? left : '✓', seed: 80 + v, size: 44 });
      }
    }, { dur: 0.3, over: 1.4 });
    taps.forEach((k) => UI.tap(ctx, 540 + (k.v - 5) * 87, 1518, t, k.t - 0.12, { color: 'rgba(20,22,45,0.7)', size: 100 }));
    popAt(ctx, t, P[3].t, W / 2, 1625, (c) => pill(c, 0, 0, 'עם טיוטה, ביטול ורמז', { size: 38, w: 900, bg: C.yellow, seed: 90, padX: 30, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. DAILY =================
  function shotDaily(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const D = S.dailyT, B = S.BOARDS.daily;
    popAt(ctx, t, D[0].t, W / 2, 545, (c) => pill(c, 0, 0, '📅 סודוקו יומי · רמה בינונית', { size: 46, w: 900, bg: C.purple, fg: '#fff', padX: 40, seed: 100, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, D[1].t, W / 2, 890, (c) => sdkBoard(c, 0, 0, 520, 9, givens(B.g)), { rot: 0.01, dur: 0.3, over: 1.4 });
    popAt(ctx, t, D[2].t, W / 2, 1218, (c) => he(c, 'אותו לוח לכל מי שמשחק היום', 0, 0, { size: 46, w: 900, maxW: SAFE.w }), { dur: 0.25 });
    popAt(ctx, t, D[2].t + 0.4, W / 2, 1298, (c) => pill(c, 0, 0, '🕛 מחר בחצות — לוח חדש', { size: 42, w: 900, bg: C.lilac, seed: 101, maxW: SAFE.w }), { rot: -0.02 });
    const press = t >= ev.share ? 1 - 0.08 * pulse(t, ev.share, 10) : 1;
    popAt(ctx, t, D[3].t, W / 2, 1398, (c) => { c.scale(press, press); pill(c, 0, 0, '💬 שליחת הלוח לחבר', { size: 46, w: 900, bg: C.red, fg: '#fff', padX: 50, seed: 102, maxW: SAFE.w }); }, { rot: -0.02 });
    UI.tap(ctx, W / 2 + 80, 1398, t, ev.share, { color: 'rgba(20,22,45,0.7)', size: 120 });
    popAt(ctx, t, D[4].t, W / 2, 1522, (c) => {
      card(c, -440, -78, 880, 156, { fill: '#dcf8c6', r: 28, seed: 103, shadow: 8, lw: 4.5 });
      he(c, '🔢 סודוקו בינוני — אותו לוח בדיוק,', 405, -10, { size: 44, w: 800, align: 'right', maxW: 810 });
      he(c, 'בואו נראה מי פותר מהר יותר', 405, 46, { size: 44, w: 800, align: 'right', maxW: 810 });
    }, { dur: 0.3, over: 1.4, rot: 0.008 });
  }

  // ================= 5. PRINT + SOLVER =================
  function a4(ctx, kind, boards, sols) {
    const w = 310, h = 440;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 8, -h / 2 + 10, w, h, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    he(ctx, kind === 'sol' ? 'פתרונות' : 'סודוקו להדפסה', 0, -h / 2 + 38, { size: 28, w: 900, maxW: w - 30 });
    boards.forEach((g, i) => {
      const x = (i % 2 - 0.5) * 140, y = -h / 2 + 140 + Math.floor(i / 2) * 150;
      sdkBoard(ctx, x, y, 124, 9, kind === 'sol' ? givens(sols[i]) : givens(g), { shadow: 0 });
    });
    he(ctx, 'ugabuga.co.il/sudoku', 0, h / 2 - 16, { size: 17, w: 700, color: C.muted, dir: 'ltr', fam: 'Fredoka' });
  }
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const P = S.printT;
    popAt(ctx, t, P[0].t, W / 2, 560, (c) => {
      he(c, 'לוחות בדף', 400, -28, { size: 36, w: 900, align: 'right' });
      [1, 2, 4, 6].forEach((v, i) => chip(c, 290 - i * 125, 36, 105, 72, String(v), { on: v === 4 && t >= ev.chip, color: C.red, size: 40, seed: 110 + i, dir: 'ltr', fam: 'Fredoka' }));
    }, { dur: 0.3, over: 1.4 });
    UI.tap(ctx, 540 + 290 - 250, 596, t, ev.chip, { color: 'rgba(207,47,86,0.8)', size: 110 });
    popAt(ctx, t, P[0].t + 0.2, W / 2, 705, (c) => {
      const on = t >= ev.tick;
      G.rrect(c, 80, -38, 340, 76, 22, { fill: '#fff', lw: 3, seed: 120, stroke: C.line });
      G.rrect(c, 354, -22, 44, 44, 10, { fill: on ? C.green : '#fff', lw: 4, seed: 121, stroke: C.ink });
      if (on) checkMark(c, 376, 0, 20, clamp((t - ev.tick) / 0.3));
      he(c, 'להדפיס גם פתרונות', 336, 11, { size: 30, w: 800, align: 'right', maxW: 250 });
      const pr = t >= ev.printBtn ? 1 - 0.08 * pulse(t, ev.printBtn, 10) : 1;
      c.save(); c.translate(-250, 0); c.scale(pr, pr); pill(c, 0, 0, '🖨️ הדפסה / PDF', { size: 38, w: 900, bg: C.red, fg: '#fff', padX: 34, seed: 122, h: 76, maxW: 420 }); c.restore();
    }, { dur: 0.3, over: 1.4 });
    UI.tap(ctx, 540 + 376, 705, t, ev.tick, { color: 'rgba(35,135,77,0.8)', size: 100 });
    UI.tap(ctx, 290, 705, t, ev.printBtn, { color: 'rgba(20,22,45,0.7)', size: 110 });
    popAt(ctx, t, ev.printBtn + 0.1, 400, 1005, (c) => a4(c, 'sol', S.BOARDS.print, S.BOARDS.printSol), { rot: -0.07, dur: 0.35, over: 1.5 });
    popAt(ctx, t, ev.printBtn + 0.3, 690, 980, (c) => a4(c, 'q', S.BOARDS.print), { rot: 0.04, dur: 0.35, over: 1.5 });
    popAt(ctx, t, P[2].t, W / 2, 1380, (c) => {
      card(c, -440, -125, 880, 250, { fill: '#e8f4ff', r: 30, seed: 130, shadow: 10, lw: 4.5 });
      he(c, '🧮 פותר סודוקו', 405, -52, { size: 56, w: 900, align: 'right', color: C.blue, maxW: 810 });
      he(c, 'נתקעתם בלוח מעיתון? מקלידים אותו', 405, 8, { size: 38, w: 700, align: 'right', color: '#3b3e5c', maxW: 810 });
      he(c, 'ומקבלים פתרון', 405, 54, { size: 38, w: 700, align: 'right', color: '#3b3e5c', maxW: 810 });
      chip(c, 330, 96, 170, 52, '✅ פתרון', { on: true, color: C.green, size: 28, seed: 131 });
      chip(c, 140, 96, 190, 52, '💡 משבצת אחת', { size: 26, seed: 132 });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    popAt(ctx, t, P[3].t, W / 2, 1565, (c) => pill(c, 0, 0, 'הכול בחינם, בלי הרשמה', { size: 44, w: 900, bg: C.yellow, seed: 133, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 400); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 400, 320, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 670 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'סודוקו לילדים ולמבוגרים', W / 2, 745, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 825, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 925, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט: משחקים ← סודוקו 🔢', W / 2, 1018, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1152, (c) => { card(c, -450, -82, 900, 164, { fill: C.red, r: 40, seed: 192, shadow: 8, lw: 4.5 }); he(c, 'איזה מספר חסר', 0, -14, { size: 54, w: 900, color: '#fff', maxW: 840 }); he(c, 'במשבצת הכתומה? 🔍', 0, 52, { size: 54, w: 900, color: '#fff', maxW: 840 }); }, { rot: 0.015, dur: 0.35 });
    popAt(ctx, t, L[4].t + 0.35, W / 2, 1282, (c) => pill(c, 0, 0, 'כתבו מספר בתגובות 👇', { size: 46, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    const B = S.BOARDS.hook;
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1450, (c) => sdkBoard(c, 0, 0, 220, 4, givens(B.g), { bg: (i) => (i === B.target ? '#ffb347' : null) }), { rot: -0.02, dur: 0.3 });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 36, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotLevels },
    { t0: T(4), fn: shotKids },
    { t0: T(6), fn: shotPlay },
    { t0: T(8), fn: shotDaily },
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
