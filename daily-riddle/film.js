// THE FILM (9:16) — "החידה היומית": one hard riddle (riddle.js), a 10-second countdown and a call to answer in
// the comments, like, share & tag; the end card sends to the riddle's page for the solution (no answers in the
// video). Four board kinds: seq (a row of boxes, the last is "?"), eq (equation lines), text (a riddle told in a
// few lines), image (a drawing from daily-riddle/img/, also on the site). Site look, Heebo, pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock, R } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', card: '#ffffff', gold: '#ffd23f' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));
  const HEB = /[֐-׿]/;
  const iso = (s) => (HEB.test(s) ? s : `⁦${s}⁩`); // keep numbers in Hebrew lines in order

  // ---------- Hebrew text (Chrome RTL shaping, the site's font) ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", sans-serif`;
  function measure(ctx, s, size, w = 800, fam) { ctx.save(); ctx.font = fontOf(size, w, fam); ctx.direction = 'rtl'; const mm = ctx.measureText(s).width; ctx.restore(); return mm; }
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
    const ww = measure(ctx, s, sz, w, fam) + padX * 2, hh = h || sz * 1.75;
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
  function dots(x, a) {
    x.fillStyle = `rgba(20,22,45,${a})`;
    for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
  }
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => { x.fillStyle = C.paper; x.fillRect(0, 0, W, H); dots(x, 0.09); }, { variants: 1 }), 0, 0, W, H);
  }
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H); dots(x, 0.06);
    }, { variants: 1 }), 0, 0, W, H);
  }

  // the mascot (the owner's logo character, cut out); falls back to the old logo
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }
  // the yellow "?" piece, breathing
  function qMark(c, t, t0, size) {
    const k = 1 + 0.08 * Math.sin((t - t0) * 7);
    c.scale(k, k);
    he(c, '?', 0, size * 0.36, { size, w: 900, dir: 'ltr' });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.hard, W / 2, 470, (c) => {
      he(c, '🧠', 0, -170, { size: 150, w: 400 });
      he(c, 'החידה היומית', 0, 40, { size: 128, w: 900, maxW: SAFE.w });
      pill(c, 0, 150, `⁦#${R.n}⁩`, { size: 54, w: 900, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', seed: 101 });
    }, { rot: -0.03, dur: 0.35 });
    he(ctx, 'גם מבוגרים נתקעים בה', W / 2, 760, { size: 60, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.sub, 0.25) });
    const sp = clamp((t - ev.ready) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.ready + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 910); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '⏱️ יש לכם 10 שניות לפתור!', { size: 64, w: 900, bg: C.red, fg: '#fff', padX: 44, maxW: SAFE.w });
      ctx.restore();
    }
    mascot(ctx, W / 2, 1330 - hop(t, 10) * (t > ev.sub + 0.5 ? 1 : 0), 480, t, ev.sub);
  }

  // ================= THE BOARD =================
  const BOARD = { top: 470, bottom: 1170 };
  const MID = (BOARD.top + BOARD.bottom) / 2;
  function boardSeq(ctx, t) {
    const n = S.spots.length, gap = 16;
    const bw = Math.min(170, (SAFE.w - gap * (n - 1)) / n), bh = bw * 1.2;
    const total = n * bw + (n - 1) * gap, x0 = W / 2 - total / 2;
    S.spots.forEach((s) => {
      const slot = R.dir === 'rtl' ? n - 1 - s.i : s.i;
      const cx = x0 + slot * (bw + gap) + bw / 2;
      const isQ = s.label === '?';
      popAt(ctx, t, s.t, cx, MID, (c) => {
        card(c, -bw / 2, -bh / 2, bw, bh, { fill: isQ ? C.gold : C.card, r: 22, seed: 300 + s.i, shadow: 9, lw: 4 });
        if (isQ) qMark(c, t, s.t, bw * 0.62);
        else he(c, s.label, 0, bw * 0.2, { size: bw * 0.55, w: 900, dir: HEB.test(s.label) ? 'rtl' : 'ltr', maxW: bw - 18, color: C.ink });
      }, { dur: 0.25, over: 2.2 });
    });
    // a little arrow under the row shows the reading direction
    const a = UI.fadeIn(t, S.spots[n - 1].t + 0.2, 0.3);
    he(ctx, R.dir === 'rtl' ? '← קוראים מימין לשמאל' : 'קוראים משמאל לימין →', W / 2, MID + bh / 2 + 90, { size: 40, w: 600, color: C.muted, alpha: a });
  }
  function boardEq(ctx, t) {
    const n = S.spots.length, gap = 24;
    const lh = Math.min(140, (BOARD.bottom - BOARD.top - gap * (n - 1)) / n);
    const y0 = MID - (n * lh + (n - 1) * gap) / 2;
    S.spots.forEach((s) => {
      const cy = y0 + s.i * (lh + gap) + lh / 2, isQ = s.i === n - 1;
      const heb = HEB.test(s.label);
      popAt(ctx, t, s.t, W / 2, cy, (c) => {
        card(c, -SAFE.w / 2, -lh / 2, SAFE.w, lh, { fill: isQ ? (/\p{Extended_Pictographic}/u.test(s.label) ? C.lilac : C.gold) : C.card, r: 26, seed: 320 + s.i, shadow: 9, lw: 4 });
        he(c, s.label, 0, lh * 0.2, { size: lh * 0.52, w: 900, dir: heb ? 'rtl' : 'ltr', maxW: SAFE.w - 70 });
      }, { dur: 0.25, over: 2.0, rot: (s.i % 2 ? 0.01 : -0.01) });
    });
  }
  function boardText(ctx, t) {
    const n = S.spots.length, lh = n > 4 ? 100 : 120, size = n > 4 ? 66 : 78;
    const ch = n * lh + 90, cy0 = MID - ch / 2;
    popAt(ctx, t, S.spots[0].t - 0.15, W / 2, MID, (c) => card(c, -SAFE.w / 2, -ch / 2, SAFE.w, ch, { fill: C.card, r: 40, seed: 340, shadow: 14 }), { dur: 0.3, over: 1.6 });
    S.spots.forEach((s) => {
      const y = cy0 + 45 + s.i * lh + lh * 0.68;
      const last = s.i === n - 1;
      he(ctx, s.label, W / 2, y + 30 * (1 - ease.outCubic(clamp((t - s.t) / 0.25))), { size, w: last ? 900 : 800, color: last ? C.red : C.ink, alpha: UI.fadeIn(t, s.t, 0.2), maxW: SAFE.w - 80 });
    });
  }
  // a drawn riddle: the same drawing that is on the site (img/<R.image>), framed on the board
  function boardImage(ctx, t) {
    const w = SAFE.w + 40, h = w * 700 / 900;
    popAt(ctx, t, S.spots[0].t, W / 2, MID, (c) => {
      card(c, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, { fill: C.card, r: 34, seed: 350, shadow: 12 });
      if (IMG.board) c.drawImage(IMG.board, -w / 2, -h / 2, w, h);
    }, { dur: 0.3, over: 1.6 });
  }
  function shotBoard(ctx, t) {
    bg(ctx);
    popAt(ctx, t, T(2), W / 2, 200, (c) => pill(c, 0, 0, `🧠 החידה היומית ⁦#${R.n}⁩`, { size: 40, w: 800, bg: C.lilac, padX: 30, seed: 201 }), { dur: 0.25 });
    he(ctx, R.title, W / 2, 360, { size: 84, w: 900, maxW: SAFE.w, alpha: UI.fadeIn(t, T(2) + 0.1, 0.2) });
    if (R.kind === 'seq') boardSeq(ctx, t); else if (R.kind === 'eq') boardEq(ctx, t); else if (R.kind === 'image') boardImage(ctx, t); else boardText(ctx, t);
    popAt(ctx, t, ev.ask, W / 2, 1265, (c) => pill(c, 0, 0, R.ask, { size: 48, w: 900, bg: C.yellow, padX: 40, seed: 310, maxW: SAFE.w }), { rot: -0.02 });

    // the countdown
    const started = t >= ev.count, up = t >= ev.ring;
    if (started) {
      const cur = S.ticks.filter((k) => t >= k.t).pop();
      const cx = W / 2, cy = 1530, r = 120;
      const frac = up ? 0 : clamp(1 - (t - ev.count) / (ev.ring - ev.count));
      const urgent = !up && cur && cur.n <= 3;
      popAt(ctx, t, ev.count, cx, cy, (c) => {
        c.fillStyle = C.ink; c.beginPath(); c.arc(8, 10, r, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
        c.strokeStyle = urgent || up ? C.red : C.blue; c.lineWidth = 22; c.lineCap = 'round';
        if (frac > 0) { c.beginPath(); c.arc(0, 0, r - 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke(); }
        c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
        const k = cur ? 1 + 0.12 * pulse(t, cur.t, 10) : 1;
        c.scale(k, k);
        he(c, up ? '0' : String(cur ? cur.n : 10), 0, 40, { size: 120, w: 900, dir: 'ltr', color: urgent || up ? C.red : C.ink });
      }, { dur: 0.3 });
      if (urgent) {
        ctx.save(); ctx.globalAlpha = 0.12 * pulse(t, cur.t, 6); ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
    }
  }

  // ================= END: answer in the comments, like, share & tag — the solution is only on the site =================
  // Never show an answer here (not today's, not yesterday's): the solution lives on the riddle's page.
  function shotEnd(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.comment, W / 2, 300, (c) => {
      card(c, -SAFE.w / 2, -165, SAFE.w, 330, { fill: C.yellow, r: 40, seed: 401, shadow: 14 });
      he(c, '⏰ נגמר הזמן!', 0, -68, { size: 62, w: 900, color: C.red });
      he(c, '✍️ כתבו את התשובה', 0, 30, { size: 80, w: 900, maxW: SAFE.w - 60 });
      he(c, 'בתגובות 👇', 0, 122, { size: 80, w: 900, color: C.blue });
    }, { rot: -0.02, dur: 0.4 });
    popAt(ctx, t, ev.comment + 0.5, W / 2, 560, (c) => pill(c, 0, 0, '👍 לייק אם פתרתם', { size: 52, w: 900, bg: '#fff', seed: 404, padX: 38, maxW: SAFE.w }), { rot: 0.015 });
    popAt(ctx, t, ev.comment + 0.9, W / 2, 690, (c) => pill(c, 0, 0, '📣 שתפו ותייגו חבר שלא יפתור', { size: 50, w: 900, bg: C.red, fg: '#fff', seed: 405, padX: 38, maxW: SAFE.w }), { rot: -0.015 });
    mascot(ctx, W / 2, 960, 330, t, ev.logo);
    const L = S.endLines;
    he(ctx, 'הפתרון באתר 👇', W / 2, 1220, { size: 64, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1340, (c) => pill(c, 0, 0, `ugabuga.co.il/riddles/${R.id}`, { size: 54, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 403, maxW: SAFE.w }));
    he(ctx, '🗓️ חידה חדשה כל יום ב־⁦14:00⁩', W / 2, 1490, { size: 46, w: 800, alpha: UI.fadeIn(t, L[2].t, 0.25), maxW: SAFE.w });
    he(ctx, 'עוד חידות, משחקים ודפים להדפסה — בחינם', W / 2, 1580, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 960, { n: 70, seed: 9, spread: 950 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook, color: C.red },
    { t0: T(2), fn: shotBoard, color: C.blue },
    { t0: T(9), fn: shotEnd, color: C.red },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const Ld = (n) => Studio.loadImage(n).catch(() => null);
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.logo = (await Ld('img/mascot.png')) || (await Ld('img/logo.svg'));
      if (R.image) IMG.board = await Ld(`img/${R.image}`);
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        ctx.fillStyle = sec.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
