// THE FILM (9:16) — "איזה תמרור זה?": the road-signs game (/signs/game) in the site own look. Pure function of t.
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



  // ---- the certificate the way the site draws it: colored rays, a cream card, a star, title, name line, wording, date + signer ----
  const RAY_COLORS = ['#ff8fb1', '#ffd66b', '#8fd3ff', '#b9a2ff', '#9be7b4', '#ffb38a'];
  function star5(c, cx, cy, R, fill, edge) {
    const path = (dx, dy) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.46 : R; c.lineTo(cx + dx + Math.cos(a) * r, cy + dy + Math.sin(a) * r); } c.closePath(); };
    path(0, R * 0.07); c.fillStyle = edge; c.fill(); path(0, 0); c.fillStyle = fill; c.fill();
  }
  // o: {title, name, reason, date, signer, pn, pr, ps} (pn/pr/ps = 0..1 reveal of name / wording / date+signer)
  function cert(c, w, h, o) {
    const mn = Math.min(w, h) / 100;
    card(c, -w / 2, -h / 2, w, h, { fill: '#fff', r: 18, seed: o.seed || 5, shadow: 10, lw: 4.5 });
    c.save(); c.beginPath(); c.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 16); c.clip();
    for (let i = 0; i < 24; i++) {
      const a1 = (i * 15 - 90) * Math.PI / 180, a2 = ((i + 1) * 15 - 90) * Math.PI / 180, r = Math.max(w, h);
      c.fillStyle = RAY_COLORS[i % 6]; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a1) * r, Math.sin(a1) * r); c.lineTo(Math.cos(a2) * r, Math.sin(a2) * r); c.closePath(); c.fill();
    }
    c.restore();
    const cw = w * 0.78, ch = h * 0.84, top = -ch / 2;
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-cw / 2 - 6, top - 6, cw + 12, ch + 12, w * 0.045); c.fill();
    c.fillStyle = '#fffdf7'; c.beginPath(); c.roundRect(-cw / 2, top, cw, ch, w * 0.04); c.fill();
    c.save(); c.translate(cw / 2 - 4, top + 8); c.rotate(-0.21); star5(c, 0, 0, mn * 10.5, '#ffc531', '#e59a00'); c.restore();
    he(c, o.title, 4, top + ch * 0.2, { size: mn * 12, w: 900, color: '#ffd66b', maxW: cw - mn * 22 });
    he(c, o.title, 0, top + ch * 0.2 - 3, { size: mn * 12, w: 900, color: '#e8457a', maxW: cw - mn * 22 });
    he(c, 'התעודה מוענקת ל:', 0, top + ch * 0.34, { size: mn * 5.2, w: 700, color: '#2b2350' });
    const ny = top + ch * 0.52;
    c.fillStyle = '#2b2350'; c.fillRect(-cw * 0.3, ny + mn * 1.6, cw * 0.6, 3);
    if (o.pn > 0) he(c, o.name, 0, ny, { size: mn * 9.6, w: 900, color: '#2b2350', alpha: o.pn, maxW: cw * 0.58 });
    if (o.pr > 0) wrap(c, o.reason, mn * 5.3, cw * 0.84, 600, 2).forEach((ln, i, arr) => he(c, ln, 0, top + ch * 0.68 + i * mn * 6.6, { size: mn * 5.3, w: 600, color: '#2b2350', alpha: o.pr, maxW: cw * 0.86 }));
    const sy = top + ch - mn * 6.2;
    [[cw * 0.9 / 2 - cw * 0.16, 'תאריך', o.date, o.ps], [-cw * 0.9 / 2 + cw * 0.16, o.signer, '', 1]].forEach(([x, lab, val, p]) => {
      c.fillStyle = '#5b5678'; c.fillRect(x - cw * 0.15, sy - mn * 4.2, cw * 0.3, 2.5);
      he(c, lab, x, sy, { size: mn * 3.8, w: 600, color: '#5b5678', maxW: cw * 0.3 });
      if (val && p > 0) he(c, val, x, sy - mn * 5.2, { size: mn * 4.6, w: 800, color: '#2b2350', alpha: p, maxW: cw * 0.3 });
    });
  }

  // ---- the sign image (the site's own CC0 SVGs) ----
  const SIGN_IMG = {};
  function sign(c, n, cx, cy, d) { const im = SIGN_IMG[n]; if (im) c.drawImage(im, cx - d / 2, cy - d / 2, d, d); }
  // a numbered answer row (the game's answer button)
  function answerRow(c, x, y, w, h, s, { state = '', size = 46, seed = 1, num = 0 } = {}) {
    const fill = state === 'right' ? '#bbf7d0' : state === 'wrong' ? '#fee2e2' : '#fff';
    card(c, x - w / 2, y - h / 2, w, h, { fill, r: 28, seed, shadow: 8, lw: state === 'right' ? 6 : 4.5, stroke: state === 'right' ? C.green : C.ink });
    const pad = num ? 150 : 40;
    const lines = wrap(c, s, size, w - pad - 40, 800, 2);
    lines.forEach((ln, i) => he(c, ln, x + w / 2 - 36 - (num ? 76 : 0), y + size * 0.36 - (lines.length - 1) * size * 0.52 + i * size * 1.05, { size, w: 800, align: 'right', color: C.ink, maxW: w - pad - 20 }));
    if (num) { c.fillStyle = C.red; c.beginPath(); c.arc(x + w / 2 - 54, y, 34, 0, Math.PI * 2); c.fill(); he(c, String(num), x + w / 2 - 54, y + 15, { size: 44, w: 900, color: '#fff', dir: 'ltr' }); }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 285, (c) => pill(c, 0, 0, '🚦 משחק התמרורים', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 440, (c) => he(c, 'איזה תמרור זה? 🤔', 0, 0, { size: 112, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 760, (c) => {
      card(c, -210, -210, 420, 420, { fill: '#fff', r: 40, seed: 14, shadow: 12, lw: 4.5 });
      sign(c, S.HOOK_SIGN, 0, 0, 365);
    }, { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      popAt(ctx, t, o.t, W / 2, 1100 + o.i * 155, (c) => answerRow(c, 0, 0, 900, 136, S.HOOK_NAMES[o.i], { size: 48, seed: 20 + o.i, num: o.i + 1 }), { rot: [-0.01, 0.008, -0.008][o.i], dur: 0.25, over: 1.6 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(655, 1565); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'כתבו מספר בתגובות 👇', { size: 54, w: 900, bg: C.yellow, padX: 36 });
      ctx.restore();
    }
    mascot(ctx, 185, 1570 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 250, t, ev.q2);
  }

  // ================= 1. CHOOSE THE FAMILY =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD;
    S.CATS.forEach((lb, i) => {
      const on = i === S.AUD_PICK && t >= ev.pick;
      popAt(ctx, t, A[i].t, W / 2, 580 + i * 128, (c) => { const pr = on ? 1 + 0.04 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 800, 106, lb, { on, color: C.blue, size: 46, seed: 30 + i }); }, { dur: 0.25, over: 1.6, rot: [0.008, -0.008, 0.006, -0.006, 0.008][i] });
    });
    UI.tap(ctx, W / 2 + 120, 580 + S.AUD_PICK * 128 + 10, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, A[5].t, W / 2, 1295, (c) => {
      card(c, -420, -130, 840, 260, { fill: '#fff', r: 26, seed: 33, shadow: 9, lw: 4.5 });
      he(c, S.CATS[S.CAT_PICK], 390, -62, { size: 52, w: 900, align: 'right', color: C.blue });
      wrap(c, S.CAT_HINT, 42, 780, 600, 3).forEach((ln, i) => he(c, ln, 390, 14 + i * 58, { size: 42, w: 600, align: 'right', color: C.ink, maxW: 790 }));
    }, { dur: 0.25, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[0], W / 2, 1490, (c) => pill(c, 0, 0, '⁦76⁩ תמרורים עם איור והסבר', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1590, (c) => pill(c, 0, 0, 'צורה, צבע וסמל — לא רק צבע 🔎', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. THE GAME: IDENTIFY THE SIGN =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const T0 = S.TOPICS, names = ['פסי האטה', 'עצור! תן זכות קדימה', 'תן זכות קדימה'];
    const tapP = clamp((t - ev.topic) / 0.2), fbP = clamp((t - ev.reasonCard) / 0.3);
    popAt(ctx, t, T0[0].t - 0.2, W / 2, 805, (c) => {
      card(c, -440, -300, 880, 600, { fill: '#fff', r: 34, seed: 40, shadow: 11, lw: 4.5 });
      he(c, 'שאלה ⁦1⁩ מתוך ⁦10⁩', 410, -250, { size: 32, w: 800, align: 'right', color: C.muted });
      G.rrect(c, -410, -226, 820, 16, 8, { fill: '#fff', lw: 2.5, seed: 41, stroke: C.ink });
      sign(c, '302', 0, -80, 250);
      he(c, 'איזה תמרור מופיע בתמונה?', 0, 120, { size: 58, w: 900, maxW: 820 });
    }, { dur: 0.3, over: 1.35, rot: -0.008 });
    names.forEach((nm, i) => {
      const right = i === S.TOPIC_PICK;
      popAt(ctx, t, T0[i].t, W / 2, 1230 + i * 118, (c) => { const sc = right && tapP > 0 ? 1 + 0.05 * Math.sin(Math.PI * tapP) : 1; c.scale(sc, sc); answerRow(c, 0, 0, 860, 100, nm, { size: 42, seed: 44 + i, state: right && tapP > 0 ? 'right' : '' }); }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008, 0.006][i] });
    });
    UI.tap(ctx, W / 2 + 150, 1230 + S.TOPIC_PICK * 118, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    if (fbP > 0) {
      ctx.save(); ctx.globalAlpha = clamp(fbP * 2); ctx.translate(0, (1 - ease.outCubic(fbP)) * 30);
      card(ctx, 70, 1560, 940, 190, { fill: '#fff4bb', r: 28, seed: 48, shadow: 8, lw: 4.5 });
      he(ctx, 'נכון! עצור! תן זכות קדימה', 990, 1625, { size: 46, w: 900, align: 'right', color: C.green, maxW: 900 });
      wrap(ctx, 'חייבים לעצור ולתת זכות קדימה לתנועה בדרך החוצה, לרבות מסילה.', 36, 880, 500, 2).forEach((ln, i) => he(ctx, ln, 990, 1682 + i * 46, { size: 36, w: 500, align: 'right', maxW: 900 }));
      ctx.restore();
    }
    confetti(ctx, t, ev.reasonCard, W / 2, 1300, { n: 40, seed: 5, spread: 700 });
  }

  // ================= 3. UNDERSTAND A SIGN =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, tapP = clamp((t - ev.mode) / 0.25);
    popAt(ctx, t, M0[0].t, W / 2, 690, (c) => {
      const sc = tapP > 0 ? 1 + 0.03 * Math.sin(Math.PI * tapP) : 1; c.scale(sc, sc);
      card(c, -440, -175, 880, 350, { fill: '#fff', r: 32, seed: 80, shadow: 10, lw: 4.5 });
      sign(c, '144', -285, 0, 230);
      he(c, 'תמרור ⁦144⁩', 405, -95, { size: 34, w: 700, align: 'right', color: C.muted });
      he(c, 'פסי האטה', 405, -25, { size: 66, w: 900, align: 'right', maxW: 560 });
      he(c, 'מה התמרור אומר?', 405, 45, { size: 32, w: 800, align: 'right', color: C.purple });
      wrap(c, 'בהמשך הדרך נמצאים פסי האטה.', 38, 560, 600, 2).forEach((ln, i) => he(c, ln, 405, 100 + i * 46, { size: 38, w: 600, align: 'right', maxW: 560 }));
    }, { dur: 0.3, over: 1.4, rot: -0.008 });
    UI.tap(ctx, W / 2 - 280, 700, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, M0[1].t, W / 2, 950, (c) => {
      card(c, -440, -80, 880, 160, { fill: '#fffdf7', r: 28, seed: 82, shadow: 9, lw: 4.5 });
      he(c, 'איפה פוגשים אותו?', 405, -22, { size: 36, w: 800, align: 'right', color: C.purple });
      he(c, 'לפני פסי האטה המותקנים בכביש.', 405, 44, { size: 44, w: 700, align: 'right', maxW: 810 });
    }, { dur: 0.28, over: 1.4, rot: 0.006 });
    const ROLES = [['נהגים', 'הפחיתו מהירות לפני הפס ועברו עליו באופן מבוקר.', C.blue], ['רוכבי אופניים', 'האטו לפני העלייה על הפס ושמרו על יציבות.', C.green], ['הולכי רגל', 'אל תבלבלו בין פס האטה למעבר חצייה מסומן.', C.red]];
    ROLES.forEach(([who, txt, col], i) => {
      popAt(ctx, t, M0[2 + i].t, W / 2, 1140 + i * 160, (c) => {
        card(c, -440, -64, 880, 128, { fill: '#fff', r: 26, seed: 84 + i, shadow: 8, lw: 4.5 });
        c.fillStyle = col; c.beginPath(); c.roundRect(190, -64, 250, 128, [0, 26, 26, 0]); c.fill();
        he(c, who, 315, 12, { size: 34, w: 900, color: '#fff', maxW: 226 });
        wrap(c, txt, 34, 580, 600, 2).forEach((ln, k, arr) => he(c, ln, 175, 10 - (arr.length - 1) * 22 + k * 44, { size: 34, w: 600, align: 'right', maxW: 580 }));
      }, { dur: 0.25, over: 1.4, rot: [0.006, -0.006, 0.006][i] });
    });
    popAt(ctx, t, S.pills[2] - 0.9, W / 2, 1590, (c) => pill(c, 0, 0, 'הסבר נפרד לנהג, לרוכב ולהולך הרגל', { size: 42, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. AGE TEST =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const tapP = clamp((t - ev.go) / 0.2), introP = clamp((t - ev.ans) / 0.35);
    S.AGES.forEach((lb, i) => {
      const on = i === S.AGE_PICK && tapP > 0;
      const x = W / 2 + 255 - (i % 2) * 510, y = 600 + Math.floor(i / 2) * 135;
      popAt(ctx, t, S.ROWS[i].t, x, y, (c) => { const pr = on ? 1 + 0.05 * pulse(t, ev.go, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 490, 108, lb, { on, color: C.orange, size: 44, seed: 90 + i }); }, { dur: 0.22, over: 1.5, rot: [0.01, -0.01, -0.008, 0.008][i] });
    });
    UI.tap(ctx, W / 2 + 255 + 80, 610, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 120 });
    if (introP > 0) {
      ctx.save(); ctx.globalAlpha = clamp(introP * 2); ctx.translate(W / 2, 1060 + (1 - ease.outCubic(introP)) * 30);
      card(ctx, -440, -170, 880, 340, { fill: '#fff9d9', r: 32, seed: 96, shadow: 10, lw: 4.5 });
      wrap(ctx, S.AGE_INTRO, 46, 800, 700, 3).forEach((ln, i) => he(ctx, ln, 400, -90 + i * 66, { size: 46, w: 700, align: 'right', maxW: 810 }));
      pill(ctx, 0, 100, 'מתחילים — ⁦8⁩ שאלות', { size: 44, w: 900, bg: C.blue, fg: '#fff', padX: 56, seed: 97 });
      ctx.restore();
      confetti(ctx, t, ev.ans, W / 2, 900, { n: 40, seed: 6, spread: 700 });
    }
    popAt(ctx, t, S.pills[4], W / 2, 1400, (c) => pill(c, 0, 0, 'בסוף: ציון והסבר לכל תשובה ✅', { size: 42, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1520, (c) => pill(c, 0, 0, 'תרגול לימודי, לא מבחן התיאוריה הרשמי', { size: 40, w: 900, bg: C.yellow, seed: 88, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. FLASHCARDS =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    popAt(ctx, t, I[0].t, W / 2, 940, (c) => {
      card(c, -440, -420, 880, 840, { fill: '#fff', r: 14, seed: 100, shadow: 11, lw: 4.5 });
      he(c, 'כרטיסיות תמרורים — קבוצה ⁦1⁩', 0, -365, { size: 40, w: 900, maxW: 800 });
      he(c, 'גוזרים מסביב לכל זוג, מקפלים בקו האמצעי ומדביקים גב אל גב.', 0, -318, { size: 25, w: 500, color: C.muted, maxW: 820 });
    }, { dur: 0.32, over: 1.3, rot: -0.01 });
    S.FLASH.forEach((n, i) => {
      const grp = i < 2 ? 1 : i < 4 ? 2 : 3, row = Math.floor(i / 2), col = i % 2;
      popAt(ctx, t, I[grp].t + (col ? 0.12 : 0), W / 2 + (col ? -205 : 205), 745 + row * 222, (c) => {
        const w = 390, h = 205;
        c.fillStyle = '#fff'; c.fillRect(-w / 2, -h / 2, w, h);
        c.save(); c.strokeStyle = '#777'; c.setLineDash([8, 6]); c.lineWidth = 2; c.strokeRect(-w / 2, -h / 2, w, h); c.beginPath(); c.moveTo(0, -h / 2); c.lineTo(0, h / 2); c.stroke(); c.restore();
        sign(c, n, w / 4, -8, 150);
        he(c, n, w / 4, 88, { size: 26, w: 600, color: C.muted, dir: 'ltr' });
        wrap(c, S.FLASH_NAMES[i], 28, w / 2 - 22, 800, 3).forEach((ln, k, arr) => he(c, ln, -w / 4, -(arr.length - 1) * 17 + k * 36 + 2, { size: 28, w: 800, maxW: w / 2 - 20 }));
      }, { dur: 0.25, over: 1.5, rot: [0.01, -0.01][col] * 0.8 });
    });
    popAt(ctx, t, ev.printBtn, W / 2, 1462, (c) => pill(c, 0, 0, '🖨️ כרטיסיות — הדפסה או PDF', { size: 52, w: 900, bg: C.green, fg: '#fff', padX: 50, seed: 112, maxW: SAFE.w }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.printBtn, W / 2, 1430, { n: 60, seed: 8, spread: 900 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1557, (c) => pill(c, 0, 0, '⁦6⁩ תמרורים בכל דף', { size: 40, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1635, (c) => pill(c, 0, 0, 'מתאים גם למדפסת ביתית פשוטה', { size: 38, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // the hook sign again, small, with the three numbers
  function endOpts(ctx, t, t0) {
    popAt(ctx, t, t0, 760, 1390, (c) => { card(c, -120, -120, 240, 240, { fill: '#fff', r: 30, seed: 150, shadow: 9, lw: 4 }); sign(c, S.HOOK_SIGN, 0, 0, 205); }, { dur: 0.25, over: 1.5 });
    [0, 1, 2].forEach((i) => {
      popAt(ctx, t, t0 + 0.08 + i * 0.08, 480 - i * 170, 1390, (c) => {
        card(c, -70, -70, 140, 140, { fill: '#fff', r: 70, seed: 160 + i, shadow: 7, lw: 4 });
        he(c, String(i + 1), 0, 28, { size: 90, w: 900, color: C.red, dir: 'ltr' });
      }, { dur: 0.22, over: 1.5 });
    });
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
    he(ctx, 'משחק התמרורים', W / 2, 800, { size: 56, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 885, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 990, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: תמרורים 🔎', W / 2, 1090, { size: 40, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1185, (c) => pill(c, 0, 0, '✍️ איזה תמרור זה?', { size: 54, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1580, (c) => pill(c, 0, 0, 'כתבו מספר בתגובות 👇', { size: 46, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
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
      for (const n of ['136', '144', '302']) SIGN_IMG[n] = await L('img/signs/' + n + '.svg');
      for (const n of S.FLASH) SIGN_IMG[n] = await L('img/signs/' + n + '.svg');
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
