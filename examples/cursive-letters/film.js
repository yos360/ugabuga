// THE FILM (9:16) — "איזו אות זו בכתב יד?": Hebrew cursive letters (/letters/cursive) in the site own look. Pure function of t.
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



  const KT = 'KtavYad';
  // a letter pair box like the page: print letter, cursive letter (Ktav Yad), name
  function chipLetter(c, cx, cy, w, h, l, { on = false, fin = false, seed = 1 } = {}) {
    G.rrect(c, cx - w / 2, cy - h / 2, w, h, 20, { fill: on ? C.yellow : fin ? '#fdf4ff' : '#fff', lw: on ? 5 : 3, seed, stroke: on ? C.red : C.line });
    he(c, l, cx + w / 2 - 22, cy - h / 2 + 30, { size: 28, w: 700, color: C.muted, dir: 'rtl' });
    he(c, l, cx - 6, cy + h / 2 - 22, { size: 76, w: 400, fam: KT });
  }
  // an answer button holding one print letter, like the hook options
  function optLetter(c, x, y, w, h, l, num, seed) {
    card(c, x - w / 2, y - h / 2, w, h, { fill: '#fff', r: 28, seed, shadow: 8, lw: 4.5 });
    he(c, l, x + 22, y + 28, { size: 80, w: 900 });
    c.fillStyle = C.red; c.beginPath(); c.arc(x + w / 2 - 44, y, 28, 0, Math.PI * 2); c.fill();
    he(c, String(num), x + w / 2 - 44, y + 13, { size: 38, w: 900, color: '#fff', dir: 'ltr' });
  }
  function bigCursive(c, cx, cy, l, size) { he(c, l, cx, cy, { size, w: 400, fam: KT, color: C.ink }); }
  // handwriting lines like the printable sheet: dashed top line + solid base line
  function noteLines(c, x1, x2, y, h) {
    c.save(); c.lineWidth = 2.5; c.strokeStyle = '#bfdbfe'; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); c.setLineDash([]);
    c.lineWidth = 3.5; c.strokeStyle = '#60a5fa'; c.beginPath(); c.moveTo(x1, y + h); c.lineTo(x2, y + h); c.stroke(); c.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 345, (c) => pill(c, 0, 0, '✍️ אותיות בכתב יד', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'איזו אות זו בכתב יד? 🤔', 0, 0, { size: 84, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, 640, 790, (c) => {
      card(c, -250, -195, 500, 390, { fill: '#fff', r: 40, seed: 14, shadow: 12, lw: 4.5 });
      bigCursive(c, 0, 105, S.HOOK_LETTER, 330);
    }, { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2);
      popAt(ctx, t, o.t, W / 2 + (col ? -225 : 225), 1110 + row * 140, (c) => optLetter(c, 0, 0, 440, 118, S.HOOK_NAMES[o.i], o.i + 1, 20 + o.i), { rot: [-0.01, 0.008, 0.008, -0.008][o.i], dur: 0.25, over: 1.6 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1420); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '1, 2, 3 או 4? כתבו בתגובות 👇', { size: 48, w: 900, bg: C.yellow, padX: 34, maxW: 700 });
      ctx.restore();
    }
    mascot(ctx, 200, 790 - (t > ev.q2 + 0.45 ? hop(t, 8) : 0), 330, t, ev.q2);
  }

  // ================= 1. PICK A LETTER =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const tapped = t >= ev.pick, L = tapped ? S.PICK : { l: 'ב', name: 'בֵּית' };
    popAt(ctx, t, S.AUD[0].t, W / 2, 690, (c) => {
      const pr = tapped ? 1 + 0.04 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr);
      card(c, -440, -190, 880, 380, { fill: '#fff', r: 34, seed: 30, shadow: 11, lw: 4.5 });
      he(c, L.l, 270, 20, { size: 220, w: 900, align: 'center' }); he(c, 'דפוס', 270, 110, { size: 32, w: 600, color: C.muted });
      he(c, '←', 0, 10, { size: 90, w: 700, color: C.muted, dir: 'ltr' });
      he(c, L.l, -270, 40, { size: 240, w: 400, fam: KT, color: C.red }); he(c, 'כתב', -270, 110, { size: 32, w: 600, color: C.muted });
      he(c, L.name + '  🔊', 0, 165, { size: 56, w: 900 });
    }, { dur: 0.3, over: 1.35, rot: -0.008 });
    popAt(ctx, t, S.AUD[1].t, W / 2, 1090, (c) => {
      S.GRID.forEach((l, i) => {
        const col = i % 5, row = Math.floor(i / 5), fin = 'ךםןףץ'.includes(l);
        chipLetter(c, (2 - col) * 176, (row - 1.5) * 112, 160, 98, l, { on: tapped && l === S.PICK.l, fin, seed: 60 + i });
      });
    }, { dur: 0.3, over: 1.25 });
    UI.tap(ctx, W / 2 + 2 * 176 - 20, 1090 - 1.5 * 112 + 10, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1405, (c) => pill(c, 0, 0, '⁦27⁩ אותיות, כולל ⁦5⁩ סופיות: ך ם ן ף ץ', { size: 42, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1505, (c) => pill(c, 0, 0, 'לחיצה על 🔊 משמיעה את שם האות', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. TYPE A WORD =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const n = clamp(Math.floor((t - ev.topic) / 0.12), 0, S.TYPED.length), txt = S.TYPED.slice(0, n);
    popAt(ctx, t, S.TOPICS[0].t, W / 2, 600, (c) => {
      card(c, -440, -90, 880, 180, { fill: '#fff', r: 30, seed: 50, shadow: 9, lw: 4.5 });
      he(c, 'מילה או משפט בדפוס', 410, -40, { size: 32, w: 700, color: C.muted, align: 'right' });
      he(c, txt, 0, 45, { size: 70, w: 700, maxW: 820 });
      if (t >= ev.topic && Math.floor(t * 3) % 2 === 0) { c.fillStyle = C.red; c.fillRect(-4, 0, 6, 64); }
    }, { dur: 0.25, over: 1.5, rot: -0.006 });
    UI.tap(ctx, W / 2 + 120, 640, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, ev.reasonCard, W / 2, 940, (c) => {
      G.rrect(c, -440, -190, 880, 380, 34, { fill: '#fff', lw: 3.5, seed: 52, stroke: C.line, dash: true });
      he(c, '🪄 ככה זה נראה בכתב יד', 410, -125, { size: 38, w: 800, color: C.muted, align: 'right' });
      he(c, txt || ' ', 0, 70, { size: 150, w: 400, fam: KT, color: C.red, maxW: 820 });
    }, { dur: 0.3, over: 1.3, rot: 0.006 });
    popAt(ctx, t, S.pills[2], W / 2, 1290, (c) => pill(c, 0, 0, 'למשל השם של הילד או הילדה', { size: 44, w: 900, bg: C.yellow, seed: 61, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1395, (c) => pill(c, 0, 0, 'מילה או משפט — עד ⁦40⁩ תווים', { size: 42, w: 900, bg: C.lilac, seed: 62, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 3. CHOOSE A PRINTABLE =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const tapped = t >= ev.mode, fbP = clamp((t - ev.fb3) / 0.3);
    S.CARDS.forEach(([ttl, desc, fill], i) => {
      const y = 640 + i * 235, on = tapped && i === S.CARD_PICK;
      popAt(ctx, t, S.MODES[i].t, W / 2, y, (c) => {
        const pr = on ? 1 + 0.04 * pulse(t, ev.mode, 10) : 1; c.scale(pr, pr);
        card(c, -440, -100, 880, 200, { fill, r: 30, seed: 70 + i, shadow: 10, lw: on ? 6 : 4.5, stroke: on ? C.red : C.ink });
        he(c, ttl, 410, -22, { size: 52, w: 900, align: 'right', maxW: 560 });
        he(c, desc, 410, 40, { size: 32, w: 600, align: 'right', color: C.muted, maxW: 560 });
        pill(c, -290, 0, '🖨️ להדפסה', { size: 38, w: 900, bg: C.red, fg: '#fff', padX: 30, seed: 80 + i, shadow: 6 });
      }, { dur: 0.25, over: 1.5, rot: [0.008, -0.008, 0.006][i] });
    });
    UI.tap(ctx, W / 2 - 290 + 40, 640 + 235 + 14, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    if (fbP > 0) {
      ctx.save(); ctx.globalAlpha = clamp(fbP * 2); ctx.translate(0, (1 - ease.outCubic(fbP)) * 30);
      card(ctx, 70, 1275, 940, 130, { fill: '#fff', r: 28, seed: 88, shadow: 8, lw: 4.5 });
      he(ctx, 'כל האותיות (⁦7⁩ דפים) או אות אחת', 990, 1360, { size: 46, w: 900, align: 'right', maxW: 900 });
      ctx.restore();
    }
    popAt(ctx, t, S.pills[4], W / 2, 1500, (c) => pill(c, 0, 0, 'דפים להדפסה על A4, בחינם', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. THE PRACTICE SHEET =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const R = S.ROWS, L = S.PRACTICE_LETTER;
    popAt(ctx, t, R[0].t, W / 2, 780, (c) => {
      card(c, -440, -290, 880, 580, { fill: '#fff', r: 26, seed: 90, shadow: 10, lw: 4.5 });
      he(c, 'תרגול כתיבה בכתב יד', 0, -225, { size: 46, w: 900 });
      he(c, 'שם: ____________', -410, -225, { size: 28, w: 600, color: C.muted, align: 'left' });
      c.fillStyle = '#fef9c3'; c.beginPath(); c.roundRect(300, -170, 120, 120, 16); c.fill();
      he(c, L, 360, -100, { size: 62, w: 700 }); he(c, L, 360, -52, { size: 60, w: 400, fam: KT, color: '#7548b3' });
    }, { dur: 0.3, over: 1.3, rot: -0.006 });
    popAt(ctx, t, R[1].t, W / 2, 780, (c) => {
      noteLines(c, -420, 270, -150, 120);
      for (let k = 0; k < 6; k++) {
        const tr = (k === 1 && t >= ev.go) || (k === 2 && t >= ev.ans), x = 190 - k * 115;
        he(c, L, x, -52, { size: 170, w: 400, fam: KT, color: k === 0 || tr ? C.ink : '#cbd5e1' });
      }
    }, { dur: 0.3, over: 1.3 });
    popAt(ctx, t, R[2].t, W / 2, 780, (c) => { noteLines(c, -420, 420, 70, 120); noteLines(c, -420, 420, 250, 0); }, { dur: 0.3, over: 1.2 });
    UI.tap(ctx, W / 2 + 190 - 115, 780 - 90, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 120 });
    UI.tap(ctx, W / 2 + 190 - 230, 780 - 90, t, ev.ans, { color: 'rgba(224,138,0,0.8)', size: 120 });
    popAt(ctx, t, S.pills[5], W / 2, 1180, (c) => pill(c, 0, 0, 'אות לדוגמה · אפורות להעביר · שורה ריקה', { size: 38, w: 900, bg: C.yellow, seed: 88, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[6], W / 2, 1290, (c) => pill(c, 0, 0, 'בנוי כמו מחברת של כיתה א׳', { size: 42, w: 900, bg: C.lilac, seed: 89, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. PRINT TO CURSIVE: WORDS =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems, noHelp = t >= ev.printBtn;
    popAt(ctx, t, I[0].t, W / 2, 560, (c) => {
      chip(c, 215, 0, 400, 100, 'עם עזרה אפורה', { on: !noHelp, color: C.green, size: 38, seed: 91 });
      chip(c, -215, 0, 400, 100, 'בלי עזרה', { on: noHelp, color: C.green, size: 38, seed: 92 });
    }, { dur: 0.25, over: 1.4 });
    UI.tap(ctx, W / 2 - 215 + 60, 575, t, ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 120 });
    S.WORDS.forEach((w, i) => {
      const y = 760 + i * 170, it = I[i];
      popAt(ctx, t, it.t, W / 2, y, (c) => {
        card(c, -440, -78, 880, 156, { fill: '#fff', r: 24, seed: 100 + i, shadow: 8, lw: 4.5 });
        he(c, w, 400, 22, { size: 74, w: 700, align: 'right' });
        noteLines(c, -400, 210, -34, 80);
        if (!noHelp) he(c, w, -95, 38, { size: 120, w: 400, fam: KT, color: '#d4d4d8' });
      }, { dur: 0.25, over: 1.4, rot: [0.008, -0.008, 0.006, -0.006][i] });
    });
    popAt(ctx, t, S.extras[0].t, W / 2, 1460, (c) => pill(c, 0, 0, 'כל הדפסה מביאה מילים אחרות 🔁', { size: 42, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1565, (c) => pill(c, 0, 0, 'חמש דקות ביום מספיקות', { size: 42, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // the hook letter again with the four numbered print letters in the same 2×2 grid
  function endOpts(ctx, t, t0) {
    popAt(ctx, t, t0, W / 2, 1040, (c) => { card(c, -215, -150, 430, 300, { fill: '#fff', r: 34, seed: 150, shadow: 10, lw: 4.5 }); bigCursive(c, 0, 90, S.HOOK_LETTER, 270); }, { dur: 0.25, over: 1.5 });
    [0, 1, 2, 3].forEach((i) => {
      const col = i % 2, row = Math.floor(i / 2);
      popAt(ctx, t, t0 + 0.08 + i * 0.08, W / 2 + (col ? -225 : 225), 1250 + row * 118, (c) => optLetter(c, 0, 0, 430, 96, S.HOOK_NAMES[i], i + 1, 160 + i), { dur: 0.22, over: 1.5 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 250); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 250, 230, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 450 + (1 - wp) * 24, { size: 92, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'אותיות בכתב יד · חינם, בלי הרשמה', W / 2, 520, { size: 44, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[2].t, W / 2, 615, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 56, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: אותיות בכתב יד 🔎', W / 2, 720, { size: 42, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 840, (c) => pill(c, 0, 0, '✍️ איזו אות זו בכתב יד?', { size: 56, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 192, maxW: SAFE.w }), { rot: 0.02, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1480, (c) => pill(c, 0, 0, '1, 2, 3 או 4? כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 250, { n: 20, seed: 9, spread: 1000 });
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
      await Studio.loadFont('KtavYad', 'fonts/ktav-yad.woff2', '400');
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
