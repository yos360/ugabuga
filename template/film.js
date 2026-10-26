// THE FILM (9:16) — "נוסעים עם בוגה": the site travel section in the site own look (paper + dot grid,
// ink-outlined cards with an offset shadow, Heebo), real characters only (no caveman). Pure function of t.
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

  // ---------- travel props ----------
  // a toy car facing left (it drives right → left, the way Hebrew reads)
  function car(ctx, x, y, s, t, { color = C.red, spin = 1 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(20,22,45,0.13)'; ctx.beginPath(); ctx.ellipse(6, 62, 150, 16, 0, 0, Math.PI * 2); ctx.fill();
    G.rrect(ctx, -140, -10, 280, 70, 26, { fill: color, lw: 5, seed: 201, stroke: C.ink });
    G.poly(ctx, [[-80, -10], [-45, -70], [60, -70], [95, -10]], { fill: color, lw: 5, seed: 202, stroke: C.ink });
    G.poly(ctx, [[-62, -16], [-38, -58], [6, -58], [6, -16]], { fill: '#bfe8ff', lw: 4, seed: 203, stroke: C.ink });
    G.poly(ctx, [[18, -16], [18, -58], [52, -58], [78, -16]], { fill: '#bfe8ff', lw: 4, seed: 204, stroke: C.ink });
    ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(-128, 14, 9, 0, Math.PI * 2); ctx.fill();
    for (const wx of [-80, 82]) {
      ctx.save(); ctx.translate(wx, 60); ctx.rotate(-t * 9 * spin);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9cfdf'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(13, 0); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // a tiny A4 page of the travel kit, drawn per page type
  function kitPage(ctx, title, i, w = 190, h = 268) {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 7, w, h, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    const cy = 22;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.fillStyle = C.ink;
    if (i === 0) {
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, 70, [10, 10, 0, 0]); ctx.fill();
      he(ctx, 'ערכת הדרך', 0, -h / 2 + 32, { size: 24, w: 900, color: '#fff' }); he(ctx, 'שלי', 0, -h / 2 + 60, { size: 24, w: 900, color: '#fff' });
      he(ctx, '✈️', 0, cy + 30, { size: 80, w: 400 });
      he(ctx, 'מטוס · גיל \u20666–7\u2069', 0, h / 2 - 22, { size: 17, w: 700, color: C.muted });
      return;
    }
    he(ctx, title, 0, -h / 2 + 34, { size: 21, w: 900, maxW: w - 20 });
    const k = (i - 1) % 7;
    ctx.save(); ctx.translate(0, cy);
    if (k === 0) { // color
      ctx.beginPath(); ctx.arc(-30, -30, 26, 0, Math.PI * 2); ctx.stroke();
      for (let a = 0; a < 8; a++) { const r = a * Math.PI / 4; ctx.beginPath(); ctx.moveTo(-30 + Math.cos(r) * 34, -30 + Math.sin(r) * 34); ctx.lineTo(-30 + Math.cos(r) * 46, -30 + Math.sin(r) * 46); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-70, 70); ctx.quadraticCurveTo(0, 10, 70, 70); ctx.stroke();
      ctx.beginPath(); ctx.arc(40, -20, 18, 0, Math.PI * 2); ctx.stroke();
    } else if (k === 1) { // maze
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const x = -60 + c * 24, y = -60 + r * 24; if (U.hash(r * 7 + c) > 0.45) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 24, y); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 24); ctx.stroke(); } }
      ctx.strokeRect(-60, -60, 120, 120);
    } else if (k === 2) { // dots
      for (let d = 0; d < 12; d++) { const a = d / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 55, Math.sin(a) * 45, 4, 0, Math.PI * 2); ctx.fill(); }
      he(ctx, '1', 62, 6, { size: 14, w: 700, dir: 'ltr' });
    } else if (k === 3) { // differences
      ctx.strokeRect(-72, -55, 66, 100); ctx.strokeRect(6, -55, 66, 100);
      for (const ox of [-39, 39]) { ctx.beginPath(); ctx.arc(ox, -15, 16, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(39, 25, 6, 0, Math.PI * 2); ctx.fill();
    } else if (k === 4) { // word search
      const L = 'אבגדהוזחטיכלמנסעפצקרשת';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) he(ctx, L[(r * 5 + c * 3) % L.length], 52 - c * 26, -44 + r * 26, { size: 18, w: 700, color: C.muted });
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-64, -10, 128, 26, 13); ctx.stroke();
    } else if (k === 5) { // sudoku
      for (let r = 0; r <= 4; r++) { ctx.lineWidth = r % 2 ? 1.5 : 3; ctx.beginPath(); ctx.moveTo(-60, -60 + r * 30); ctx.lineTo(60, -60 + r * 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60 + r * 30, -60); ctx.lineTo(-60 + r * 30, 60); ctx.stroke(); }
      [[0, 0, '1'], [1, 2, '3'], [2, 1, '2'], [3, 3, '4'], [0, 3, '2']].forEach(([r, c, n]) => he(ctx, n, -45 + c * 30, -38 + r * 30, { size: 20, w: 800, dir: 'ltr' }));
    } else { // drawing
      ctx.setLineDash([8, 6]); ctx.strokeRect(-65, -55, 130, 115); ctx.setLineDash([]);
      he(ctx, '✏️', 0, 20, { size: 46, w: 400 });
    }
    ctx.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'השאלה הכי נפוצה בדרך…', W / 2, 300, { size: 44, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, '״כמה עוד', 0, 0, { size: 150, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 625, (c) => he(c, 'נשאר?!״', 0, 0, { size: 150, w: 900, color: C.red }), { rot: 0.025 });
    // the question shakes a bit on the second ask
    popAt(ctx, t, ev.title, W / 2, 790, (c) => pill(c, 0, 0, 'נוסעים עם בוגה ✈️', { size: 76, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 12 }), { rot: -0.03, dur: 0.35 });
    S.hookPills.forEach((p) => {
      const x = [775, 540, 305][p.i];
      popAt(ctx, t, p.t, x, 915, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 40, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 28 }), { rot: [-0.03, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1040); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'גם בלי אינטרנט!', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    // the car drives in from the right on the second ask and parks
    const cp = ease.outCubic(clamp((t - ev.q2) / (BEAT * 1.6)));
    if (cp > 0) car(ctx, lerp(W + 220, 760, cp), 1360 - (cp >= 1 ? hop(t, 6) : 0), 0.95, t, { spin: cp < 1 ? 1 : 0.15 });
    // the detective boy pops up bottom-left
    const bp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 220, 1530 + (1 - bp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 16) : 0), 440, { rot: -0.04 });
  }

  // ================= 1. THE KIT =================
  function chipRow(ctx, labels, y, sel, seedBase) {
    let x = RIGHT - 40;
    labels.forEach((s, k) => {
      const ww = measure(ctx, s, 34, 800) + 52, on = sel === k;
      G.rrect(ctx, x - ww, y - 36, ww, 72, 36, { fill: on ? C.blue : '#fff', lw: on ? 4.5 : 3, seed: seedBase + k, stroke: on ? C.ink : C.line });
      he(ctx, s, x - ww / 2, y + 12, { size: 34, w: 800, color: on ? '#fff' : C.ink, dir: /[\u05d0-\u05ea]/.test(s) ? 'rtl' : 'ltr' });
      x -= ww + 16;
    });
  }
  function shotKit(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const X = SAFE.x, Wc = SAFE.w, Y = 490;
    const out = ease.outCubic(clamp((t - ev.make) / 0.25));
    if (out < 1) {
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 120);
      card(ctx, X, Y, Wc, 600, { seed: 31 });
      const rows = [['גיל', S.AGES], ['משך', S.DURS], ['סוג נסיעה', S.VEH]];
      rows.forEach(([lab, opts], r) => {
        const y = Y + 75 + r * 175;
        he(ctx, lab, RIGHT - 40, y, { size: 36, w: 900, align: 'right' });
        const p = S.picks[r]; const sel = t >= p.t ? p.k : -1;
        chipRow(ctx, opts, y + 75, sel, 40 + r * 5);
      });
      // taps
      S.picks.forEach((p) => {
        const opts = [S.AGES, S.DURS, S.VEH][p.row];
        let x = RIGHT - 40; for (let k = 0; k < p.k; k++) x -= measure(ctx, opts[k], 34, 800) + 52 + 16;
        const ww = measure(ctx, opts[p.k], 34, 800) + 52;
        UI.tap(ctx, x - ww / 2, Y + 150 + p.row * 175, t, p.t, { color: 'rgba(34,107,215,0.8)', size: 110 });
      });
      // the button
      const press = t >= ev.make ? 1 - 0.08 * pulse(t, ev.make, 10) : 1;
      ctx.save(); ctx.translate(W / 2, 1200); ctx.scale(press, press);
      pill(ctx, 0, 0, 'יצירת ערכה ←', { size: 48, w: 900, bg: C.red, fg: '#fff', padX: 60, seed: 58 });
      ctx.restore();
      UI.tap(ctx, W / 2 + 60, 1200, t, ev.make, { color: 'rgba(20,22,45,0.7)', size: 120 });
      ctx.restore();
    }
    // the booklet: cover + 7 page types, 2 rows of 4 (right to left)
    S.pages.forEach((p) => {
      const col = p.i % 4, row = Math.floor(p.i / 4);
      const x = RIGHT - 110 - col * 213, y = 660 + row * 330;
      popAt(ctx, t, p.t, x, y, (c) => kitPage(c, p.title, p.i), { rot: [0.04, -0.03, 0.03, -0.04, -0.03, 0.04, -0.02, 0.03][p.i] });
    });
    popAt(ctx, t, S.pages[7].t + BEAT, W / 2, 1150, (c) => pill(c, 0, 0, '📄 15 דפים כולל כריכה', { size: 46, w: 900, bg: C.yellow, seed: 66 }), { rot: -0.03 });
    popAt(ctx, t, S.pages[7].t + BEAT * 1.5, W / 2, 1290, (c) => he(c, 'מדפיסים לפני שיוצאים 🖨️', 0, 0, { size: 42, w: 800, color: C.muted }));
  }

  // ================= 2. BINGO =================
  function shotBingo(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    // the three routes
    chipRow(ctx, ['🚗 דרכים', '✈️ שדה תעופה', '🚆 רכבת ועיר'], 530, 0, 70);
    const cs = 240, gap = 14, bw = cs * 3 + gap * 2, x0 = W / 2 + bw / 2, y0 = 610;
    const done = t >= ev.bingo;
    card(ctx, W / 2 - bw / 2 - 22, y0 - 22, bw + 44, bw + 44, { seed: 75, r: 30 });
    S.BINGO.forEach(([e, s], i) => {
      const r = Math.floor(i / 3), c = i % 3;
      const cx = x0 - cs / 2 - c * (cs + gap), cy = y0 + cs / 2 + r * (cs + gap);
      const mk = S.marks.find((q) => q.cell === i);
      const on = mk && t >= mk.t;
      const press = mk ? 1 - 0.07 * pulse(t, mk.t, 10) : 1;
      const inRow = done && S.ROW.includes(i);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(press, press);
      G.rrect(ctx, -cs / 2, -cs / 2, cs, cs, 18, { fill: inRow ? '#fff4bb' : on ? '#e3f6ea' : '#fff', lw: on ? 4.5 : 3, seed: 80 + i, stroke: on ? C.green : C.line });
      he(ctx, e, 0, 18, { size: 96, w: 400 });
      he(ctx, s, 0, cs / 2 - 26, { size: 32, w: 800, maxW: cs - 24 });
      ctx.restore();
      if (mk) {
        checkMark(ctx, cx + cs / 2 - 42, cy - cs / 2 + 42, 30, clamp((t - mk.t) / 0.3));
        UI.tap(ctx, cx, cy, t, mk.t, { color: 'rgba(35,135,77,0.8)', size: 140 });
      }
    });
    // the line through the middle row
    const lp = ease.outCubic(clamp((t - ev.bingo) / 0.3));
    if (lp > 0) {
      const ly = y0 + cs / 2 + (cs + gap), xa = x0 - 30, xb = x0 - bw + 30;
      G.line(ctx, [[xa, ly + 4], [lerp(xa, xb, lp), ly - 4]], { color: C.red, lw: 16, seed: 91, amp: 1.5 });
    }
    popAt(ctx, t, ev.bingo, W / 2, 1450, (c) => pill(c, 0, 0, 'בינגו! 🎉', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 93 }), { rot: -0.04, dur: 0.35 });
    confetti(ctx, t, ev.bingo, W / 2, 1100, { n: 80, seed: 5, spread: 1000 });
  }

  // ================= 3. WAITING GAMES =================
  function shotWait(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    let sel = -1; S.placeTaps.forEach((p) => { if (t >= p.t) sel = p.i; });
    he(ctx, 'איפה מחכים?', RIGHT, 520, { size: 34, w: 800, align: 'right', color: C.muted });
    chipRow(ctx, S.PLACES, 590, sel, 100);
    S.placeTaps.forEach((p) => {
      let x = RIGHT - 40; for (let k = 0; k < p.i; k++) x -= measure(ctx, S.PLACES[k], 34, 800) + 52 + 16;
      UI.tap(ctx, x - (measure(ctx, S.PLACES[p.i], 34, 800) + 52) / 2, 590, t, p.t, { color: 'rgba(138,79,216,0.8)', size: 110 });
    });
    S.games.forEach((g) => {
      const y = 740 + g.i * 200;
      popAt(ctx, t, g.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -95, SAFE.w, 190, { fill: g.i === S.games.length - 1 || t < g.t + BEAT * 1.5 ? '#fbf7ff' : C.card, r: 26, seed: 110 + g.i, shadow: 8, lw: 3.5 });
        he(c, g.e, SAFE.w / 2 - 62, 14, { size: 66, w: 400 });
        he(c, g.title, SAFE.w / 2 - 128, -32, { size: 46, w: 900, align: 'right' });
        wrap(c, g.note, 29, SAFE.w - 170).forEach((ln, k) => he(c, ln, SAFE.w / 2 - 128, 12 + k * 35, { size: 29, w: 500, color: C.muted, align: 'right' }));
        pill(c, -SAFE.w / 2 + 125, -50, g.tag, { size: 24, w: 800, bg: C.lilac, padX: 18, shadow: 3, seed: 120 + g.i });
      }, { dur: 0.3, over: 1.8 });
    });
    const gp = ease.outBack(clamp((t - T(6, 0.5)) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 160, 1560 + (1 - gp) * 520 - hop(t, 10), 300, { rot: 0.03 });
    popAt(ctx, t, T(7, 3), 640, 1450, (c) => pill(c, 0, 0, 'רובם בלי ציוד בכלל', { size: 40, w: 800, bg: C.yellow, seed: 130 }), { rot: -0.03 });
  }

  // ================= 4. COUNTDOWN =================
  // the drawn route: a gentle S from the start (right) to the flag (left)
  const ROUTE = (u) => {
    const x = lerp(880, 200, u);
    const y = 1110 + Math.sin(u * Math.PI * 2) * 120;
    return [x, y];
  };
  function shotTimer(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    card(ctx, X, Y, Wc, 300, { seed: 141 });
    he(ctx, 'משך בדקות', RIGHT - 40, Y + 70, { size: 34, w: 800, align: 'right' });
    G.rrect(ctx, RIGHT - 260, Y + 100, 220, 84, 16, { fill: '#fbfcff', lw: 3, seed: 142, stroke: '#b9c0d4' });
    he(ctx, String(S.MINUTES), RIGHT - 150, Y + 160, { size: 52, w: 800, dir: 'ltr' });
    he(ctx, 'כלי רכב', RIGHT - 320, Y + 70, { size: 34, w: 800, align: 'right' });
    // vehicle chips, מכונית selected (right of the field's left edge)
    let x = RIGHT - 320; ['מכונית', 'מטוס', 'רכבת'].forEach((s, k) => {
      const ww = measure(ctx, s, 32, 800) + 44, on = k === 0;
      G.rrect(ctx, x - ww, Y + 108, ww, 68, 34, { fill: on ? C.orange : '#fff', lw: on ? 4.5 : 3, seed: 150 + k, stroke: on ? C.ink : C.line });
      he(ctx, s, x - ww / 2, Y + 154, { size: 32, w: 800, color: on ? '#fff' : C.ink });
      x -= ww + 12;
    });
    const go = t >= ev.go;
    const press = go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    ctx.save(); ctx.translate(W / 2, Y + 245); ctx.scale(press, press);
    pill(ctx, 0, 0, go ? 'בדרך! 🚗' : 'התחלת נסיעה', { size: 40, w: 900, bg: go ? C.green : C.red, fg: '#fff', padX: 50, seed: 155, h: 70 });
    ctx.restore();
    UI.tap(ctx, W / 2 + 50, Y + 245, t, ev.go, { color: 'rgba(20,22,45,0.7)', size: 110 });
    // the route
    ctx.save(); ctx.strokeStyle = '#c9cfdf'; ctx.lineWidth = 80; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const [px, py] = ROUTE(i / 60); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    ctx.setLineDash([22, 20]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    const [hx, hy] = ROUTE(0), [fx, fy] = ROUTE(1);
    he(ctx, '🏠', hx + 10, hy - 70, { size: 90, w: 400 });
    he(ctx, '🏁', fx - 10, fy - 70, { size: 100, w: 400 });
    // the car on the route
    const p = ease.inOutSine ? ease.inOutSine(S.progress(t)) : S.progress(t);
    const q = Math.min(p, 0.99), [cx, cy] = ROUTE(p), [ax, ay] = ROUTE(q), [nx, ny] = ROUTE(q + 0.01);
    ctx.save(); ctx.translate(cx, cy - 48); ctx.rotate(Math.atan2(ny - ay, nx - ax) + Math.PI); car(ctx, 0, 0, 0.62, t, { spin: go && t < ev.arrive ? 1 : 0 }); ctx.restore();
    // the remaining time
    const left = Math.round(S.MINUTES * (1 - S.progress(t)));
    const arrived = t >= ev.arrive;
    const tick = pulse(t, S.timerTicks.filter((q) => t >= q).slice(-1)[0] || 0, 12);
    if (!arrived) {
      ctx.save(); ctx.translate(W / 2, 1420); ctx.scale(1 + 0.05 * tick, 1 + 0.05 * tick);
      pill(ctx, 0, 0, `⏱️ נשארו עוד ${left} דקות`, { size: 50, w: 900, bg: C.yellow, seed: 160 });
      ctx.restore();
    }
    popAt(ctx, t, ev.arrive, W / 2, 1420, (c) => pill(c, 0, 0, 'הגענו! 🎉', { size: 66, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 161 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.arrive, fx, fy, { n: 70, seed: 8, spread: 900 });
  }

  // ================= 5. MORE =================
  function shotMore(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.extras.forEach((x) => {
      const col = x.i % 2, row = Math.floor(x.i / 2);
      const cx = RIGHT - 210 - col * 460, cy = 680 + row * 400;
      popAt(ctx, t, x.t, cx, cy, (c) => {
        card(c, -210, -175, 420, 350, { fill: [C.lilac, C.blush, '#e8f4ff', '#fff8de'][x.i], r: 30, seed: 170 + x.i, shadow: 10 });
        he(c, x.e, 0, -50, { size: 110, w: 400 });
        he(c, x.title, 0, 50, { size: 50, w: 900, maxW: 380 });
        wrap(c, x.note, 28, 360, 500).forEach((ln, k) => he(c, ln, 0, 100 + k * 34, { size: 28, w: 500, color: C.muted }));
      }, { rot: [0.02, -0.025, -0.02, 0.025][x.i] });
    });
    popAt(ctx, t, T(11, 3), W / 2, 1440, (c) => pill(c, 0, 0, 'הכול בחינם, בלי הרשמה', { size: 48, w: 900, bg: C.yellow, seed: 180 }), { rot: -0.03 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 580, (c) => {
      const s = 320;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'נוסעים עם בוגה, לכל מקום', W / 2, 1000, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חוברות, משחקים וסיפורים בחינם', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט: נוסעים עם בוגה ✈️', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25) });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotKit },
    { t0: T(4), fn: shotBingo },
    { t0: T(6), fn: shotWait },
    { t0: T(8), fn: shotTimer },
    { t0: T(10), fn: shotMore },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.logo = await L('img/logo.svg');
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
