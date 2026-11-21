// THE FILM (9:16) — "של איזו מדינה הדגל הזה?": the flags quiz (/flags/quiz) in the site own look. Pure function of t.
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



  // ---- the flag the way the quiz draws it: the site's own SVG in an ink frame ----
  const FLAG_IMG = {};
  function flag(c, code, cx, cy, w, { r = 8 } = {}) {
    const im = FLAG_IMG[code], h = w * 0.75;
    c.save(); c.shadowColor = 'rgba(20,22,45,.25)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(cx - w / 2, cy - h / 2, w, h, r); c.fill(); c.restore();
    if (im) { c.save(); c.beginPath(); c.roundRect(cx - w / 2, cy - h / 2, w, h, r); c.clip(); c.drawImage(im, cx - w / 2, cy - h / 2, w, h); c.restore(); }
    c.strokeStyle = C.line; c.lineWidth = 3; c.beginPath(); c.roundRect(cx - w / 2, cy - h / 2, w, h, r); c.stroke();
  }
  // an answer button (country name), like the quiz's .ln-opt
  function opt(c, x, y, w, h, s, { state = '', size = 46, seed = 1, num = 0 } = {}) {
    const fill = state === 'right' ? '#bbf7d0' : state === 'wrong' ? '#fee2e2' : '#fff';
    card(c, x - w / 2, y - h / 2, w, h, { fill, r: 28, seed, shadow: 8, lw: state ? 6 : 4.5, stroke: state === 'right' ? C.green : state === 'wrong' ? C.red : C.ink });
    he(c, s, x + (num ? 22 : 0), y + size * 0.36, { size, w: 800, color: C.ink, maxW: w - (num ? 150 : 40) });
    if (num) { c.fillStyle = C.red; c.beginPath(); c.arc(x + w / 2 - 44, y, 28, 0, Math.PI * 2); c.fill(); he(c, String(num), x + w / 2 - 44, y + 13, { size: 38, w: 900, color: '#fff', dir: 'ltr' }); }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 285, (c) => pill(c, 0, 0, '🏳️ חידון הדגלים', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 440, (c) => he(c, 'של איזו מדינה הדגל הזה? 🤔', 0, 0, { size: 84, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 720, (c) => {
      card(c, -250, -195, 500, 390, { fill: '#fff', r: 40, seed: 14, shadow: 12, lw: 4.5 });
      flag(c, S.HOOK_FLAG, 0, 0, 420);
    }, { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2);
      popAt(ctx, t, o.t, W / 2 + (col ? -225 : 225), 1060 + row * 140, (c) => opt(c, 0, 0, 440, 118, S.HOOK_NAMES[o.i], { size: 46, seed: 20 + o.i, num: o.i + 1 }), { rot: [-0.01, 0.008, 0.008, -0.008][o.i], dur: 0.25, over: 1.6 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(650, 1466); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '1, 2, 3 או 4? כתבו בתגובות 👇', { size: 48, w: 900, bg: C.yellow, padX: 34, maxW: 700 });
      ctx.restore();
    }
    mascot(ctx, 175, 1640 - (t > ev.q2 + 0.45 ? hop(t, 8) : 0), 250, t, ev.q2);
  }

  // ================= 1. CHOOSE THE LEVEL =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.LEVELS.forEach(([nm, desc], i) => {
      const on = i === S.LEVEL_PICK && t >= ev.pick;
      popAt(ctx, t, S.AUD[i].t, W / 2, 610 + i * 190, (c) => {
        const pr = on ? 1 + 0.04 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr);
        card(c, -440, -80, 880, 160, { fill: on ? C.blue : '#fff', r: 32, seed: 30 + i, shadow: 10, lw: 4.5 });
        he(c, nm, 400, -12, { size: 62, w: 900, align: 'right', color: on ? '#fff' : C.ink });
        he(c, desc, 400, 52, { size: 38, w: 600, align: 'right', color: on ? '#fff' : C.muted, maxW: 800 });
      }, { dur: 0.25, over: 1.5, rot: [0.008, -0.008, 0.006][i] });
    });
    UI.tap(ctx, W / 2 + 120, 610 + S.LEVEL_PICK * 190 + 10, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1245, (c) => pill(c, 0, 0, '⁦195⁩ דגלים מכל העולם', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1355, (c) => pill(c, 0, 0, 'הרמה הקלה מתאימה כבר לכיתות א׳–ב׳', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[2], W / 2, 1465, (c) => pill(c, 0, 0, 'בגן: מוצאים את הדגל של ישראל', { size: 40, w: 900, bg: C.yellow, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 2. CHOOSE THE CONTINENT =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    S.CONTS.forEach((lb, i) => {
      const on = i === S.CONT_PICK && t >= ev.topic;
      const x = i === 0 ? W / 2 : W / 2 + (i % 2 ? 235 : -235), y = i === 0 ? 565 : 565 + Math.ceil(i / 2) * 120;
      popAt(ctx, t, S.TOPICS[i].t, x, y, (c) => { const pr = on ? 1 + 0.05 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, i === 0 ? 700 : 450, 100, lb, { on, color: C.red, size: 40, seed: 50 + i }); }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008, 0.01, -0.01, 0.008, -0.006, 0.006][i] });
    });
    UI.tap(ctx, W / 2 + 235 + 60, 565 + 120 + 10, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, ev.reasonCard, W / 2, 1090, (c) => pill(c, 0, 0, '▶ מתחילים — ⁦10⁩ דגלים', { size: 56, w: 900, bg: C.green, fg: '#fff', padX: 60, seed: 60, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    confetti(ctx, t, ev.reasonCard, W / 2, 1090, { n: 36, seed: 5, spread: 700 });
    popAt(ctx, t, S.pills[3], W / 2, 1250, (c) => pill(c, 0, 0, 'חידון לכל המשפחה, לא רק לילדים', { size: 42, w: 900, bg: C.yellow, seed: 61, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[4], W / 2, 1360, (c) => pill(c, 0, 0, 'בכיתה: מקרינים ומחלקים לקבוצות', { size: 42, w: 900, bg: C.lilac, seed: 62, maxW: SAFE.w }), { rot: -0.02 });
  }

  // the quiz card: counter, flag, question, four answers (state per answer)
  function quizCard(ctx, t, q, i0, cardT, opts, states, tapAt) {
    popAt(ctx, t, cardT, W / 2, 735, (c) => {
      card(c, -440, -255, 880, 510, { fill: '#fff', r: 34, seed: 40, shadow: 11, lw: 4.5 });
      he(c, 'דגל ⁦' + i0 + '⁩ מתוך ⁦10⁩', 410, -205, { size: 34, w: 800, align: 'right', color: C.muted });
      he(c, '✅ ⁦' + (i0 > 1 ? 1 : 0) + '⁩ · 🔥 רצף ⁦' + (i0 > 1 ? 1 : 0) + '⁩', -410, -205, { size: 34, w: 800, align: 'left', color: C.muted });
      flag(c, q.flag, 0, -40, 340);
      he(c, 'של איזו מדינה הדגל הזה?', 0, 185, { size: 52, w: 900, maxW: 820 });
    }, { dur: 0.3, over: 1.35, rot: -0.008 });
    q.names.forEach((nm, k) => {
      const col = k % 2, row = Math.floor(k / 2), st = states[k] || '';
      popAt(ctx, t, opts[k].t, W / 2 + (col ? -225 : 225), 1085 + row * 130, (c) => { const sc = st && tapAt ? 1 + 0.05 * Math.sin(Math.PI * clamp((t - tapAt) / 0.2)) : 1; c.scale(sc, sc); opt(c, 0, 0, 440, 106, nm, { size: 46, seed: 44 + k, state: st }); }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008, 0.006, -0.006][k] });
    });
  }

  // ================= 3. IDENTIFY THE FLAG =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const q = S.Q3, M0 = S.MODES, opts = [M0[1], M0[2], M0[3], M0[4]];
    const tapped = t >= ev.mode, fbP = clamp((t - ev.fb3) / 0.3);
    quizCard(ctx, t, q, 1, M0[0].t, opts, q.names.map((_, k) => tapped && k === q.right ? 'right' : ''), ev.mode);
    UI.tap(ctx, W / 2 + 225 + 70, 1085 + 130 + 10, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 }); // right answer = index 2 → right column, row 2
    if (fbP > 0) {
      ctx.save(); ctx.globalAlpha = clamp(fbP * 2); ctx.translate(0, (1 - ease.outCubic(fbP)) * 30);
      card(ctx, 70, 1375, 940, 120, { fill: '#fff4bb', r: 28, seed: 48, shadow: 8, lw: 4.5 });
      he(ctx, '👏 נכון! הבירה: ' + q.capital + '.', 990, 1452, { size: 48, w: 900, align: 'right', color: C.green, maxW: 900 });
      ctx.restore();
    }
    confetti(ctx, t, ev.fb3, W / 2, 1150, { n: 40, seed: 6, spread: 700 });
    popAt(ctx, t, S.pills[5], W / 2, 1585, (c) => pill(c, 0, 0, 'הרצף 🔥 סופר תשובות נכונות ברצף', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. A WRONG ANSWER: THE EXPLANATION =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const q = S.Q4, R0 = S.ROWS, tapped = t >= ev.go, fbP = clamp((t - ev.ans) / 0.35);
    const states = q.names.map((_, k) => (tapped ? (k === q.pick ? 'wrong' : k === q.right ? 'right' : '') : ''));
    quizCard(ctx, t, q, 2, T(8, 0), R0, states, ev.go);
    UI.tap(ctx, W / 2 + 225 + 70, 1085 + 10, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 120 }); // pick = index 0 → col 0 → right side
    if (fbP > 0) {
      ctx.save(); ctx.globalAlpha = clamp(fbP * 2); ctx.translate(0, (1 - ease.outCubic(fbP)) * 30);
      card(ctx, 70, 1375, 940, 210, { fill: '#fff4bb', r: 28, seed: 49, shadow: 8, lw: 4.5 });
      he(ctx, 'לא נורא — זה הדגל של ' + 'רומניה' + '.', 990, 1440, { size: 46, w: 900, align: 'right', maxW: 900 });
      he(ctx, 'הבירה: ' + q.capital + '.', 990, 1496, { size: 40, w: 700, align: 'right', color: C.muted, maxW: 900 });
      he(ctx, '💡 ' + q.note, 990, 1556, { size: 38, w: 700, align: 'right', maxW: 900 });
      ctx.restore();
    }
    popAt(ctx, t, S.pills[7], W / 2, 1668, (c) => pill(c, 0, 0, 'חוזרים רק על הדגלים שטעיתם 🔁', { size: 40, w: 900, bg: C.lilac, seed: 88, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. RESULT, SHARE, REVIEW =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems, tapP = clamp((t - ev.printBtn) / 0.25);
    popAt(ctx, t, I[0].t, W / 2, 705, (c) => {
      card(c, -440, -170, 880, 340, { fill: '#fff', r: 34, seed: 100, shadow: 11, lw: 4.5 });
      he(c, '⁦7⁩ מתוך ⁦10⁩ 🌟', 0, -30, { size: 110, w: 900, maxW: 820 });
      he(c, 'רמה: קשה · אירופה · הרצף הכי ארוך: ⁦4⁩ 🔥', 0, 70, { size: 38, w: 700, color: C.muted, maxW: 820 });
    }, { dur: 0.32, over: 1.3, rot: -0.01 });
    popAt(ctx, t, I[1].t, W / 2, 985, (c) => {
      const sc = tapP > 0 ? 1 + 0.05 * Math.sin(Math.PI * tapP) : 1; c.scale(sc, sc);
      pill(c, 0, 0, '💬 שליחת התוצאה בוואטסאפ', { size: 48, w: 900, bg: C.green, fg: '#fff', padX: 46, seed: 112, maxW: SAFE.w });
      pill(c, 0, 118, '🔁 עוד סיבוב', { size: 42, w: 900, bg: C.blue, fg: '#fff', padX: 56, seed: 113 });
    }, { rot: -0.02, dur: 0.3 });
    UI.tap(ctx, W / 2 + 230, 995, t, ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 120 });
    confetti(ctx, t, ev.printBtn, W / 2, 1000, { n: 40, seed: 8, spread: 900 });
    popAt(ctx, t, I[2].t, W / 2, 1245, (c) => he(c, 'כדאי לחזור על הדגלים האלה', 0, 0, { size: 46, w: 900, maxW: SAFE.w }), { dur: 0.25 });
    S.REVIEW.forEach((r, k) => {
      popAt(ctx, t, I[2 + k].t + 0.1, W / 2 + (k ? -225 : 225), 1370, (c) => {
        card(c, -215, -75, 430, 150, { fill: '#fff', r: 26, seed: 120 + k, shadow: 8, lw: 4.5 });
        flag(c, r.flag, 120, 0, 150, { r: 6 });
        he(c, r.name, -20, -8, { size: 38, w: 900, align: 'right', maxW: 230 });
        he(c, 'בירה: ' + r.capital, -20, 40, { size: 30, w: 600, align: 'right', color: C.muted, maxW: 230 });
      }, { dur: 0.25, over: 1.5, rot: [0.01, -0.01][k] });
    });
    popAt(ctx, t, S.extras[0].t, W / 2, 1530, (c) => pill(c, 0, 0, 'מאתגרים משפחה וחברים: מי מזהה יותר?', { size: 38, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // the hook flag again, small, with the four numbered names
  function endOpts(ctx, t, t0) {
    popAt(ctx, t, t0, 215, 1230, (c) => { card(c, -135, -120, 270, 240, { fill: '#fff', r: 30, seed: 150, shadow: 9, lw: 4 }); flag(c, S.HOOK_FLAG, 0, 0, 220, { r: 6 }); }, { dur: 0.25, over: 1.5 });
    [0, 1, 2, 3].forEach((i) => {
      popAt(ctx, t, t0 + 0.08 + i * 0.08, 650, 1100 + i * 92, (c) => opt(c, 0, 0, 600, 80, S.HOOK_NAMES[i], { size: 36, seed: 160 + i, num: i + 1 }), { dur: 0.22, over: 1.5 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 330); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 330, 280, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 570 + (1 - wp) * 24, { size: 116, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'חידון הדגלים', W / 2, 645, { size: 50, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 722, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 42, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 820, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 60, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: חידון דגלים 🔎', W / 2, 912, { size: 36, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 995, (c) => pill(c, 0, 0, '✍️ של איזו מדינה הדגל?', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1490, (c) => pill(c, 0, 0, '1, 2, 3 או 4? כתבו בתגובות 👇', { size: 46, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 500, { n: 45, seed: 9, spread: 1000 });
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
      for (const n of ['pl', 'ad', 'ro', 'md']) FLAG_IMG[n] = await L('img/flags/' + n + '.svg');
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
