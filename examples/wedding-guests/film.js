// THE FILM (9:16) — "מזמינים 100 איש לחתונה, כמה באמת מגיעים?": the wedding planner in the site own look. Pure function of t.
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

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '💍 בוגה מתחתנים', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'מזמינים 100 איש', 0, 0, { size: 138, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 655, (c) => he(c, 'לחתונה. כמה', 0, 0, { size: 150, w: 900 }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 810, (c) => he(c, 'באמת מגיעים?', 0, 0, { size: 160, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    S.hookOpts.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2);
      const x = col ? 290 : 790, y = 960 + row * 140;
      popAt(ctx, t, o.t, x, y, (c) => {
        card(c, -215, -62, 430, 124, { seed: 20 + o.i, shadow: 8, r: 30 });
        he(c, o.s, -22, 18, { size: 56, w: 800, maxW: 250, dir: 'ltr' });
        c.fillStyle = [C.blue, C.red, C.green, C.purple][o.i]; c.beginPath(); c.arc(160, 0, 34, 0, Math.PI * 2); c.fill();
        he(c, ['א', 'ב', 'ג', 'ד'][o.i], 160, 16, { size: 44, w: 900, color: '#fff' });
      }, { rot: [-0.02, 0.02, 0.02, -0.02][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(790, 1440); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ענו בראש… 🤔', { size: 52, w: 900, bg: C.yellow, padX: 30 });
      ctx.restore();
    }
    mascot(ctx, 295, 1465 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. GUEST GROUPS =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.AUD.forEach((a) => {
      const cy = 600 + a.i * 150;
      const on = t >= ev.pick && a.i === S.AUD_PICK;
      popAt(ctx, t, a.t, W / 2, cy, (c) => {
        card(c, -SAFE.w / 2, -62, SAFE.w, 124, { fill: on ? C.yellow : C.card, r: 28, seed: 30 + a.i, shadow: 9 });
        he(c, a.e, SAFE.w / 2 - 70, 24, { size: 70, w: 400 });
        he(c, a.label, SAFE.w / 2 - 140, 18, { size: 52, w: 900, align: 'right', maxW: SAFE.w - 400 });
        G.rrect(c, -SAFE.w / 2 + 28, -40, 150, 80, 22, { fill: '#fff', lw: 3.5, seed: 40 + a.i, stroke: C.ink });
        he(c, String(a.n), -SAFE.w / 2 + 103, 18, { size: 56, w: 900, dir: 'ltr', color: C.blue });
      }, { rot: [0.01, -0.012, 0.01, -0.01, 0.012][a.i], dur: 0.3, over: 1.8 });
    });
    UI.tap(ctx, W / 2 - 150, 600 + S.AUD_PICK * 150, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 140 });
    popAt(ctx, t, T(3, 3), W / 2, 1450, (c) => pill(c, 0, 0, 'כותבים כמה הזמנתם מכל סוג', { size: 46, w: 900, bg: C.lilac, seed: 66 }), { rot: -0.03 });
    const gp = ease.outBack(clamp((t - T(3, 0.5)) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 150, 1670 + (1 - gp) * 520 - hop(t, 10), 220, { rot: 0.03 });
  }

  // ================= 2. DAY + ESTIMATE =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    S.TOPICS.forEach((p) => {
      const cy = 580 + p.i * 125;
      const on = t >= ev.topic && p.i === S.TOPIC_PICK;
      popAt(ctx, t, p.t, W / 2, cy, (c) => {
        G.rrect(c, -SAFE.w / 2, -50, SAFE.w, 100, 50, { fill: on ? C.red : '#fff', lw: on ? 4.5 : 3.5, seed: 100 + p.i, stroke: on ? C.ink : C.line });
        he(c, `${p.e} ${p.s}`, 0, 18, { size: 50, w: 800, color: on ? '#fff' : C.ink, maxW: SAFE.w - 60 });
      }, { dur: 0.25, over: 1.7 });
    });
    UI.tap(ctx, W / 2 + 150, 580 + S.TOPIC_PICK * 125, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 130 });
    const E = S.EST;
    popAt(ctx, t, T(5, 2.5), W / 2, 1180, (c) => {
      card(c, -SAFE.w / 2, -250, SAFE.w, 560, { fill: C.blush, r: 36, seed: 131, shadow: 12 });
      he(c, `מתוך ⁦${E.invited}⁩ מוזמנים צפויים להגיע בערך`, 0, -150, { size: 46, w: 800, maxW: SAFE.w - 60 });
      he(c, String(E.expected), 0, 20, { size: 220, w: 900, color: C.red, dir: 'ltr' });
      he(c, `${E.rate}% הגעה · בין ⁦${E.low}⁩ ל־⁦${E.high}⁩`, 0, 100, { size: 44, w: 700, maxW: SAFE.w - 60 });
      he(c, `💡 מינימום מנות מול האולם: בערך ⁦${E.low}⁩`, 0, 200, { size: 40, w: 900, maxW: SAFE.w - 60 });
    }, { rot: -0.01, dur: 0.35, over: 1.5 });
  }

  // ================= 3. BUDGET LINES =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    S.MODES.forEach((o) => {
      const cy = 640 + o.i * 215;
      const on = t >= ev.mode && o.i === 1;
      popAt(ctx, t, o.t, W / 2, cy, (c) => {
        card(c, -SAFE.w / 2, -93, SAFE.w, 186, { fill: on ? C.yellow : C.card, r: 28, seed: 140 + o.i, shadow: 9 });
        c.fillStyle = o.color; c.beginPath(); c.arc(SAFE.w / 2 - 85, 0, 62, 0, Math.PI * 2); c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        he(c, o.e, SAFE.w / 2 - 85, 26, { size: 66, w: 400 });
        he(c, o.s, SAFE.w / 2 - 175, -6, { size: 56, w: 900, align: 'right', maxW: SAFE.w - 220 });
        he(c, o.note, SAFE.w / 2 - 175, 48, { size: 36, w: 600, color: C.muted, align: 'right', maxW: SAFE.w - 220 });
      }, { rot: [0.01, -0.012, 0.01, -0.01][o.i], dur: 0.3, over: 1.8 });
    });
    UI.tap(ctx, W / 2 - 100, 640 + 215, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 140 });
    popAt(ctx, t, T(7, 3), W / 2, 1450, (c) => pill(c, 0, 0, 'שנו כל שורה לפי ההצעות שקיבלתם', { size: 44, w: 900, bg: C.lilac, seed: 150, maxW: SAFE.w }), { rot: -0.03 });
  }

  // ================= 4. TOTAL vs GIFTS =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const Q = S.Q, X = SAFE.x, Wc = SAFE.w;
    const typed = t >= ev.go;
    card(ctx, X, 500, Wc, 150, { seed: 160, shadow: 9, r: 28 });
    he(ctx, 'מתנה ממוצעת לאורח (₪)', RIGHT - 30, 590, { size: 40, w: 800, align: 'right' });
    G.rrect(ctx, X + 24, 525, 200, 100, 24, { fill: typed ? C.yellow : '#fff', lw: 4, seed: 161, stroke: C.ink });
    he(ctx, typed ? Q.gift : '400', X + 124, 593, { size: 60, w: 900, dir: 'ltr', color: typed ? C.blue : C.muted });
    UI.tap(ctx, X + 124, 575, t, ev.go, { color: 'rgba(35,135,77,0.8)', size: 130 });
    const boxes = [
      { y: 720, fill: C.blush, a: 'סך הכול', b: Q.total, c: Q.perGuest, col: C.red },
      { y: 970, fill: '#dff3e5', a: 'המתנות הצפויות', b: Q.gifts, c: Q.left, col: C.green },
      { y: 1220, fill: '#e3f1ff', a: 'שולם עד עכשיו', b: Q.paid, c: Q.toPay, col: C.blue },
    ];
    boxes.forEach((b, i) => popAt(ctx, t, ev.ans, W / 2, b.y + 100, (c) => {
      card(c, -Wc / 2, -100, Wc, 200, { fill: b.fill, r: 30, seed: 170 + i, shadow: 10 });
      he(c, b.a, Wc / 2 - 40, -34, { size: 40, w: 700, align: 'right', color: C.muted });
      he(c, b.b, 0, 62, { size: 100, w: 900, color: b.col, dir: 'ltr' });
      he(c, b.c, -Wc / 2 + 36, -34, { size: 36, w: 800, align: 'left', maxW: Wc / 2 - 40, dir: i === 0 ? 'rtl' : 'rtl' });
    }, { dur: 0.22, over: 1.4 }));
    confetti(ctx, t, ev.ans, W / 2, 1000, { n: 60, seed: 5, spread: 900 });
    popAt(ctx, t, ev.ans + 0.6, W / 2, 1470, (c) => pill(c, 0, 0, 'הערכה בלבד · נשמר רק בדפדפן שלכם', { size: 38, w: 800, bg: C.lilac, seed: 195, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. INVITE + RSVP =================
  function sheet(ctx, x, y, w, h, emoji, title, lines) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 8, -h / 2 + 10, w, h, 18); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
    he(ctx, emoji, 0, -h / 2 + 120, { size: 110, w: 400 });
    he(ctx, title, 0, -h / 2 + 200, { size: 46, w: 900, maxW: w - 30 });
    lines.forEach((ln, k) => he(ctx, ln, 0, -h / 2 + 270 + k * 50, { size: 30, w: 600, color: C.muted, maxW: w - 40 }));
    ctx.restore();
  }
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const a = ease.outBack(clamp((t - T(10, 0.5)) / 0.4), 1.4), b = ease.outBack(clamp((t - T(10, 2)) / 0.4), 1.4);
    if (a > 0) { ctx.save(); ctx.translate(0, (1 - a) * 300); ctx.globalAlpha = clamp(a * 2); ctx.rotate(0.03); sheet(ctx, 735, 800, 390, 520, '💌', 'הזמנה לחתונה', ['שמות, תמונה ותאריך', 'לוואטסאפ, לסטורי', 'ולהדפסה']); ctx.restore(); }
    if (b > 0) { ctx.save(); ctx.translate(0, (1 - b) * 300); ctx.globalAlpha = clamp(b * 2); ctx.rotate(-0.03); sheet(ctx, 345, 800, 390, 520, '✅', 'אישורי הגעה', ['קישור אחד בוואטסאפ', 'מי מגיע וכמה מנות', 'ורגישויות במזון']); ctx.restore(); }
    const press = t >= ev.printBtn ? 1 - 0.08 * pulse(t, ev.printBtn, 10) : 1;
    if (t >= T(10, 3)) {
      ctx.save(); ctx.translate(W / 2, 1150); ctx.scale(press, press);
      pill(ctx, 0, 0, '📲 תזכורת אישית למי שלא ענה', { size: 44, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 58, maxW: SAFE.w });
      ctx.restore();
      UI.tap(ctx, W / 2 + 120, 1150, t, ev.printBtn, { color: 'rgba(20,22,45,0.7)', size: 120 });
    }
    popAt(ctx, t, S.extras[0].t, W / 2, 1290, (c) => pill(c, 0, 0, '🪑 סידור הושבה לשולחנות', { size: 46, w: 900, bg: C.yellow, seed: 66 }), { rot: -0.03 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1410, (c) => pill(c, 0, 0, 'הכול בחינם, בלי הרשמה', { size: 46, w: 900, bg: C.lilac, seed: 67 }), { rot: 0.03 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 570, 450, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'מתכנן חתונה חינמי', W / 2, 1000, { size: 56, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט: יום הולדת ← בוגה מתחתנים', W / 2, 1350, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ כתבו את התשובה בתגובות', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 48, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
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
