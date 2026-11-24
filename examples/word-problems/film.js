// THE FILM (9:16) — "כמה כסף יהיה בקופה?": word problems by grade (/math/word-problems) in the site own look. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', lilacShadow: '#dcd0f7', line: '#dde2ed', card: '#ffffff', box: '#d9a76a', boxDark: '#b9824a' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = { c: {} };
  const N = (x) => '\u2066' + x + '\u2069';
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


  // one line if it fits, else the most balanced two-line split
  function wrap2(ctx, str, size, w, weight = 800) {
    if (measure(ctx, str, size, weight) <= w) return [str];
    const ws = str.split(' '); let best = [str], bw = 1e9;
    for (let k = 1; k < ws.length; k++) { const a = ws.slice(0, k).join(' '), b = ws.slice(k).join(' '), m = Math.max(measure(ctx, a, size, weight), measure(ctx, b, size, weight)); if (m < bw) { bw = m; best = [a, b]; } }
    return best;
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



  // a white drawing tile (the real webp thumbnail of the site) with an optional caption
  function art(c, key, cx, cy, size, { seed = 1, on = false, r = 26, shadow = 9 } = {}) {
    card(c, cx - size / 2, cy - size / 2, size, size, { fill: '#fff', r, seed, shadow, lw: on ? 6 : 4.5, stroke: on ? C.red : C.ink });
    const im = IMG.c[key];
    if (im) { c.save(); c.beginPath(); c.roundRect(cx - size / 2 + 8, cy - size / 2 + 8, size - 16, size - 16, r - 6); c.clip(); c.drawImage(im, cx - size / 2 + 12, cy - size / 2 + 12, size - 24, size - 24); c.restore(); }
  }
  const key = (p) => p.split('/').pop().replace(/\.webp$/, '');
  // one numbered option of the hook / end card: drawing + number badge + name
  function hookTile(c, i, cx, cy, size) {
    const o = S.HOOK[i];
    art(c, key(o.img), cx, cy, size, { seed: 20 + i });
    c.fillStyle = C.red; c.beginPath(); c.arc(cx + size / 2 - 22, cy - size / 2 + 22, 36, 0, Math.PI * 2); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
    he(c, String(i + 1), cx + size / 2 - 22, cy - size / 2 + 36, { size: 46, w: 900, color: '#fff', dir: 'ltr' });
    wrap2(c, o.name, 34, size + 20, 800).forEach((ln, k) => he(c, ln, cx, cy + size / 2 + 48 + k * 40, { size: 34, w: 800, maxW: size - 10 }));
  }

  // ---- small helpers for this reel ----
  // one real line of the problem, a card holding the text (RTL, right aligned)
  function probCard(c, w, h, lines, { ask, seed = 5, fill = '#fff', size = 46, askSize = 54 } = {}) {
    card(c, -w / 2, -h / 2, w, h, { fill, r: 32, seed, shadow: 11, lw: 4.5 });
    let y = -h / 2 + 30 + size;
    lines.forEach((ln) => { wrap(c, ln, size, w - 80, 600, 2).forEach((l2) => { he(c, l2, w / 2 - 40, y, { size, w: 600, align: 'right', maxW: w - 80 }); y += size * 1.35; }); });
    if (ask) wrap(c, ask, askSize, w - 80, 900, 2).forEach((l2) => { he(c, l2, w / 2 - 40, y + 12, { size: askSize, w: 900, align: 'right', color: C.red, maxW: w - 80 }); y += askSize * 1.3; });
  }
  const eq = (c, s, x, y, o = {}) => he(c, s, x, y, { dir: 'ltr', ...o });

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 330, (c) => pill(c, 0, 0, '📖 שאלות מילוליות · כיתה ג׳', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    const Q = S.HOOKQ;
    popAt(ctx, t, ev.q1, W / 2, 640, (c) => {
      card(c, -440, -210, 880, 420, { fill: '#fff', r: 34, seed: 7, shadow: 12, lw: 4.5 });
      he(c, Q.text1, 400, -110, { size: 62, w: 800, align: 'right', maxW: 800 });
      he(c, Q.text2, 400, -20, { size: 62, w: 800, align: 'right', maxW: 800 });
    }, { rot: -0.012 });
    popAt(ctx, t, ev.q2, W / 2, 640 + 110, (c) => he(c, Q.ask, 400, 20, { size: 66, w: 900, align: 'right', color: C.red, maxW: 800 }), { rot: 0.01, dur: 0.3 });
    // the three givens, one by one
    S.hookOpts.forEach((o) => {
      const cx = W / 2 + (1 - o.i) * 292, cy = 1060;
      popAt(ctx, t, o.t, cx, cy, (c) => {
        card(c, -140, -80, 280, 160, { fill: [C.yellow, C.blush, '#d6f6ff'][o.i], r: 28, seed: 20 + o.i, shadow: 8, lw: 4.5 });
        he(c, ['💰', '📅', '🗓️'][o.i], 0, -14, { size: 54, w: 700 });
        he(c, Q.given[o.i].split(' ').length === 2 ? Q.given[o.i] : Q.given[o.i], 0, 46, { size: 34, w: 900, maxW: 250 });
      }, { rot: [0.02, -0.015, 0.02][o.i], dur: 0.28, over: 1.7 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1290); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'כמה בקופה? כתבו בתגובות 👇', { size: 56, w: 900, bg: C.yellow, padX: 34, maxW: 760 });
      ctx.restore();
    }
    mascot(ctx, 240, 1525 - (t > ev.q2 + 0.45 ? hop(t, 8) : 0), 300, t, ev.q2);
    popAt(ctx, t, ev.free + 0.2, 680, 1525, (c) => {
      he(c, 'עוגה בוגה', 0, -10, { size: 76, w: 900, color: C.ink });
      he(c, 'שאלות מילוליות · חינם', 0, 55, { size: 42, w: 800, color: C.ink, maxW: 520 });
    }, { rot: 0.01 });
  }

  // ================= 1. FOUR STEPS =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.METHOD.forEach((mm, i) => {
      const col = i % 2, row = Math.floor(i / 2), cx = W / 2 + (col ? -235 : 235), cy = 760 + row * 380, on = t >= ev.pick && i === 2;
      popAt(ctx, t, S.AUD[i].t, cx, cy, (c) => {
        const pr = on ? 1 + 0.05 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr);
        card(c, -215, -165, 430, 330, { fill: on ? C.yellow : '#fff', r: 30, seed: 30 + i, shadow: 9, lw: on ? 6 : 4.5, stroke: on ? C.red : C.ink });
        he(c, mm.emoji, 0, -72, { size: 74, w: 700 });
        he(c, `${i + 1}. ${mm.title}`, 0, 16, { size: 42, w: 900, maxW: 390 });
        wrap(c, mm.text, 30, 380, 500, 3).forEach((ln, k) => he(c, ln, 0, 72 + k * 38, { size: 30, w: 500, color: C.muted, maxW: 390 }));
      }, { dur: 0.3, over: 1.4, rot: [0.01, -0.01, -0.008, 0.008][i] });
    });
    UI.tap(ctx, W / 2 + 235 - 40, 760 + 380 + 40, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1480, (c) => pill(c, 0, 0, 'קודם מבינים את הסיפור, ורק אז מחשבים', { size: 40, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1585, (c) => pill(c, 0, 0, 'כך לא נתקעים באמצע השאלה', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. PICK A GRADE =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    S.GRADES.forEach((g, i) => {
      const cy = 710 + i * 310, on = t >= ev.topic && i === S.GRADE_PICK;
      popAt(ctx, t, S.TOPICS[i].t, W / 2, cy, (c) => {
        const pr = on ? 1 + 0.04 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr);
        card(c, -440, -135, 880, 270, { fill: on ? C.yellow : '#fff', r: 32, seed: 50 + i, shadow: 10, lw: on ? 6 : 4.5, stroke: on ? C.red : C.ink });
        he(c, g.emoji, 350, 20, { size: 96, w: 700 });
        he(c, g.label, 280, -52, { size: 58, w: 900, align: 'right', maxW: 480 });
        g.levels.forEach((lv, k) => he(c, `${k + 1}. ${lv}`, 280, 4 + k * 46, { size: 34, w: 600, align: 'right', color: C.ink, maxW: 600 }));
      }, { dur: 0.28, over: 1.4, rot: [0.008, -0.008, 0.008][i] });
    });
    UI.tap(ctx, W / 2 - 90, 710 + 310 + 30, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.pills[2], W / 2, 1620, (c) => pill(c, 0, 0, '⁦12⁩ שאלות מקוריות לכל כיתה', { size: 42, w: 900, bg: C.yellow, seed: 61, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1725, (c) => pill(c, 0, 0, 'מכיתה ב׳ עד כיתה ד׳', { size: 40, w: 900, bg: C.lilac, seed: 62, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 3. WORKED SOLUTION =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const X = S.EX, M = S.MODES;
    popAt(ctx, t, M[0].t, W / 2, 650, (c) => probCard(c, 880, 290, [X.text], { ask: X.ask, size: 40, askSize: 44, seed: 71 }), { dur: 0.28, over: 1.3, rot: -0.008 });
    const rows = [
      { t: M[1].t, color: C.blue, ttl: 'מה שואלים?', draw: (c, y) => he(c, 'כמה מחברות יישארו בארון', 390, y, { size: 38, w: 700, align: 'right', maxW: 640 }), h: 120 },
      { t: M[1].t + 0.35, color: C.red, ttl: 'מה נתון?', draw: (c, y) => he(c, X.given.join(' · '), 390, y, { size: 33, w: 700, align: 'right', maxW: 700 }), h: 120 },
      { t: M[2].t, color: C.purple, ttl: 'איזו פעולה?', draw: (c, y) => { he(c, X.op + ':', 390, y - 6, { size: 34, w: 700, align: 'right' }); eq(c, X.steps.join('   ←   '), 390, y + 52, { size: 42, w: 900, align: 'right', color: C.ink, maxW: 780 }); }, h: 185 },
      { t: ev.mode, color: C.green, ttl: 'בודקים ועונים', draw: (c, y) => { eq(c, X.check + ' ✓', 390, y - 6, { size: 40, w: 800, align: 'right' }); if (t >= ev.fb3) he(c, X.sentence, 390, y + 54, { size: 42, w: 900, align: 'right', color: C.green, maxW: 780 }); }, h: 170 },
    ];
    let y = 860;
    rows.forEach((r, i) => {
      const cy = y + r.h / 2; y += r.h + 24;
      popAt(ctx, t, r.t, W / 2, cy, (c) => {
        card(c, -440, -r.h / 2, 880, r.h, { fill: '#fff', r: 28, seed: 80 + i, shadow: 8, lw: 4.5 });
        c.fillStyle = r.color; c.beginPath(); c.arc(-440 + 62, 0, 40, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        he(c, String(i + 1), -440 + 62, 16, { size: 50, w: 900, color: '#fff', dir: 'ltr' });
        he(c, r.ttl, 400, -r.h / 2 + 44, { size: 32, w: 900, align: 'right', color: r.color, maxW: 520 });
        r.draw(c, -r.h / 2 + 96);
      }, { dur: 0.26, over: 1.4, rot: [0.008, -0.008, 0.006, -0.006][i] });
    });
    popAt(ctx, t, S.pills[4], W / 2, 1685, (c) => pill(c, 0, 0, 'לכל שאלה פתרון מלא · בלי הרשמה', { size: 38, w: 900, bg: C.yellow, seed: 88, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. PRACTICE =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const P = S.PRAC, R = S.ROWS;
    popAt(ctx, t, R[0].t, W / 2, 700, (c) => {
      he(c, `שאלה ${N(P.n)} מתוך ${N(12)} · ${P.level}`, 440, -215, { size: 30, w: 600, color: C.muted, align: 'right', maxW: 860 });
      probCard(c, 880, 330, [P.text], { ask: P.ask, size: 44, askSize: 52, seed: 91 });
    }, { dur: 0.28, over: 1.3, rot: -0.008 });
    const typed = t >= T(8, 2.0) ? '18' : t >= T(8, 1.6) ? '1' : '';
    popAt(ctx, t, R[1].t, W / 2, 1050, (c) => {
      he(c, 'התשובה:', 430, 18, { size: 44, w: 900, align: 'right' });
      card(c, 90, -62, 190, 120, { fill: '#fff', r: 20, seed: 92, shadow: 6, lw: 4.5, stroke: t >= ev.ans ? C.green : C.ink });
      he(c, typed, 185, 28, { size: 80, w: 900, dir: 'ltr', color: C.ink });
      he(c, P.unit, 50, 18, { size: 42, w: 900, align: 'right' });
      card(c, -430, -56, 300, 112, { fill: C.green, r: 24, seed: 93, shadow: 7, lw: 4.5 });
      he(c, '✔️ בדיקה', -280, 22, { size: 46, w: 900, color: '#fff' });
    }, { dur: 0.28, over: 1.3, rot: 0.006 });
    UI.tap(ctx, W / 2 - 280, 1050 + 10, t, ev.go, { color: 'rgba(224,138,0,0.85)', size: 120 });
    popAt(ctx, t, ev.ans, W / 2, 1360, (c) => {
      card(c, -440, -150, 880, 300, { fill: '#e6f7ec', r: 30, seed: 95, shadow: 10, lw: 4.5, stroke: C.green });
      he(c, '✔️ נכון!', 400, -70, { size: 62, w: 900, align: 'right', color: C.green });
      eq(c, P.step + ' ✓', 400, 10, { size: 46, w: 900, align: 'right' });
      he(c, P.sentence, 400, 85, { size: 46, w: 900, align: 'right', maxW: 800 });
    }, { dur: 0.3, over: 1.6, rot: -0.008 });
    confetti(ctx, t, ev.ans, W / 2, 1360, { n: 26, seed: 4, spread: 800 });
    popAt(ctx, t, S.pills[5], W / 2, 1650, (c) => pill(c, 0, 0, 'אפשר לתרגל רמה אחת או את כל ⁦12⁩', { size: 38, w: 900, bg: C.yellow, seed: 88, padX: 44, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[6], W / 2, 1750, (c) => pill(c, 0, 0, 'ובסוף: כמה ענו נכון', { size: 38, w: 900, bg: C.lilac, seed: 89, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. PRINTABLE SHEET =================
  function sheetPage(c, k) {
    card(c, -230, -325, 460, 650, { fill: '#fff', r: 10, seed: 100 + k, shadow: 10, lw: 4 });
    if (k === 0) {
      he(c, '📖 שאלות מילוליות · כיתה ג׳', 205, -280, { size: 28, w: 900, align: 'right', maxW: 410 });
      he(c, 'שם: ____________ · בכל שאלה: מה שואלים? מה נתון?', 205, -244, { size: 17, w: 500, align: 'right', color: C.muted, maxW: 410 });
      S.SHEET.q.forEach((q, i) => {
        const y0 = -215 + i * 245;
        G.rrect(c, -205, y0, 410, 225, 12, { fill: '#fff', lw: 2.5, seed: 110 + i, stroke: '#bbb' });
        wrap(c, `${q.n}. ${q.text} ${q.ask}`, 21, 370, 600, 4).forEach((ln, j) => he(c, ln, 185, y0 + 36 + j * 29, { size: 21, w: 600, align: 'right', maxW: 380 }));
        he(c, 'תרגיל:', 185, y0 + 156, { size: 17, w: 500, align: 'right', color: C.muted });
        c.strokeStyle = '#bbb'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(-185, y0 + 166); c.lineTo(185, y0 + 166); c.stroke(); c.setLineDash([]);
        he(c, 'תשובה במשפט: ______________________', 185, y0 + 205, { size: 17, w: 500, align: 'right', color: C.muted });
      });
    } else if (k === 1) {
      he(c, '📖 שאלות מילוליות · כיתה ג׳ (המשך)', 205, -280, { size: 26, w: 900, align: 'right', maxW: 410 });
      for (let i = 0; i < 3; i++) { const y0 = -230 + i * 190; G.rrect(c, -205, y0, 410, 170, 12, { fill: '#fff', lw: 2.5, seed: 120 + i, stroke: '#bbb' }); for (let j = 0; j < 3; j++) { c.fillStyle = '#e4e7ef'; c.fillRect(-170 + j * 30, y0 + 28 + j * 32, 330 - j * 70, 9); } }
    } else {
      he(c, '✅ תשובות · כיתה ג׳', 205, -280, { size: 30, w: 900, align: 'right', color: C.green });
      S.SHEET.ans.forEach(([e, s], i) => { const y0 = -215 + i * 130; eq(c, e, 205, y0, { size: 24, w: 800, align: 'right', color: C.ink }); he(c, s, 205, y0 + 40, { size: 22, w: 800, align: 'right', maxW: 400 }); });
    }
  }
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    popAt(ctx, t, I[0].t, W / 2, 640, (c) => {
      card(c, -440, -135, 880, 330, { fill: C.lilac, r: 30, seed: 100, shadow: 10, lw: 4.5 });
      he(c, '🖨️ דף עבודה לכיתה ג׳', 400, -60, { size: 52, w: 900, align: 'right', maxW: 800 });
      wrap(c, 'שני עמודים עם ⁦12⁩ השאלות, מקום לתרגיל ולמשפט התשובה, ועמוד תשובות', 36, 800, 600, 2).forEach((ln, k) => he(c, ln, 400, 5 + k * 48, { size: 36, w: 600, align: 'right', maxW: 810 }));
      const pr = t >= ev.printBtn ? 1 + 0.06 * pulse(t, ev.printBtn, 10) : 1;
      c.save(); c.translate(230, 140); c.scale(pr, pr); pill(c, 0, 0, '🖨️ לתצוגה ולהדפסה', { size: 34, w: 900, bg: C.green, fg: '#fff', padX: 30, seed: 104, shadow: 5 }); c.restore();
    }, { dur: 0.3, over: 1.3, rot: -0.006 });
    UI.tap(ctx, W / 2 + 230, 640 + 140 + 10, t, ev.printBtn, { color: 'rgba(35,135,77,0.85)', size: 120 });
    popAt(ctx, t, I[2].t, W / 2 - 250, 1225, (c) => sheetPage(c, 2), { dur: 0.3, over: 1.3, rot: -0.03 });
    popAt(ctx, t, I[1].t, W / 2 + 250, 1215, (c) => sheetPage(c, 0), { dur: 0.3, over: 1.3, rot: 0.03 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1650, (c) => pill(c, 0, 0, 'עם הפתרון המלא של כל שאלה', { size: 40, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1750, (c) => pill(c, 0, 0, 'והטעויות הנפוצות להורים ולמורים ⚠️', { size: 38, w: 900, bg: C.blush, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // the hook question again: the same three givens
  function endOpts(ctx, t, t0) {
    [0, 1, 2].forEach((i) => {
      popAt(ctx, t, t0 + i * 0.1, W / 2 + (1 - i) * 292, 1160, (c) => {
        card(c, -140, -80, 280, 160, { fill: [C.yellow, C.blush, '#d6f6ff'][i], r: 28, seed: 150 + i, shadow: 8, lw: 4.5 });
        he(c, ['💰', '📅', '🗓️'][i], 0, -14, { size: 54, w: 700 });
        he(c, S.HOOKQ.given[i], 0, 46, { size: 34, w: 900, maxW: 250 });
      }, { rot: [0.02, -0.015, 0.02][i], dur: 0.25, over: 1.5 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 310); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 310, 200, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 480 + (1 - wp) * 24, { size: 92, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'שאלות מילוליות לפי כיתה · חינם, בלי הרשמה', W / 2, 545, { size: 42, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[2].t, W / 2, 635, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 56, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: שאלות מילוליות 🔎', W / 2, 735, { size: 42, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 870, (c) => pill(c, 0, 0, '📖 כמה כסף יהיה בקופה של רוני?', { size: 50, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 192, maxW: SAFE.w }), { rot: 0.02, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1450, (c) => pill(c, 0, 0, 'כמה בקופה? כתבו בתגובות 👇', { size: 52, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 310, { n: 20, seed: 9, spread: 1000 });
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
