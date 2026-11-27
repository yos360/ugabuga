// THE FILM (9:16) — "כמה נרות מדליקים בכל ערבי חנוכה?": Hanukkah maths (/holidays/hanukkah/math) in the site own look. Pure function of t.
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



  // ---- drawing helpers for this reel ----
  const CANDLE_COLS = ['#226bd7', '#cf2f56', '#23874d', '#e08a00', '#8a4fd8', '#00a6c8', '#cf2f56', '#226bd7'];
  // the staircase of the 8 nights: night k has k candles (no shamash); the total is never written
  function nights(ctx, t, t0, cx, base, k = 1) {
    for (let n = 0; n < 8; n++) {
      const p = UI.pop(t, t0 + n * 0.1, 0.25, 1.8); if (p <= 0) continue;
      const x = cx + (3.5 - n) * 108 * k;
      ctx.save(); ctx.translate(x, base); ctx.scale(p, p);
      for (let j = 0; j <= n; j++) {
        const y = -(j + 1) * 36 * k, w = 24 * k, h = 30 * k;
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 2, y + 3, w, h, 5 * k); ctx.fill();
        ctx.fillStyle = CANDLE_COLS[j]; ctx.strokeStyle = C.ink; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.roundRect(-w / 2, y, w, h, 5 * k); ctx.fill(); ctx.stroke();
        if (j === n) { ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.ellipse(0, y - 9 * k, 6 * k, 10 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff4bb'; ctx.beginPath(); ctx.ellipse(0, y - 6 * k, 3 * k, 5 * k, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 26 * k, 17 * k, 0, Math.PI * 2); ctx.fill();
      he(ctx, String(n + 1), 0, 26 * k + 11 * k, { size: 30 * k, w: 900, color: '#fff', dir: 'ltr' });
      ctx.restore();
    }
  }
  // the dreidel of the page (DreidelFace svg 100x120)
  function dreidel(c, letter, sc = 1, sx = 1) {
    c.save(); c.scale(sc * sx, sc); c.translate(-50, -60);
    c.fillStyle = '#b7791f'; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.roundRect(44, 4, 12, 22, 4); c.fill(); c.stroke();
    c.fillStyle = '#60a5fa'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath(); c.moveTo(18, 26); c.lineTo(82, 26); c.lineTo(82, 74); c.lineTo(50, 114); c.lineTo(18, 74); c.closePath(); c.fill(); c.stroke();
    if (letter && sx > 0.6) he(c, letter, 50, 66, { size: 40, w: 800, color: '#fff', dir: 'ltr' });
    c.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    for (let i = 0; i < 14; i++) { const x = 90 + U.hash(i * 3 + 1) * 900, y = 120 + U.hash(i * 3 + 2) * 1500, a = 0.25 + 0.25 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,191,63,${a + 0.1})`; ctx.beginPath(); ctx.arc(x, y, 4 + U.hash(i) * 5, 0, Math.PI * 2); ctx.fill(); }
    popAt(ctx, t, 0.05, W / 2, 250, (c) => pill(c, 0, 0, '🕎 חנוכה מתקרב', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 400, (c) => he(c, 'כמה נרות מדליקים', 0, 0, { size: 100, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 535, (c) => he(c, 'בכל ערבי חנוכה?', 0, 0, { size: 104, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q1 + BEAT * 2, W / 2, 640, (c) => pill(c, 0, 0, 'בלי השמש 🕯️', { size: 46, w: 900, bg: C.yellow, padX: 44, seed: 14 }), { rot: -0.02, dur: 0.3 });
    nights(ctx, t, S.hookOpts[0].t, W / 2, 955, 0.9);
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1075); ctx.rotate(-0.02); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'כמה נרות? כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 40, maxW: SAFE.w });
      ctx.restore();
    }
    mascot(ctx, W / 2, 1365 - (t > ev.q2 + 0.45 ? hop(t, 10) : 0), 430, t, ev.q2);
  }

  // ================= 1. PICK A GRADE =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD, picked = t >= ev.pick, cols = [C.green, C.orange, C.blue, C.red, C.purple, '#00a6c8'];
    S.GRADES.forEach(([g, topic], i) => {
      const on = i === S.PICK_GRADE && picked, x = i % 2 === 0 ? 765 : 315, y = 610 + Math.floor(i / 2) * 205;
      popAt(ctx, t, A[i].t, x, y, (c) => {
        const pr = on ? 1 + 0.04 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr);
        card(c, -215, -88, 430, 176, { fill: on ? '#eef4ff' : '#fff', r: 28, seed: 30 + i, shadow: 8, lw: on ? 5.5 : 4.5 });
        he(c, g, 190, -18, { size: 54, w: 900, align: 'right', color: cols[i], maxW: 380 });
        wrap(c, topic, 33, 385, 700, 2).forEach((ln, k) => he(c, ln, 190, 34 + k * 40, { size: 33, w: 700, align: 'right', color: '#3b3e5c', maxW: 385 }));
      }, { dur: 0.25, over: 1.5, rot: [0.01, -0.01][i % 2] });
    });
    UI.tap(ctx, 765, 840, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, A[6].t, W / 2, 1290, (c) => {
      card(c, -440, -100, 880, 200, { fill: C.yellow, r: 28, seed: 37, shadow: 9, lw: 4.5 });
      he(c, 'לכל כיתה ⁦6⁩ בעיות מילוליות', 400, -18, { size: 54, w: 900, align: 'right', maxW: 810 });
      he(c, 'לפי מה שלומדים בה', 400, 54, { size: 54, w: 900, align: 'right', color: C.red, maxW: 810 });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    popAt(ctx, t, S.pills[0], W / 2, 1470, (c) => pill(c, 0, 0, 'נרות, סופגניות ודמי חנוכה', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 2. SOLVE ON SCREEN =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const P = S.PROBLEM, T0 = S.TOPICS, checked = t >= ev.topic;
    popAt(ctx, t, T0[0].t, W / 2, 650, (c) => {
      card(c, -440, -125, 880, 250, { fill: '#fff', r: 28, seed: 40, shadow: 9, lw: 4.5 });
      he(c, '⁦' + P.n + '⁩.', 405, -48, { size: 54, w: 900, align: 'right', color: C.blue, maxW: 800 });
      wrap(c, P.q, 54, 790, 700, 2).forEach((ln, i) => he(c, ln, 405, 20 + i * 66, { size: 54, w: 700, align: 'right', maxW: 810 }));
    }, { dur: 0.3, over: 1.4, rot: -0.008 });
    popAt(ctx, t, T0[1].t, W / 2, 880, (c) => {
      he(c, 'תשובה:', 420, 16, { size: 50, w: 900, align: 'right' });
      G.rrect(c, 40, -50, 210, 100, 22, { fill: '#fff', lw: 4, seed: 44, stroke: C.ink });
      const typed = t >= T0[2].t ? (t >= T0[2].t + 0.18 ? '42' : '4') : '';
      he(c, typed, 145, 24, { size: 66, w: 800, dir: 'ltr' });
      he(c, P.unit, 10, 16, { size: 46, w: 800, align: 'right', color: C.muted });
      const pr = checked ? 1 - 0.08 * pulse(t, ev.topic, 10) : 1;
      c.save(); c.translate(-320, 0); c.scale(pr, pr); pill(c, 0, 0, 'בדיקה', { size: 46, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 45 }); c.restore();
    }, { dur: 0.25, over: 1.4, rot: 0.004 });
    UI.tap(ctx, 120, 905, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, ev.topic + 0.15, W / 2, 1040, (c) => { card(c, -440, -55, 880, 110, { fill: '#e5f7ec', r: 28, seed: 46, shadow: 8, lw: 4.5 }); he(c, '✅ נכון מאוד!', 400, 20, { size: 58, w: 900, align: 'right', color: C.green, maxW: 810 }); }, { dur: 0.3, over: 1.5, rot: 0.006 });
    popAt(ctx, t, T0[3].t - 0.2, W / 2, 1175, (c) => { chip(c, 0, 0, 440, 96, 'איך פותרים?', { on: false, size: 44, seed: 47 }); }, { dur: 0.25, over: 1.5, rot: -0.008 });
    UI.tap(ctx, W / 2, 1190, t, ev.reasonCard - 0.2, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, ev.reasonCard, W / 2, 1345, (c) => {
      card(c, -440, -70, 880, 140, { fill: '#eef4ff', r: 28, seed: 48, shadow: 9, lw: 4.5 });
      he(c, P.sol, 405, -6, { size: 50, w: 700, align: 'right', maxW: 820 });
      he(c, 'התשובה: ⁦42⁩ שקלים', 405, 52, { size: 46, w: 900, align: 'right', color: C.blue, maxW: 820 });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    mascot(ctx, W / 2, 1535, 170, t, ev.reasonCard + 0.35);
  }

  // ================= 3. THE DREIDEL GAME =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, R = S.ROUND, cols = [C.blue, C.red, C.purple];
    popAt(ctx, t, M0[0].t, W / 2, 595, (c) => {
      S.MODES_L.forEach(([lb, gr], i) => {
        const on = i === 1, x = 297 - i * 297;
        G.rrect(c, x - 140, -62, 280, 124, 28, { fill: on ? '#f4edff' : '#fff', lw: on ? 5 : 3.5, seed: 50 + i, stroke: on ? C.ink : C.line });
        he(c, lb, x, -6, { size: 42, w: 900, color: cols[i], maxW: 250 });
        he(c, 'כיתות ' + gr, x, 40, { size: 32, w: 700, color: C.muted, maxW: 250 });
      });
    }, { dur: 0.28, over: 1.4, rot: -0.006 });
    const press = t >= ev.mode ? 1 - 0.08 * pulse(t, ev.mode, 10) : 1;
    popAt(ctx, t, M0[1].t, W / 2, 750, (c) => { c.scale(press, press); pill(c, 0, 0, 'סובבו את הסביבון', { size: 52, w: 900, bg: C.orange, fg: '#fff', padX: 70, seed: 54 }); }, { dur: 0.3, over: 1.6, rot: 0.01 });
    UI.tap(ctx, W / 2 + 40, 765, t, ev.mode, { color: 'rgba(224,138,0,0.8)', size: 120 });
    if (t >= ev.mode + 0.1) {
      const spinning = t < M0[2].t, sx = spinning ? Math.abs(Math.cos((t - ev.mode) * 34)) : 1;
      const land = t >= M0[2].t ? 1 + 0.06 * pulse(t, M0[2].t, 9) : 1;
      ctx.save(); ctx.translate(W / 2, 935); ctx.rotate(spinning ? Math.sin((t - ev.mode) * 12) * 0.08 : -0.02); ctx.globalAlpha = clamp((t - ev.mode - 0.1) / 0.1);
      ctx.fillStyle = 'rgba(20,22,45,0.14)'; ctx.beginPath(); ctx.ellipse(0, 126, 70 * sx, 14, 0, 0, Math.PI * 2); ctx.fill();
      dreidel(ctx, spinning ? '' : R.letter, 1.8 * land, Math.max(sx, 0.08));
      ctx.restore();
    }
    popAt(ctx, t, M0[3].t, W / 2, 1215, (c) => {
      card(c, -440, -105, 880, 210, { fill: '#fff', r: 28, seed: 56, shadow: 9, lw: 4.5 });
      he(c, R.q1, 405, -34, { size: 48, w: 800, align: 'right', maxW: 820 });
      he(c, R.q2, 405, 24, { size: 48, w: 800, align: 'right', maxW: 820 });
      he(c, R.eq, 405, 82, { size: 56, w: 900, align: 'right', color: C.purple, maxW: 820 });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    popAt(ctx, t, S.explainT, W / 2, 1400, (c) => {
      card(c, -440, -50, 880, 100, { fill: '#e5f7ec', r: 28, seed: 66, shadow: 8, lw: 4.5 });
      he(c, '✅ נכון! ⁦3 × 5 = 15⁩', 400, 18, { size: 58, w: 900, align: 'right', color: C.green, maxW: 810 });
    }, { dur: 0.3, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[2], W / 2, 1530, (c) => pill(c, 0, 0, 'ערכי האותיות במשחק הכפל: נ=⁦2⁩ ג=⁦3⁩ ש=⁦4⁩ ה=⁦5⁩', { size: 40, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w, padX: 30 }), { rot: -0.02 });
  }

  // ================= 4. PRINT =================
  function page(c, i) {
    card(c, -150, -212, 300, 424, { fill: '#fff', r: 12, seed: 90 + i, shadow: 9, lw: 4 });
    he(c, i ? 'פתרונות — חשבון של חנוכה' : 'חשבון של חנוכה', 0, -170, { size: 24, w: 900, color: '#1e3a8a', maxW: 260 });
    he(c, 'כיתה ג׳ · כפל, חילוק ובעיות בשני שלבים', 0, -148, { size: 12, w: 700, color: '#b7791f', maxW: 270 });
    if (!i) he(c, 'שם: ____________________', 135, -122, { size: 12, w: 600, align: 'right', color: '#555' });
    for (let k = 0; k < 6; k++) {
      const y = -98 + k * 52;
      c.fillStyle = i ? '#9db6e8' : '#bbb';
      c.fillRect(-120, y, 240, 4); c.fillRect(-120, y + 12, 190, 4);
      c.fillStyle = i ? '#1e3a8a' : '#ddd'; c.fillRect(-120, y + 26, i ? 120 : 200, i ? 4 : 2);
      if (i) c.fillRect(-120, y + 36, 90, 3);
    }
    c.strokeStyle = '#1e3a8a'; c.lineWidth = 2.5; c.strokeRect(-140, -202, 280, 404);
  }
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, T(8, 0.05), W / 2, 570, (c) => { c.scale(press, press); pill(c, 0, 0, '🖨️ הדפסת דף העבודה ודף הפתרונות', { size: 42, w: 900, bg: C.blue, fg: '#fff', padX: 44, seed: 83, maxW: SAFE.w }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 585, t, ev.go, { color: 'rgba(34,107,215,0.8)', size: 120 });
    S.ROWS.slice(0, 2).forEach((r) => {
      popAt(ctx, t, r.t, 735 - r.i * 400, 945, (c) => { c.scale(1.18, 1.18); page(c, r.i); }, { dur: 0.3, over: 1.5, rot: [-0.03, 0.025][r.i] });
    });
    popAt(ctx, t, S.ROWS[2].t, W / 2, 1290, (c) => { chip(c, 205, 0, 390, 90, 'דף עבודה: מקום לתשובה', { on: true, color: C.orange, size: 32, seed: 86 }); chip(c, -205, 0, 390, 90, 'דף פתרונות נפרד', { on: false, size: 32, seed: 87 }); }, { dur: 0.25, over: 1.5, rot: 0.008 });
    popAt(ctx, t, ev.ans, W / 2, 1405, (c) => pill(c, 0, 0, 'מוכן להדפסה! 🖨️', { size: 58, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1360, { n: 50, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[3], W / 2, 1535, (c) => pill(c, 0, 0, '⁦2⁩ דפי ⁦A4⁩', { size: 42, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. EASY TO HARD =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    S.HARD.forEach(([g, col, q], i) => {
      popAt(ctx, t, I[i].t, W / 2, 600 + i * 240, (c) => {
        card(c, -440, -108, 880, 216, { fill: '#fff', r: 26, seed: 100 + i, shadow: 8, lw: 4.5 });
        pill(c, 345, -66, g, { size: 34, w: 900, bg: col, fg: '#fff', seed: 104 + i, padX: 26, shadow: 4 });
        wrap(c, q, 38, 800, 700, 3).forEach((ln, k) => he(c, ln, 410, 4 + k * 46, { size: 38, w: 700, align: 'right', color: '#2a2d4a', maxW: 820 }));
      }, { dur: 0.28, over: 1.4, rot: [0.006, -0.006][i % 2] });
    });
    popAt(ctx, t, I[3].t, W / 2, 1285, (c) => {
      card(c, -440, -50, 880, 100, { fill: '#e5f7ec', r: 28, seed: 110, shadow: 8, lw: 4.5 });
      he(c, '🔒 בלי הרשמה, בלי פרטים על הילדים', 405, 14, { size: 44, w: 900, align: 'right', color: C.green, maxW: 830 });
    }, { dur: 0.3, over: 1.3, rot: 0.006 });
    popAt(ctx, t, I[4].t, W / 2, 1420, (c) => {
      card(c, -440, -66, 880, 132, { fill: C.yellow, r: 28, seed: 112, shadow: 8, lw: 4.5 });
      he(c, '👨‍👩‍👧 להורה ולמורה', 405, -10, { size: 50, w: 900, align: 'right', maxW: 820 });
      he(c, 'דף פתרונות עם דרך הפתרון של כל בעיה', 405, 42, { size: 36, w: 700, align: 'right', color: '#3b3e5c', maxW: 820 });
    }, { dur: 0.3, over: 1.3, rot: -0.006 });
    popAt(ctx, t, ev.printBtn, W / 2, 1550, (c) => pill(c, 0, 0, 'חינם, על המסך ולהדפסה', { size: 44, w: 900, bg: C.green, fg: '#fff', padX: 44, seed: 113, maxW: SAFE.w }), { rot: -0.03, dur: 0.35 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 440); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 420, 340, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 700 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'חשבון של חנוכה לכיתות א׳–ו׳', W / 2, 785, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 880, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1000, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[4].t, W / 2, 1215, (c) => { card(c, -450, -115, 900, 230, { fill: C.red, r: 40, seed: 192, shadow: 8, lw: 4.5 }); he(c, 'כמה נרות מדליקים', 0, -42, { size: 58, w: 900, color: '#fff', maxW: 840 }); he(c, 'בכל ערבי חנוכה?', 0, 28, { size: 58, w: 900, color: '#fff', maxW: 840 }); he(c, '(בלי השמש)', 0, 86, { size: 40, w: 700, color: '#ffe3ea', maxW: 840 }); }, { rot: 0.015, dur: 0.35 });
    popAt(ctx, t, L[4].t + 0.35, W / 2, 1410, (c) => pill(c, 0, 0, 'כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 44, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 36, seed: 9, spread: 1000 });
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
