// THE FILM (9:16) — "ספר — כמה דרכים לקרוא?": the automatic nakdan in the site own look. Pure function of t.
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


  // ---------- sentence layout: two lines, RTL, word by word ----------
  const LINES = [[0, 1], [2, 3, 4]];
  const FONTSZ = 76;
  function layout(ctx, words, size, cx, top, lineH) {
    const out = [];
    LINES.forEach((ln, li) => {
      const ws = ln.map((i) => measure(ctx, words[i], size, 700));
      const gap = size * 0.4, total = ws.reduce((s, v) => s + v, 0) + gap * (ln.length - 1);
      let x = cx + total / 2;
      ln.forEach((i, k) => { out[i] = { x: x - ws[k] / 2, w: ws[k], y: top + li * lineH }; x -= ws[k] + gap; });
    });
    return out;
  }
  // a card with the sentence; each word: { text, show (0..1 alpha), hi, ring }
  function sentence(ctx, t, { top, size = FONTSZ, words, shown, hiIdx = -1, hiColor = C.green, ringIdx = -1, ringT = 0, plainIdx = -1, tint = false, h }) {
    const lineH = size * 1.55, hh = h || lineH * 2 + 40;
    card(ctx, W / 2 - SAFE.w / 2, top, SAFE.w, hh, { fill: tint ? C.lilac : '#fff', stroke: tint ? C.purple : C.ink, r: 34, seed: 7, shadow: 10 });
    const L = layout(ctx, words, size, W / 2, top + 30 + size * 1.05, lineH);
    words.forEach((wd, i) => {
      const p = shown[i]; if (p <= 0) return;
      const o = L[i], txt = i === plainIdx ? S.AUD[i].label : wd;
      ctx.save(); ctx.translate(o.x, o.y); const sc = 0.8 + 0.2 * ease.outBack(clamp(p), 2); ctx.scale(sc, sc);
      if (tint || i === hiIdx) { G.rrect(ctx, -o.w / 2 - 12, -size * 0.92, o.w + 24, size * 1.35, 18, { fill: i === hiIdx ? hiColor : '#ede3ff', lw: 0, seed: 20 + i, stroke: 'rgba(0,0,0,0)' }); }
      he(ctx, txt, 0, 0, { size, w: 700, color: i === hiIdx ? '#fff' : C.ink, alpha: clamp(p * 2) });
      if (i === ringIdx && t >= ringT) G.rrect(ctx, -o.w / 2 - 14, -size * 0.94, o.w + 28, size * 1.4, 18, { fill: null, lw: 6, seed: 30 + i, stroke: C.purple });
      ctx.restore();
    });
    return L;
  }
  const allShown = (list, t) => list.map((x) => UI.fadeIn(t, x.t, 0.2));

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🪄 חידת ניקוד', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 590, (c) => he(c, 'ספר', 0, 0, { size: 300, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 790, (c) => he(c, 'כמה דרכים יש', 0, 0, { size: 110, w: 900, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 940, (c) => he(c, 'לקרוא אותה?', 0, 0, { size: 140, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    S.hookOpts.forEach((o) => {
      const x = 800 - o.i * 260;
      popAt(ctx, t, o.t, x, 1150, (c) => {
        card(c, -115, -100, 230, 200, { seed: 20 + o.i, shadow: 10, r: 34 });
        he(c, o.s, 0, 36, { size: 110, w: 900, dir: 'ltr' });
      }, { rot: [-0.02, 0.02, -0.015][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(760, 1400); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ענו בראש… 🤔', { size: 56, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 295, 1580 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 440, t, ev.q2);
  }

  // ================= 1. PASTE THE TEXT =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const shown = allShown(S.AUD, t);
    // the text box (the page placeholder sentence is typed in)
    popAt(ctx, t, S.steps[0].t + 0.2, W / 2, 800, (c) => {
      card(c, -SAFE.w / 2, -250, SAFE.w, 500, { fill: '#fff', r: 34, seed: 31, shadow: 10 });
      he(c, 'הדביקו כאן טקסט בעברית', SAFE.w / 2 - 40, -190, { size: 34, w: 500, color: shown[0] > 0 ? 'rgba(0,0,0,0)' : '#9aa0b8', align: 'right' });
    }, { dur: 0.25, over: 1.4 });
    const n = S.AUD.filter((a) => t >= a.t).map((a) => a.label).join(' ').length;
    // words at box position
    const top = 800 - 250 + 40;
    const lay = layout(ctx, S.AUD.map((a) => a.label), 80, W / 2, top + 95, 125);
    S.AUD.forEach((a, i) => {
      if (shown[i] <= 0) return;
      he(ctx, a.label, lay[i].x, lay[i].y + 30, { size: 80, w: 600, alpha: clamp(shown[i] * 2) });
    });
    he(ctx, `⁦${n}/3000⁩`, W / 2 - SAFE.w / 2 + 40, 1020, { size: 32, w: 500, color: C.muted, align: 'left', dir: 'ltr' });
    // the button
    const press = t >= ev.pick ? 1 - 0.08 * pulse(t, ev.pick, 10) : 1;
    ctx.save(); ctx.translate(W / 2, 1160); ctx.scale(press, press);
    pill(ctx, 0, 0, t >= ev.pick + 0.12 ? 'מנקד…' : '🪄 נקדו לי', { size: 58, w: 900, bg: C.purple, fg: '#fff', padX: 70, seed: 33 });
    ctx.restore();
    UI.tap(ctx, W / 2 + 40, 1175, t, ev.pick, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1430, (c) => pill(c, 0, 0, 'עד ⁦3,000⁩ תווים בכל פעם', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1550, (c) => pill(c, 0, 0, 'בחינם ובלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. THE VOCALIZED RESULT =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    popAt(ctx, t, T(4, 0.05), W / 2, 590, (c) => pill(c, 0, 0, 'הטקסט המנוקד', { size: 46, w: 900, bg: C.purple, fg: '#fff', seed: 41 }), { rot: -0.02, dur: 0.25 });
    sentence(ctx, t, { top: 680, size: 104, words: S.TOPICS.map((o) => o.label), shown: allShown(S.TOPICS, t), tint: true, ringIdx: t >= ev.topic ? S.TOPIC_PICK : -1, ringT: ev.topic });
    const L = layout(ctx, S.TOPICS.map((o) => o.label), 104, W / 2, 680 + 30 + 104 * 1.05, 104 * 1.55);
    UI.tap(ctx, L[S.TOPIC_PICK].x, L[S.TOPIC_PICK].y - 20, t, ev.topic, { color: 'rgba(138,79,216,0.8)', size: 130 });
    popAt(ctx, t, S.pills[2], W / 2, 1230, (c) => pill(c, 0, 0, 'הניקוד באדיבות מפעל דיקטה', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1360, (c) => pill(c, 0, 0, 'לכל מילה ניקוד לפי ההקשר', { size: 48, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. PICK ANOTHER VOCALIZATION =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, none = t >= ev.mode;
    popAt(ctx, t, M0[0].t - 0.05, W / 2, 0, () => {}, {});
    sentence(ctx, t, { top: 490, size: 60, words: S.TOPICS.map((o) => o.label), shown: S.TOPICS.map(() => 1), tint: true, plainIdx: none ? S.TOPIC_PICK : -1, h: 260 });
    popAt(ctx, t, M0[0].t, W / 2, 1070, (c) => {
      card(c, -SAFE.w / 2, -280, SAFE.w, 560, { fill: '#fff', stroke: C.purple, r: 34, seed: 61, shadow: 10 });
      he(c, 'הניקוד של ״שיחקו״', SAFE.w / 2 - 40, -190, { size: 54, w: 900, align: 'right' });
      he(c, '✕', -SAFE.w / 2 + 60, -185, { size: 50, w: 600, color: C.muted });
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    S.OPTS.forEach((o, k) => {
      const x = 780 - k * 270 + (k === 2 ? 20 : 0), y = 1060, on = none ? k === 2 : k === 0, w = k === 2 ? 270 : 240;
      popAt(ctx, t, M0[k + 1].t, x, y, (c) => {
        G.rrect(c, -w / 2, -60, w, 120, 26, { fill: on ? '#ede3ff' : '#fff', lw: on ? 5 : 3, seed: 70 + k, stroke: on ? C.purple : C.line });
        he(c, o, 0, 26, { size: k === 2 ? 40 : 56, w: on ? 900 : 600, maxW: w - 20 });
      }, { dur: 0.25, over: 1.7, rot: [0.01, -0.01, 0.01][k] });
    });
    popAt(ctx, t, M0[3].t + 0.3, W / 2, 1240, (c) => {
      G.rrect(c, -SAFE.w / 2 + 40, -48, SAFE.w - 80, 96, 22, { fill: '#f8f9fd', lw: 3, seed: 78, stroke: C.line });
      he(c, 'תיקון ידני', SAFE.w / 2 - 70, 14, { size: 38, w: 500, color: C.muted, align: 'right' });
    }, { dur: 0.25, over: 1.3 });
    UI.tap(ctx, 520, 1090, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 130 });
    popAt(ctx, t, S.pills[4], W / 2, 1460, (c) => pill(c, 0, 0, 'מילים שנכתבות אותו דבר ונקראות אחרת', { size: 42, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1580, (c) => pill(c, 0, 0, 'כדאי לעבור על הטקסט, במיוחד על שמות', { size: 42, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. MANUAL FIX =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    popAt(ctx, t, T(8, 0.05), W / 2, 590, (c) => pill(c, 0, 0, 'הניקוד של ״שיחקו״', { size: 50, w: 900, bg: C.purple, fg: '#fff', seed: 81 }), { rot: -0.015, dur: 0.25 });
    popAt(ctx, t, S.pills[6], W / 2, 770, (c) => {
      G.rrect(c, -SAFE.w / 2, -90, SAFE.w, 180, 30, { fill: '#fff', lw: 5, seed: 82, stroke: C.purple });
      he(c, S.FIX.draft, SAFE.w / 2 - 50, 30, { size: 100, w: 700, align: 'right' });
      he(c, 'תיקון ידני', -SAFE.w / 2 + 40, -40, { size: 30, w: 500, color: C.muted, align: 'left' });
    }, { rot: 0.008, dur: 0.3 });
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, S.pills[7], W / 2, 970, (c) => { c.scale(press, press); pill(c, 0, 0, 'שמירת תיקון', { size: 54, w: 900, bg: C.purple, fg: '#fff', padX: 70, seed: 83 }); }, { rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 985, t, ev.go, { color: 'rgba(20,22,45,0.7)', size: 120 });
    const sp = UI.fadeIn(t, ev.ans, 0.25);
    if (sp > 0) {
      sentence(ctx, t, { top: 1080, size: 62, words: S.TOPICS.map((o) => o.label), shown: S.TOPICS.map(() => 1), tint: true, hiIdx: S.TOPIC_PICK, hiColor: C.green, h: 270 });
    }
    popAt(ctx, t, ev.ans, W / 2, 1010, (c) => {}, {});
    if (t >= ev.ans) {
      popAt(ctx, t, ev.ans + 0.05, W / 2, 1420, (c) => pill(c, 0, 0, '✅ התיקון נשמר', { size: 62, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
      confetti(ctx, t, ev.ans, W / 2, 1400, { n: 60, seed: 6, spread: 900 });
    }
    popAt(ctx, t, S.pills[8], W / 2, 1555, (c) => pill(c, 0, 0, 'כותבים בדיוק את הניקוד שרציתם', { size: 44, w: 900, bg: C.yellow, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. COPY =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.sheetItems.forEach((it) => {
      const x = it.i % 2 ? 340 : 740, y = 590 + Math.floor(it.i / 2) * 150;
      popAt(ctx, t, it.t, x, y, (c) => {
        card(c, -190, -58, 380, 116, { fill: '#fff', r: 30, seed: 100 + it.i, shadow: 8, lw: 3.5 });
        he(c, it.emoji, 130, 20, { size: 58, w: 400 });
        he(c, it.label, 90, 14, { size: 42, w: 800, align: 'right', maxW: 250 });
      }, { dur: 0.25, over: 1.6, rot: [0.01, -0.01][it.i % 2] });
    });
    const done = t >= ev.printBtn + 0.1;
    const press = t >= ev.printBtn ? 1 - 0.08 * pulse(t, ev.printBtn, 10) : 1;
    popAt(ctx, t, S.pills[11], W / 2, 1010, (c) => { c.scale(press, press); pill(c, 0, 0, done ? '✅ הועתק' : '📋 העתקת הטקסט המנוקד', { size: 56, w: 900, bg: done ? C.green : C.purple, fg: '#fff', padX: 56, seed: 111, maxW: SAFE.w }); }, { rot: -0.01 });
    UI.tap(ctx, W / 2 + 60, 1025, t, ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 120 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1290, (c) => pill(c, 0, 0, '✍️ מקלדת ניקוד לתיקון סימן בודד', { size: 46, w: 900, bg: '#fff', seed: 67, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1420, (c) => pill(c, 0, 0, 'מוכן לשיר, לברכה ולדף עבודה', { size: 46, w: 900, bg: C.yellow, seed: 68, maxW: SAFE.w }), { rot: 0.02 });
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
    he(ctx, 'נקדן אוטומטי לכל טקסט בעברית', W / 2, 1000, { size: 54, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בעמוד כלים: נקדן אוטומטי 🪄', W / 2, 1350, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
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
