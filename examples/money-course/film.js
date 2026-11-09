// THE FILM (9:16) — "3 ב־30 ₪, משתלם?": the free money course for kids and teens in the site own look. Pure function of t.
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
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🛒 חידת מבצע', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'מבצע: 3 ב־30 ₪', 0, 0, { size: 150, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 655, (c) => he(c, 'המוצר עולה ⁦9.90⁩ ₪', 0, 0, { size: 110, w: 900, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 815, (c) => he(c, 'המבצע משתלם?', 0, 0, { size: 140, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    S.hookOpts.forEach((o) => {
      const x = 800 - o.i * 260;
      popAt(ctx, t, o.t, x, 1040, (c) => {
        card(c, -115, -100, 230, 200, { seed: 20 + o.i, shadow: 10, r: 34 });
        he(c, o.s, 0, 20, { size: 60, w: 900, maxW: 200 });
      }, { rot: [-0.02, 0.02, -0.015][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(760, 1330); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ענו בראש… 🤔', { size: 56, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 295, 1490 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. THE 7 LESSONS =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.AUD.forEach((a) => {
      const y = 570 + a.i * 114, on = t >= ev.pick && a.i === S.AUD_PICK;
      popAt(ctx, t, a.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -48, SAFE.w, 96, { fill: on ? C.yellow : '#fff', r: 28, seed: 30 + a.i, shadow: 7, lw: 3.5 });
        c.fillStyle = C.ink; c.beginPath(); c.arc(SAFE.w / 2 - 50, 0, 28, 0, Math.PI * 2); c.fill();
        he(c, String(a.i + 1), SAFE.w / 2 - 50, 15, { size: 40, w: 900, color: '#fff', dir: 'ltr' });
        he(c, a.emoji, SAFE.w / 2 - 125, 17, { size: 52, w: 400 });
        he(c, a.label, SAFE.w / 2 - 170, 15, { size: 42, w: 800, align: 'right', maxW: SAFE.w - 220 });
      }, { dur: 0.25, over: 1.6, rot: [0.006, -0.006][a.i % 2] });
    });
    UI.tap(ctx, 600, 570 + S.AUD_PICK * 114 + 10, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1430, (c) => pill(c, 0, 0, 'בסוף כל שיעור: תרגול בבית וחידון', { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1550, (c) => pill(c, 0, 0, 'לילדים מכיתה ג׳ עד ט׳, עם הורה', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. NEED OR WANT =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    [['צורך', C.green, 740], ['רצון', C.purple, 340]].forEach(([lab, col, x], k) => popAt(ctx, t, T(4, 0.05), x, 570, (c) => {
      card(c, -190, -50, 380, 100, { fill: col, seed: 40 + k, shadow: 8, r: 50 });
      he(c, lab, 0, 22, { size: 62, w: 900, color: '#fff' });
    }, { dur: 0.25, over: 1.6 }));
    S.TOPICS.forEach((o) => {
      const need = o.kind === 'need', x = need ? 740 : 340, y = 710 + Math.floor(o.i / 2) * 135;
      popAt(ctx, t, o.t, x, y, (c) => {
        card(c, -190, -55, 380, 110, { fill: need ? '#e3f6ea' : C.lilac, seed: 50 + o.i, shadow: 7, r: 28, lw: 3.5 });
        he(c, o.emoji, 140, 18, { size: 54, w: 400 });
        he(c, o.label, 100, 14, { size: 36, w: 800, align: 'right', maxW: 250 });
      }, { dur: 0.25, over: 1.7, rot: [0.01, -0.01][o.i % 2] });
    });
    popAt(ctx, t, ev.topic, W / 2, 1210, (c) => {
      card(c, -SAFE.w / 2, -105, SAFE.w, 210, { fill: C.yellow, r: 30, seed: 60, shadow: 10 });
      he(c, '⏰ כלל 24 השעות', 0, -22, { size: 64, w: 900, maxW: SAFE.w - 60 });
      he(c, 'רצון? מחכים יום לפני שקונים', 0, 55, { size: 46, w: 700, color: C.red, maxW: SAFE.w - 60 });
    }, { dur: 0.16, over: 1.3, rot: -0.008 });
    UI.tap(ctx, 600, 1240, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 130 });
    popAt(ctx, t, S.pills[2], W / 2, 1420, (c) => pill(c, 0, 0, 'אין רע ברצונות, רק קודם הצרכים', { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1540, (c) => pill(c, 0, 0, 'כל שקל יוצא רק פעם אחת', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. THREE JARS =================
  function jar(ctx, j, fill, shown, t) {
    const [emoji, name, amt, pct, col] = j;
    card(ctx, -135, -250, 270, 500, { seed: 70, shadow: 10, r: 30 });
    he(ctx, emoji, 0, -170, { size: 80, w: 400 });
    he(ctx, name, 0, -85, { size: 52, w: 900 });
    // the jar body
    ctx.save(); ctx.beginPath(); ctx.roundRect(-70, -50, 140, 190, 26); ctx.clip();
    ctx.fillStyle = '#f4f7ff'; ctx.fillRect(-80, -60, 160, 210);
    ctx.fillStyle = col; const fh = 190 * (pct / 50) * 0.86 * ease.outCubic(fill); ctx.globalAlpha = 0.9; ctx.fillRect(-80, 140 - fh, 160, fh + 10); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-70, -50, 140, 190, 26); ctx.stroke();
    if (shown > 0) {
      he(ctx, `${amt} ₪`, 0, 200, { size: 60, w: 900, dir: 'ltr', alpha: shown });
      he(ctx, `${pct}%`, 0, pct < 15 ? 60 : 100, { size: 46, w: 900, color: pct < 15 ? C.ink : '#fff', dir: 'ltr', alpha: shown });
    }
  }
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES;
    popAt(ctx, t, M0[0].t, W / 2, 570, (c) => {
      card(c, -300, -60, 600, 120, { fill: C.yellow, seed: 61, shadow: 9, r: 40 });
      he(c, 'דמי כיס: ⁦40⁩ ₪ בשבוע 💰', 0, 20, { size: 54, w: 900, maxW: 560 });
    }, { dur: 0.3, over: 1.6, rot: -0.01 });
    const fill = clamp((t - ev.mode) / 0.9), shown = UI.fadeIn(t, ev.mode + 0.35, 0.3);
    S.JARS.forEach((j, k) => {
      const x = 805 - k * 265;
      popAt(ctx, t, M0[k + 1].t, x, 960, (c) => { c.scale(0.97, 0.97); jar(c, j, fill, shown, t); }, { dur: 0.3, over: 1.5, rot: [0.012, -0.01, 0.012][k] });
    });
    UI.tap(ctx, 540, 1000, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 130 });
    popAt(ctx, t, S.pills[4], W / 2, 1330, (c) => pill(c, 0, 0, 'מחלקים ברגע שהכסף מגיע', { size: 48, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1460, (c) => pill(c, 0, 0, '🧮 מחשבון דמי כיס באתר', { size: 48, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. SAVING FOR A GOAL =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const g = S.GOAL;
    popAt(ctx, t, T(8, 0.05), W / 2, 590, (c) => {
      card(c, -SAFE.w / 2, -70, SAFE.w, 140, { fill: '#fff8de', r: 34, seed: 80, shadow: 10 });
      he(c, `🎧 אוזניות ב־⁦${g.price}⁩ ₪`, 0, 25, { size: 66, w: 900, maxW: SAFE.w - 60 });
    }, { dur: 0.3, over: 1.5, rot: -0.008 });
    popAt(ctx, t, S.pills[6], W / 2, 750, (c) => pill(c, 0, 0, `בקופה כבר: ⁦${g.saved}⁩ ₪`, { size: 52, w: 900, bg: C.lilac, seed: 81, maxW: SAFE.w }), { rot: 0.015 });
    popAt(ctx, t, S.pills[7], W / 2, 880, (c) => pill(c, 0, 0, `חוסכים ⁦${g.week}⁩ ₪ בשבוע`, { size: 52, w: 900, bg: C.lilac, seed: 82, maxW: SAFE.w }), { rot: -0.015 });
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    ctx.save(); ctx.translate(W / 2, 1020); ctx.scale(press, press);
    pill(ctx, 0, 0, 'כמה שבועות? ←', { size: 48, w: 900, bg: C.orange, fg: '#fff', padX: 56, seed: 83 });
    ctx.restore();
    UI.tap(ctx, W / 2 + 60, 1030, t, ev.go, { color: 'rgba(20,22,45,0.7)', size: 120 });
    // twelve weekly cells fill in one by one between the tap and the answer
    const prog = clamp((t - ev.go) / (ev.ans - ev.go)) * g.weeks;
    for (let k = 0; k < g.weeks; k++) {
      const col = k % 6, row = Math.floor(k / 6), x = 810 - col * 144, y = 1160 + row * 110, on = prog >= k + 1;
      G.rrect(ctx, x - 52, y - 40, 104, 80, 18, { fill: on ? C.green : '#fff', lw: on ? 4 : 3, seed: 90 + k, stroke: on ? C.ink : C.line });
      he(ctx, String(k + 1), x, y + 16, { size: 40, w: 900, color: on ? '#fff' : '#b9c0d4', dir: 'ltr' });
    }
    popAt(ctx, t, ev.ans, W / 2, 1440, (c) => pill(c, 0, 0, '⁦12⁩ שבועות 🎉', { size: 68, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1400, { n: 70, seed: 6, spread: 900 });
    popAt(ctx, t, S.pills[8], W / 2, 1560, (c) => pill(c, 0, 0, 'מטרה טובה: ברורה, עם מחיר ועם זמן', { size: 42, w: 900, bg: C.yellow, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. ONLINE MONEY SAFETY =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.SCAMS.forEach(([emoji, title, note], n) => {
      const it = S.sheetItems[n], y = 600 + n * 175;
      popAt(ctx, t, it.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -72, SAFE.w, 144, { fill: '#fff', r: 28, seed: 100 + n, shadow: 8, lw: 3.5 });
        he(c, emoji, SAFE.w / 2 - 70, 24, { size: 70, w: 400 });
        he(c, title, SAFE.w / 2 - 140, -8, { size: 44, w: 900, align: 'right', maxW: SAFE.w - 300 });
        he(c, note, SAFE.w / 2 - 140, 42, { size: 32, w: 500, align: 'right', color: C.muted, maxW: SAFE.w - 300 });
        const p = (t - ev.printBtn - n * 0.25) / 0.3;
        if (p > 0) { c.save(); c.translate(-SAFE.w / 2 + 70, 0); const s = ease.outBack(clamp(p), 2); c.scale(s, s); c.fillStyle = C.red; c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.fill(); he(c, '⚠️', 0, 15, { size: 44, w: 400 }); c.restore(); }
      }, { dur: 0.28, over: 1.6, rot: [0.008, -0.008][n % 2] });
    });
    UI.tap(ctx, 540, 700, t, ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 120 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1380, (c) => pill(c, 0, 0, 'פרטי כרטיס לא נותנים לאף אחד', { size: 46, w: 900, bg: C.red, fg: '#fff', seed: 67, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1510, (c) => pill(c, 0, 0, 'ובסוף: פרויקט תקציב משפחתי', { size: 46, w: 900, bg: C.yellow, seed: 68, maxW: SAFE.w }), { rot: 0.02 });
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
    he(ctx, 'חינוך פיננסי לילדים ולנוער', W / 2, 1000, { size: 54, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'קורס חינם, 7 שיעורים', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בעמוד הקורסים: חינוך פיננסי 💰', W / 2, 1350, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
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
