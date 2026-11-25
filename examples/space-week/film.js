// THE FILM (9:16) — "כמה זמן לוקח לאור השמש להגיע אלינו?": the Space Week kit (/classroom/space-week) in the site own look. Pure function of t.
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


  // ---- small space doodles in the site's ink-outlined style ----
  function sun(c, x, y, r, t) {
    c.save(); c.translate(x, y);
    c.strokeStyle = C.orange; c.lineWidth = 7; c.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + t * 0.4; c.beginPath(); c.moveTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2); c.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6); c.stroke(); }
    c.fillStyle = '#ffc531'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
    c.restore();
  }
  function earth(c, x, y, r) {
    c.save(); c.translate(x, y);
    c.fillStyle = '#5ab0ff'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.green; c.beginPath(); c.ellipse(-r * 0.25, -r * 0.2, r * 0.38, r * 0.28, 0.5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(r * 0.3, r * 0.35, r * 0.28, r * 0.2, -0.4, 0, Math.PI * 2); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 4.5; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
    c.restore();
  }
  function rocket(c, x, y, s, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.fillStyle = C.red; c.beginPath(); c.moveTo(-30, 20); c.lineTo(-58, 62); c.lineTo(-24, 50); c.closePath(); c.fill(); c.beginPath(); c.moveTo(30, 20); c.lineTo(58, 62); c.lineTo(24, 50); c.closePath(); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, -80); c.bezierCurveTo(46, -40, 40, 30, 28, 60); c.lineTo(-28, 60); c.bezierCurveTo(-40, 30, -46, -40, 0, -80); c.closePath(); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 5; c.stroke();
    c.fillStyle = C.blue; c.beginPath(); c.arc(0, -16, 17, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#ffc531'; c.beginPath(); c.moveTo(-14, 64); c.lineTo(0, 108); c.lineTo(14, 64); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
  const PCOL = ['#b8a89a', '#e8b46a', '#5ab0ff', '#e0623c', '#e6b078', '#e8d08a', '#8fd8e6', '#4a6fe0'];

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    // a few twinkling stars on the gradient
    for (let i = 0; i < 14; i++) { const x = 90 + U.hash(i * 3 + 1) * 900, y = 120 + U.hash(i * 3 + 2) * 1500, a = 0.25 + 0.25 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(138,79,216,${a})`; ctx.beginPath(); ctx.arc(x, y, 4 + U.hash(i) * 5, 0, Math.PI * 2); ctx.fill(); }
    popAt(ctx, t, 0.05, W / 2, 290, (c) => pill(c, 0, 0, '🚀 שבוע החלל', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 465, (c) => he(c, 'כמה זמן לוקח לאור השמש', 0, 0, { size: 86, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 610, (c) => he(c, 'להגיע אלינו? ☀️', 0, 0, { size: 128, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    const cols = [C.blue, C.red, C.green];
    S.hookOpts.forEach((o) => {
      popAt(ctx, t, o.t, W / 2, 830 + o.i * 190, (c) => {
        card(c, -440, -78, 880, 156, { seed: 20 + o.i, shadow: 8, r: 28, lw: 4.5 });
        c.fillStyle = cols[o.i]; c.beginPath(); c.arc(360, 0, 52, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
        he(c, String(o.i + 1), 360, 19, { size: 60, w: 900, color: '#fff', dir: 'ltr' });
        he(c, S.HOOK_OPTS[o.i], 300, 22, { size: 64, w: 900, color: C.ink, align: 'right', maxW: 640 });
      }, { rot: [-0.012, 0.012, -0.01][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1380); ctx.rotate(-0.02); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '⁦1, 2⁩ או ⁦3⁩? כתבו בתגובות 👇', { size: 52, w: 900, bg: C.yellow, padX: 40 });
      ctx.restore();
    }
    mascot(ctx, W / 2, 1690 - (t > ev.q2 + 0.45 ? hop(t, 10) : 0), 410, t, ev.q2);
  }

  // ================= 1. PICK A GRADE BAND =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD, on = (i) => i === 3 && t >= ev.pick;
    S.BANDS.forEach(([e, lb], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col === 0 ? 745 : 335, y = 585 + row * 140;
      popAt(ctx, t, A[i].t, x, y, (c) => { const pr = on(i) ? 1 + 0.05 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 380, 112, `${e} ${lb}`, { on: on(i), color: C.blue, size: 42, seed: 30 + i }); }, { dur: 0.25, over: 1.6, rot: [0.01, -0.01][col] });
    });
    UI.tap(ctx, 335, 725, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, A[4].t, W / 2, 1050, (c) => {
      card(c, -440, -190, 880, 380, { fill: '#fff', r: 28, seed: 33, shadow: 9, lw: 4.5 });
      he(c, '🔭 כיתות ה׳–ו׳', 400, -120, { size: 52, w: 900, align: 'right', color: C.blue, maxW: 560 });
      pill(c, -290, -125, '⁦45⁩ דקות', { size: 38, w: 900, bg: C.lilac, seed: 34, padX: 26 });
      he(c, 'המטרה', 400, -55, { size: 34, w: 800, align: 'right', color: C.muted });
      wrap(c, S.GOAL, 44, 800, 700, 3).forEach((ln, i) => he(c, ln, 400, 5 + i * 62, { size: 44, w: 700, align: 'right', maxW: 810 }));
    }, { dur: 0.3, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[0], W / 2, 1385, (c) => pill(c, 0, 0, 'ארבע רמות, מהגן ועד כיתה ו׳', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1510, (c) => pill(c, 0, 0, 'גם בבית: חידון, ניסוי ויצירה בערב אחד', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    rocket(ctx, 160, 1700 - 16 * Math.sin(t * 3), 0.9, 0.5);
  }

  // ================= 2. SHORT LESSON PLAN =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const cols = [C.blue, C.red, C.green, C.purple];
    S.LESSON.forEach(([min, title], i) => {
      const on = i === 2 && t >= ev.topic, y = 585 + i * 128;
      popAt(ctx, t, S.TOPICS[i].t, W / 2, y, (c) => {
        const pr = on ? 1 + 0.03 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr);
        card(c, -440, -52, 880, 104, { fill: on ? '#f4edff' : '#fff', r: 28, seed: 40 + i, shadow: 8, lw: 4.5 });
        c.fillStyle = cols[i]; c.beginPath(); c.roundRect(250, -34, 170, 68, 34); c.fill();
        he(c, `⁦${min}⁩ דק׳`, 335, 14, { size: 40, w: 900, color: '#fff', maxW: 150 });
        he(c, title, 215, 15, { size: 50, w: 900, align: 'right', maxW: 600 });
      }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008][i % 2] });
    });
    UI.tap(ctx, 330, 975, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, ev.reasonCard, W / 2, 1255, (c) => {
      card(c, -440, -120, 880, 240, { fill: '#fffdf7', r: 28, seed: 50, shadow: 9, lw: 4.5 });
      he(c, 'בשיעור "ישראל בחלל" מכירים את', 410, -62, { size: 36, w: 700, color: C.muted, align: 'right', maxW: 830 });
      wrap(c, S.RAMON, 46, 800, 800, 2).forEach((ln, i) => he(c, ln, 410, 4 + i * 62, { size: 46, w: 800, align: 'right', maxW: 830 }));
    }, { dur: 0.3, over: 1.4, rot: -0.008 });
    popAt(ctx, t, S.pills[2], W / 2, 1480, (c) => pill(c, 0, 0, 'לגן: מערך של ⁦30⁩ דקות', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1600, (c) => pill(c, 0, 0, 'לכל רמה מערך משלה', { size: 44, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. ON-SCREEN QUIZ =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, Q = S.QUIZ, picked = t >= ev.mode;
    popAt(ctx, t, M0[0].t, W / 2, 640, (c) => {
      card(c, -440, -110, 880, 220, { fill: '#fff', r: 28, seed: 60, shadow: 9, lw: 4.5 });
      he(c, '⁦4⁩. ' + Q.text, 400, 22, { size: 62, w: 900, align: 'right', maxW: 800 });
    }, { dur: 0.28, over: 1.4, rot: -0.008 });
    Q.opts.forEach((o, i) => {
      const right = i === Q.answer, y = 880 + i * 128, st = picked ? (right ? 'ok' : 'dim') : '';
      popAt(ctx, t, M0[1 + i].t, W / 2, y, (c) => {
        const pr = picked && right ? 1 + 0.04 * pulse(t, ev.mode, 10) : 1; c.scale(pr, pr);
        card(c, -440, -50, 880, 100, { fill: st === 'ok' ? '#e5f7ec' : '#fff', r: 50, seed: 61 + i, shadow: 7, lw: st === 'ok' ? 5 : 3.5, stroke: st === 'dim' ? C.line : C.ink });
        c.globalAlpha *= st === 'dim' ? 0.5 : 1;
        he(c, o, 390, 15, { size: 46, w: 800, align: 'right', maxW: 760 });
      }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008, 0.006][i] });
    });
    UI.tap(ctx, 360, 1020, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, S.explainT, W / 2, 1335, (c) => {
      card(c, -440, -105, 880, 210, { fill: '#e5f7ec', r: 28, seed: 66, shadow: 8, lw: 4.5 });
      he(c, '✔️ נכון!', 400, -42, { size: 54, w: 900, align: 'right', color: C.green });
      wrap(c, Q.explain, 38, 810, 600, 2).forEach((ln, i) => he(c, ln, 400, 18 + i * 50, { size: 38, w: 600, align: 'right', maxW: 820 }));
    }, { dur: 0.3, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[4], W / 2, 1525, (c) => pill(c, 0, 0, 'לוחצים ורואים מיד אם צדקו', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1630, (c) => pill(c, 0, 0, 'מספיק מחשב ומקרן בכיתה', { size: 42, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. WORKSHEET + ANSWER PAGE =================
  function page(c, i) {
    card(c, -150, -212, 300, 424, { fill: '#fff', r: 12, seed: 90 + i, shadow: 9, lw: 4 });
    if (i === 0) {
      he(c, '🚀 דף עבודה · ה׳–ו׳', 130, -170, { size: 21, w: 900, align: 'right', maxW: 260 });
      he(c, 'נכון או לא נכון? כתבו נ או ל', 130, -138, { size: 15, w: 700, align: 'right', color: C.muted, maxW: 260 });
      S.TF.forEach((s, k) => {
        G.rrect(c, -132, -122 + k * 40, 264, 34, 6, { fill: '#fff', lw: 1.5, seed: 91 + k, stroke: '#aaa' });
        he(c, s, 124, -99 + k * 40, { size: 13, w: 600, align: 'right', maxW: 200 });
        c.fillStyle = '#999'; c.fillRect(-122, -94 + k * 40, 34, 2);
      });
      he(c, 'מודל בקנה מידה: 1 יחידה = 10 ס״מ', 130, 22, { size: 14, w: 800, align: 'right', maxW: 260 });
      S.PLANETS.slice(0, 5).forEach(([n, au], k) => {
        const y = 36 + k * 22;
        c.strokeStyle = '#999'; c.lineWidth = 1.2; c.strokeRect(-132, y, 264, 22);
        he(c, n, 124, y + 16, { size: 12, w: 600, align: 'right', maxW: 110 });
        he(c, String(au), 0, y + 16, { size: 12, w: 600, dir: 'ltr' });
      });
      c.strokeStyle = '#bbb'; c.setLineDash([6, 5]); c.lineWidth = 2; c.strokeRect(-132, 156, 264, 44); c.setLineDash([]);
    } else {
      he(c, '✅ תשובות · ה׳–ו׳', 130, -170, { size: 21, w: 900, align: 'right', color: C.green, maxW: 260 });
      [['נ', C.red], ['ל', C.green], ['ל', C.green]].forEach((_, k) => {});
      ['לא נכון', 'נכון', 'נכון'].forEach((a, k) => {
        he(c, `${k + 1}. ${S.TF[k]} — ${a}`, 130, -128 + k * 36, { size: 13, w: 700, align: 'right', maxW: 262 });
      });
      he(c, 'אילן רמון · איתן סטיבה', 130, -4, { size: 14, w: 700, align: 'right', maxW: 262 });
      he(c, 'מודל בקנה מידה (ס״מ):', 130, 40, { size: 14, w: 800, align: 'right', maxW: 262 });
      [['חמה', 4], ['נוגה', 7], ['כדור הארץ', 10], ['מאדים', 15]].forEach(([n, v], k) => he(c, `${n} ⁦${v}⁩`, 130, 68 + k * 24, { size: 14, w: 600, align: 'right', maxW: 262 }));
    }
  }
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, T(8, 0.05), W / 2, 580, (c) => { c.scale(press, press); pill(c, 0, 0, '🖨️ הדפסת דף עבודה', { size: 54, w: 900, bg: C.purple, fg: '#fff', padX: 80, seed: 83 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 595, t, ev.go, { color: 'rgba(138,79,216,0.8)', size: 120 });
    S.ROWS.slice(0, 2).forEach((r) => {
      popAt(ctx, t, r.t, 735 - r.i * 400, 965, (c) => { c.scale(1.25, 1.25); page(c, r.i); }, { dur: 0.3, over: 1.5, rot: [-0.03, 0.025][r.i] });
    });
    popAt(ctx, t, S.ROWS[2].t, W / 2, 1345, (c) => { chip(c, 245, 0, 420, 90, 'דף ראשון: לתלמיד/ה', { on: true, color: C.orange, size: 32, seed: 86 }); chip(c, -245, 0, 420, 90, 'דף שני: תשובות', { on: false, size: 32, seed: 87 }); }, { dur: 0.25, over: 1.5, rot: 0.008 });
    popAt(ctx, t, ev.ans, W / 2, 1458, (c) => pill(c, 0, 0, 'מוכן להדפסה! 🖨️', { size: 58, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1420, { n: 50, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[6], W / 2, 1560, (c) => pill(c, 0, 0, 'נכון/לא נכון, השלמת משפטים וטבלה', { size: 40, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    
  }

  // ================= 5. CRAFT + FIVE DAYS =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    popAt(ctx, t, I[0].t, W / 2, 625, (c) => {
      card(c, -440, -130, 880, 260, { fill: '#fff', r: 28, seed: 100, shadow: 9, lw: 4.5 });
      he(c, '📏 מערכת השמש בקנה מידה במסדרון', 405, -62, { size: 48, w: 900, align: 'right', maxW: 820 });
      ['גליל נייר או חבל', 'סרט מדידה', '⁦9⁩ פתקים', 'טוש'].forEach((s, i) => {
        const x = 330 - (i === 0 ? 0 : [0, 330, 570, 750][i] - 0) ; void x;
      });
      const items = [['גליל נייר או חבל', 255], ['סרט מדידה', 190], ['⁦9⁩ פתקים', 170], ['טוש', 110]];
      let cx = 405;
      items.forEach(([s, w], i) => { chip(c, cx - w / 2, 22, w, 76, s, { on: false, size: 30, seed: 101 + i }); cx -= w + 14; });
      he(c, '⁦1⁩ יחידה אסטרונומית = ⁦10⁩ ס״מ', 405, 108, { size: 32, w: 700, align: 'right', color: C.muted, maxW: 820 });
    }, { dur: 0.32, over: 1.3, rot: -0.008 });
    // the scale strip: sun on the right, planets at real scaled centimetres
    popAt(ctx, t, I[1].t, W / 2, 905, (c) => {
      card(c, -440, -100, 880, 200, { fill: '#10122b', r: 28, seed: 110, shadow: 9, lw: 4.5 });
      c.save(); c.beginPath(); c.roundRect(-440, -100, 880, 200, 28); c.clip();
      for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${0.25 + 0.4 * U.hash(i + 9)})`; c.beginPath(); c.arc(-420 + U.hash(i) * 840, -85 + U.hash(i + 40) * 170, 1.5 + U.hash(i + 70) * 2, 0, Math.PI * 2); c.fill(); }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(-400, 10); c.lineTo(400, 10); c.setLineDash([]); c.stroke();
      sun(c, 395, 10, 28, t);
      S.PLANETS.forEach(([n, au], k) => {
        const p = UI.pop(t, S.dotsT(k), 0.25, 2);
        if (p <= 0) return;
        const x = 395 - 56 - (au * 10) * 2.4, r = k === 4 || k === 5 ? 15 : k > 5 ? 11 : 8;
        c.save(); c.translate(x, 10); c.scale(p, p);
        c.fillStyle = PCOL[k]; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke();
        c.restore();
      });
      he(c, 'מהשמש', 370, 82, { size: 28, w: 800, color: '#fff', align: 'center' });
      const pn = UI.pop(t, S.dotsT(7), 0.25, 2);
      if (pn > 0) { c.save(); c.translate(-250, -50); c.scale(pn, pn); he(c, 'נפטון: ⁦301⁩ ס״מ', 0, 0, { size: 34, w: 900, color: '#8fd8e6' }); c.restore(); }
    }, { dur: 0.32, over: 1.3, rot: 0.006 });
    // five days
    S.DAYS.forEach(([d, e, ttl], i) => {
      const y = 1105 + i * 92;
      popAt(ctx, t, I[2 + i].t, W / 2, y, (c) => {
        card(c, -440, -38, 880, 76, { fill: i === 4 ? C.yellow : '#fff', r: 24, seed: 120 + i, shadow: 6, lw: 4 });
        he(c, e, 395, 20, { size: 44, w: 400 });
        he(c, `יום ${d}`, 345, 14, { size: 34, w: 900, align: 'right', color: C.red, maxW: 190 });
        he(c, ttl, 140, 13, { size: 38, w: 800, align: 'right', maxW: 520 });
      }, { dur: 0.25, over: 1.5, rot: [0.006, -0.006][i % 2] });
    });
    popAt(ctx, t, S.pills[8], W / 2, 1640, (c) => pill(c, 0, 0, 'בלי ציוד מיוחד, בגן, בכיתה ובבית', { size: 42, w: 900, bg: C.green, fg: '#fff', padX: 44, seed: 112, maxW: SAFE.w }), { rot: -0.03, dur: 0.35 });
  }

  // the three answers again, small, under the question
  function endOpts(ctx, t, t0) {
    S.HOOK_OPTS.forEach((s, i) => {
      popAt(ctx, t, t0 + i * 0.07, W / 2, 1375 + i * 84, (c) => {
        G.rrect(c, -360, -35, 720, 70, 35, { fill: '#fff', lw: 3, seed: 150 + i, stroke: C.ink });
        he(c, String(i + 1), 315, 15, { size: 40, w: 900, color: C.red, dir: 'ltr' });
        he(c, s, 275, 14, { size: 40, w: 800, color: C.ink, align: 'right', maxW: 520 });
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
    he(ctx, 'ערכת שבוע החלל לגן, לכיתה ולבית', W / 2, 800, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 885, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 990, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'באתר: לכיתה ← שבוע החלל 🚀', W / 2, 1090, { size: 40, w: 800, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1225, (c) => { card(c, -450, -82, 900, 164, { fill: C.red, r: 40, seed: 192, shadow: 8, lw: 4.5 }); he(c, 'כמה זמן לוקח לאור השמש', 0, -14, { size: 54, w: 900, color: '#fff', maxW: 840 }); he(c, 'להגיע אלינו? ☀️', 0, 52, { size: 54, w: 900, color: '#fff', maxW: 840 }); }, { rot: 0.015, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1650, (c) => pill(c, 0, 0, '⁦1, 2⁩ או ⁦3⁩? כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
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
