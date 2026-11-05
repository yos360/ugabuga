// THE FILM (9:16): "מילה אחת". A hook, four solved proverbs with a 3-second count, a fifth left open, and an end card
// that keeps the open board on screen while people type their answer. Site look, Heebo, pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, clock, stages, endStart } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', card: '#ffffff', gold: '#ffd23f', tile: '#e9e6f5' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

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
  function card(ctx, x, y, w, h, { fill = C.card, r = 34, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink } = {}) {
    if (shadow) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke, amp: 1 });
  }
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, seed = 3, shadow = 7, dir = 'rtl', fam, maxW } = {}) {
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam) + padX * 2; if (mw > maxW) sz *= maxW / mw; }
    const ww = measure(ctx, s, sz, w, fam) + padX * 2, hh = sz * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + sz * 0.36, { size: sz, w, color: fg, dir, fam });
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
  }
  function dots(x, a) {
    x.fillStyle = `rgba(20,22,45,${a})`;
    for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
  }
  function bg(ctx) { ctx.drawImage(Studio.cache('bg', (x) => { x.fillStyle = C.paper; x.fillRect(0, 0, W, H); dots(x, 0.09); }, { variants: 1 }), 0, 0, W, H); }
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H); dots(x, 0.06);
    }, { variants: 1 }), 0, 0, W, H);
  }
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }

  // The words flow from the right and wrap, like a sentence. A tile is as wide as its word, which is a fair hint.
  function layout(ctx, words, size, width) {
    const padX = size * 0.42, gap = size * 0.26, h = size * 1.72, rows = [[]];
    let used = 0;
    words.forEach((w, k) => {
      const tw = Math.max(measure(ctx, w, size, 900) + padX * 2, size * 1.9);
      if (used + tw > width && rows[rows.length - 1].length) { rows.push([]); used = 0; }
      rows[rows.length - 1].push({ w, k, tw });
      used += tw + gap;
    });
    const out = [];
    rows.forEach((row, r) => {
      const total = row.reduce((n, x) => n + x.tw, 0) + gap * (row.length - 1);
      let x = W / 2 + total / 2;
      row.forEach((c) => { out[c.k] = { cx: x - c.tw / 2, r, tw: c.tw, h }; x -= c.tw + gap; });
    });
    return { cells: out, rows: rows.length, h, gap };
  }
  function tiles(ctx, s, t, cy, size, width, { open = false } = {}) {
    const L = layout(ctx, s.words, size, width);
    const rowH = L.h + L.gap * 1.3, top = cy - (L.rows * rowH) / 2 + rowH / 2;
    s.tiles.forEach((p) => {
      const c = L.cells[p.k], y = top + c.r * rowH, keep = p.k === s.shown;
      const flipAt = s.reveal ? s.reveal + (Math.abs(p.k - s.shown) * 0.07) : Infinity;
      const f = keep ? 1 : clamp((t - flipAt) / 0.2);
      const sx = keep || f === 0 || f === 1 ? 1 : Math.abs(Math.cos(f * Math.PI));
      const shown = keep || f >= 0.5;
      popAt(ctx, open ? 1e6 : t, open ? 0 : p.t, c.cx, y, (x) => {
        x.scale(sx, 1);
        card(x, -c.tw / 2, -c.h / 2, c.tw, c.h, { fill: keep ? C.gold : shown ? '#dff5e6' : C.tile, r: 18, seed: 300 + s.i * 10 + p.k, shadow: 6, lw: 3.5 });
        if (shown) he(x, p.w, 0, size * 0.36, { size, w: 900, color: C.ink });
      }, { dur: 0.22, over: 2 });
    });
  }

  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.one, W / 2, 330, (c) => he(c, 'מילה אחת.', 0, 50, { size: 150, w: 900, maxW: SAFE.w }), { rot: -0.02, dur: 0.3 });
    popAt(ctx, t, ev.two, W / 2, 520, (c) => he(c, 'פתגם שלם.', 0, 50, { size: 150, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.015, dur: 0.3 });
    popAt(ctx, t, ev.ask, W / 2, 720, (c) => pill(c, 0, 0, 'עד איזה שלב תגיעו?', { size: 66, w: 900, bg: C.blue, fg: '#fff', padX: 44, maxW: SAFE.w, seed: 101 }), { rot: -0.03 });
    mascot(ctx, W / 2, 1210 - hop(t, 10), 560, t, ev.two);
  }

  function shotLevel(s) {
    return (ctx, t) => {
      bg(ctx);
      // five dots: how far along
      const gap = 92, x0 = W / 2 + 2 * gap;
      stages.forEach((o, i) => {
        const cx = x0 - i * gap, done = i < s.i || (i === s.i && t >= s.up), here = i === s.i;
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + 3, 214, here ? 37 : 31, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = done ? C.green : here ? s.color : '#fff'; ctx.beginPath(); ctx.arc(cx, 210, here ? 36 : 30, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
        he(ctx, done ? '✓' : String(i + 1), cx, 210 + 15, { size: 42, w: 900, dir: 'ltr', color: done || here ? '#fff' : C.ink });
      });
      popAt(ctx, t, s.t0 + 0.05, W / 2, 345, (c) => pill(c, 0, 0, `שלב ⁦${s.i + 1}⁩: ${s.label}`, { size: 54, w: 900, bg: s.color, fg: '#fff', padX: 40, seed: 200 + s.i }), { rot: -0.015 });
      he(ctx, 'מה הפתגם?', W / 2, 500, { size: 76, w: 900, alpha: UI.fadeIn(t, s.t0 + 0.1, 0.2) });
      let size = 74; while (size > 56 && layout(ctx, s.words, size, SAFE.w).rows > 2) size -= 2;
      tiles(ctx, s, t, 830, size, SAFE.w);

      const cur = s.ticks.filter((k) => t >= k.t).pop();
      const up = t >= s.up;
      if (s.reveal && up) {
        popAt(ctx, t, s.reveal + 0.35, W / 2, 1270, (c) => pill(c, 0, 0, '✅ פתרתם? ממשיכים', { size: 54, w: 900, bg: '#dff5e6', padX: 40, seed: 220 + s.i, maxW: SAFE.w }), { rot: 0.015 });
      } else if (cur) {
        const cx = W / 2, cy = 1300, r = 112, urgent = cur.n <= 2;
        const total = s.ticks.length * 2 * S.BEAT, frac = clamp(1 - (t - s.ticks[0].t) / total);
        popAt(ctx, t, s.ticks[0].t, cx, cy, (c) => {
          c.fillStyle = C.ink; c.beginPath(); c.arc(8, 10, r, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
          c.strokeStyle = urgent ? C.red : s.color; c.lineWidth = 20; c.lineCap = 'round';
          if (frac > 0) { c.beginPath(); c.arc(0, 0, r - 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke(); }
          c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
          const k = 1 + 0.12 * pulse(t, cur.t, 10); c.scale(k, k);
          he(c, String(cur.n), 0, 40, { size: 118, w: 900, dir: 'ltr', color: urgent ? C.red : C.ink });
        }, { dur: 0.25 });
      }
      if (s.open && t >= s.up) popAt(ctx, t, s.up, W / 2, 1300, (c) => pill(c, 0, 0, 'מי יודע? 🤯', { size: 70, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 240 }), { rot: -0.03 });
    };
  }

  // The open board stays here, so people can see it while they type.
  function shotEnd(ctx, t) {
    heroBg(ctx);
    const s = stages[4];
    popAt(ctx, t, ev.comment, W / 2, 285, (c) => {
      card(c, -SAFE.w / 2, -135, SAFE.w, 270, { fill: C.yellow, r: 40, seed: 401, shadow: 14 });
      he(c, '✍️ מה הפתגם?', 0, -22, { size: 88, w: 900, maxW: SAFE.w - 60 });
      he(c, 'כתבו בתגובות 👇', 0, 86, { size: 80, w: 900, color: C.blue, maxW: SAFE.w - 60 });
    }, { rot: -0.015, dur: 0.4 });
    tiles(ctx, s, t, 595, 58, SAFE.w * 58 / 74, { open: true });
    popAt(ctx, t, ev.send, W / 2, 800, (c) => pill(c, 0, 0, '📣 שלחו למי שתמיד יודע הכול', { size: 54, w: 900, bg: C.red, fg: '#fff', seed: 405, padX: 38, maxW: SAFE.w }), { rot: -0.012 });
    popAt(ctx, t, ev.next, W / 2, 925, (c) => pill(c, 0, 0, '👀 הפתרון של שלב 5 באתר', { size: 52, w: 900, bg: '#fff', seed: 404, padX: 38, maxW: SAFE.w }), { rot: 0.012 });
    mascot(ctx, W / 2, 1185, 320, t, ev.logo);
    popAt(ctx, t, ev.url, W / 2, 1420, (c) => pill(c, 0, 0, 'ugabuga.co.il/riddles/one-word', { size: 52, maxW: SAFE.w, w: 600, bg: C.blue, fg: '#fff', padX: 44, dir: 'ltr', fam: 'Fredoka', seed: 403 }));
    he(ctx, 'ועוד חידות, משחקים ודפים להדפסה, בחינם', W / 2, 1530, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.url + 0.3, 0.25), maxW: SAFE.w });
  }

  const SECTIONS = [
    { t0: 0, fn: shotHook, color: C.red },
    ...stages.map(s => ({ t0: s.t0, fn: shotLevel(s), color: s.color })),
    { t0: endStart, fn: shotEnd, color: C.red },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.logo = await Studio.loadImage('img/mascot.png').catch(() => null);
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
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
