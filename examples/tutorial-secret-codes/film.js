// THE FILM (16:9 tutorial) — "כתב סתרים וצפנים": real captures of the page on the left, step header + tip on the right.
// Paper + dot grid, ink-outlined cards with an offset shadow, Heebo; real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev, clock } = S; S.S = S.S || {};
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // layout: demo card on the left, the step panel on the right (RTL: it is read first)
  const DX = 70, DY = 70, DW = 1190, DH = 940;
  const PX0 = 1320, PX1 = 1862, PW = PX1 - PX0, PC = (PX0 + PX1) / 2;

  // ---------- text ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;
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
  function wrap(ctx, str, size, w, weight = 500, max = 3) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
  }
  function card(ctx, x, y, w, h, { fill = C.card, r = 30, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink, shadowColor = C.ink } = {}) {
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
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, '#e0f0ff'); g.addColorStop(0.55, C.lilac); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step panel (right): badge + title + subtitle, then a tip card and a character ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, PX1 - 54, 150, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 54, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 54, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 23, { size: 66, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, PX1 - 130 + dx, 176, { size: 70, w: 900, align: 'right', alpha: a, maxW: PW - 130 });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = PX1 - 130, len = Math.min(measure(ctx, f.title, 70, 900), PW - 130) * u;
      G.line(ctx, [[x1, 200], [x1 - len, 204]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
    const sa = UI.fadeIn(t, f.t + 0.2, 0.25);
    wrap(ctx, f.sub, 40, PW, 500).forEach((ln, k) => he(ctx, ln, PX1, 290 + k * 54, { size: 40, w: 500, color: C.muted, align: 'right', alpha: sa }));
  }
  function tip(ctx, t, t0, title, note, { y = 530, color = C.yellow, seed = 300 } = {}) {
    popAt(ctx, t, t0, PC, y, (c) => {
      const lines = note ? wrap(c, note, 32, PW - 70, 500, 3) : [];
      const h = 96 + lines.length * 42;
      card(c, -PW / 2, -48, PW, h, { fill: color, r: 26, seed, shadow: 8, lw: 3.5 });
      he(c, title, PW / 2 - 34, 14, { size: 42, w: 900, align: 'right', maxW: PW - 68 });
      lines.forEach((ln, k) => he(c, ln, PW / 2 - 34, 64 + k * 42, { size: 32, w: 500, color: C.ink, align: 'right' }));
    }, { rot: -0.015 });
  }
  function character(ctx, t, t0, im, { h = 300, rot = 0.03, flip = false } = {}) {
    const p = ease.outBack(clamp((t - t0) / 0.45), 1.5);
    if (p > 0) img(ctx, im, PC + 60, 1060 + (1 - p) * 400 - hop(t, 10), h, { rot, flip });
  }

  // ---------- real captures of ugabuga.co.il/tools/secret-codes, boxes measured in the DOM (shots/boxes.json) ----------
  const BOX = {
    ciphers: [48, 701, 1105, 55], k3: [770, 771, 57, 55], ta: [48, 952, 1105, 140], out: [48, 1120, 1105, 126], copy: [922, 1261, 231, 55],
    dec: [858, 841, 140, 55], counter: [640, 1530, 515, 44], msg: [48, 1583, 1105, 70], inp: [48, 1709, 1105, 70],
    hint: [923, 1794, 112, 55], check: [1045, 1794, 108, 55], printAll: [477, 3194, 245, 55],
  };
  let IW = 1200; const VX = DX + 12, VY = DY + 12, VW = DW - 24, VH = DH - 24; let SC = VW / IW;
  const sx = (x) => VX + x * SC, sy = (y, pan) => VY + (y - pan) * SC;
  function view(ctx, im, pan, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip();
    ctx.drawImage(im, VX, VY - pan * SC, im.width * SC, im.height * SC);
    ctx.restore();
  }
  function stateView(ctx, t, list, pan = 0) {
    let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k;
    const cur = list[i], a = i ? clamp((t - cur.t) / 0.25) : 1, pOf = (e) => (e.pan === undefined ? pan : e.pan);
    if (i && a < 1) view(ctx, IMG[list[i - 1].k], pOf(list[i - 1]));
    view(ctx, IMG[cur.k], pOf(cur), a);
  }
  function ring(ctx, t, t0, b, pan, { color = C.red, pad = 8, until = 1e9 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1], pan) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, pan, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2, pan), t, t0, { color, size: 110 });
  const siteCard = (ctx) => card(ctx, DX, DY, DW, DH, { seed: 400, r: 30 });
  // a typing reveal: the new text box is wiped in from the right (RTL) over d seconds
  function typeIn(ctx, t, t0, b, pan, im, d = 0.75) {
    const u = clamp((t - t0) / d); if (u <= 0 || u >= 1 || !im) return;
    const x = sx(b[0]), y = sy(b[1], pan), w = b[2] * SC, h = b[3] * SC, cut = x + w * (1 - u);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + 4, cut - x - 4, h - 8); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(x + 4, y + 4, w, h - 8); ctx.restore();
    if (Math.floor((t - t0) * 6) % 2 === 0) { ctx.fillStyle = C.ink; ctx.fillRect(cut - 3, y + 18, 4, Math.min(44, h - 36)); }
  }

  const PAN = 560;
  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const X = 1240;
    he(ctx, 'רוצים לשלוח הודעה סודית?', X, 250, { size: 80, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 1150 });
    popAt(ctx, t, ev.q2, X, 410, (c) => he(c, 'שרק החברים יבינו!', 0, 0, { size: 112, w: 900, color: C.red, maxW: 1120 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 590, (c) => pill(c, 0, 0, 'כתב סתרים וצפנים 🕵️', { size: 66, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 435 - i * 290;
      popAt(ctx, t, t0, x, 790, (c) => {
        card(c, -130, -70, 260, 140, { fill: [C.lilac, '#e3f6ea', C.yellow, '#ffe3ea'][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 34, w: 900, maxW: 230 });
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 960); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const bp = ease.outBack(clamp((t - ev.q1 - 0.1) / 0.5), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 330, 1050 + (1 - bp) * 600 - hop(t, 14), 760, { rot: -0.03 });
  }

  // ================= 1. CIPHER =================
  function shotCipher(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 's0' }, { t: ev.tapK3 + 0.15, k: 's1' }], PAN);
    ring(ctx, t, ev.ringCiphers, BOX.ciphers, PAN, { color: C.blue, until: ev.ringShift });
    ring(ctx, t, ev.ringShift, BOX.k3, PAN, { color: C.blue });
    tapAt(ctx, t, ev.tapK3, BOX.k3, PAN, 'rgba(34,107,215,0.8)');
    tip(ctx, t, ev.tipCipher, 'מזיזים 3 אותיות?', 'כך הצפין יוליוס קיסר, ולכן קוראים לזה "צופן קיסר"', { seed: 301 });
    character(ctx, t, T(3, 0), IMG.boy, { h: 250 });
  }
  // ================= 2. WRITE =================
  function shotWrite(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 's1' }, { t: ev.type, k: 's2' }, { t: ev.tapCopy + 0.15, k: 's3' }], PAN);
    typeIn(ctx, t, ev.type + 0.05, BOX.ta, PAN, IMG.s2);
    ring(ctx, t, ev.ringTa, BOX.ta, PAN, { color: C.red, until: ev.ringOut });
    ring(ctx, t, ev.ringOut, BOX.out, PAN, { color: C.red, until: ev.tapCopy - 0.4 });
    ring(ctx, t, ev.tapCopy - 0.4, BOX.copy, PAN, { color: C.green });
    tapAt(ctx, t, ev.tapCopy, BOX.copy, PAN, 'rgba(35,135,77,0.8)');
    tip(ctx, t, ev.tipWrite, 'נשאר רק אצלכם', 'שום דבר ממה שכותבים לא נשלח ולא נשמר', { seed: 302, color: '#ffe3ea' });
    character(ctx, t, T(6, 1), IMG.girl, { h: 230 });
  }
  // ================= 3. DECODE =================
  function shotDecode(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 's3' }, { t: ev.tapDec + 0.15, k: 's4' }], PAN);
    ring(ctx, t, ev.ringDec, BOX.dec, PAN, { color: C.purple, until: ev.tapDec + 0.3 });
    tapAt(ctx, t, ev.tapDec, BOX.dec, PAN, 'rgba(138,79,216,0.8)');
    ring(ctx, t, ev.ringOut2, BOX.out, PAN, { color: C.green });
    tip(ctx, t, ev.tipDec, 'יש גם טבלת צופן', 'למעלה האות, למטה הקוד. אפשר לפענח גם ביד, על דף', { seed: 303, color: C.lilac });
    character(ctx, t, T(9, 1), IMG.boy, { h: 230, flip: true });
  }
  // ================= 4. MISSION =================
  function shotMission(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]); siteCard(ctx);
    const pan = 1300;
    stateView(ctx, t, [{ t: 0, k: 's4' }, { t: ev.tapHint + 0.15, k: 'm1' }, { t: ev.typeAns, k: 'm2' }, { t: ev.tapCheck + 0.15, k: 'm3' }], pan);
    typeIn(ctx, t, ev.typeAns + 0.05, BOX.inp, pan, IMG.m2);
    ring(ctx, t, ev.ringMsg, BOX.msg, pan, { color: C.green, until: ev.tapHint - 0.4 });
    ring(ctx, t, ev.tapHint - 0.4, BOX.hint, pan, { color: C.orange, until: ev.tapHint + 0.3 });
    tapAt(ctx, t, ev.tapHint, BOX.hint, pan, 'rgba(224,138,0,0.8)');
    ring(ctx, t, ev.typeAns, BOX.inp, pan, { color: C.green, until: ev.tapCheck });
    ring(ctx, t, ev.tapCheck - 0.4, BOX.check, pan, { color: C.green, until: ev.tapCheck + 0.3 });
    tapAt(ctx, t, ev.tapCheck, BOX.check, pan, 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.tapCheck + 0.4, BOX.counter, pan, { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipMis, 'תקועים? יש רמז', 'הרמז מסביר מה לעשות ומראה את טבלת הצופן', { seed: 304, color: '#e3f6ea' });
    character(ctx, t, T(12, 1), IMG.girl, { h: 230, flip: true });
  }
  // ================= 5. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]); siteCard(ctx);
    const pan = 3050;
    stateView(ctx, t, [{ t: 0, k: 's4' }, { t: ev.tapAll + 0.15, k: 'd0', pan: 0 }], pan);
    ring(ctx, t, ev.ringAll, BOX.printAll, pan, { color: C.red, until: ev.tapAll + 0.15 });
    tapAt(ctx, t, ev.tapAll, BOX.printAll, pan);
    tip(ctx, t, ev.tipPrint, '6 דפים להדפסה', 'צופן צורות לגן, דפים עד כיתה ו׳, גלגל צפנים לגזירה ודף פתרונות', { seed: 305, color: C.yellow });
    character(ctx, t, T(15, 1), IMG.printer, { h: 230 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    const LX = 1460;
    ctx.save(); ctx.translate(LX, 360); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 1100, Math.sin(a0) * 1100); ctx.lineTo(Math.cos(a1) * 1100, Math.sin(a1) * 1100); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, LX, 360, (c) => {
      const s = 300;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 76); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', LX, 660 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines, X = 640;
    he(ctx, 'כתב סתרים וצפנים', X, 230, { size: 84, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/tools/secret-codes', { size: 50, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 🕵️', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '✍️ איזו הודעה סודית הייתם שולחים? כתבו בתגובות', X, 800, { size: 42, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1120 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotCipher }, { t0: T(5), fn: shotWrite }, { t0: T(8), fn: shotDecode },
    { t0: T(11), fn: shotMission }, { t0: T(14), fn: shotPrint }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png');
      IMG.printer = await L('img/home-printer.png'); IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['s0', 's1', 's2', 's3', 's4', 'm1', 'm2', 'm3', 'd0']) IMG[k] = await L(`img/${k}.png`);
      IW = IMG.s0.width; SC = VW / IW;
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
