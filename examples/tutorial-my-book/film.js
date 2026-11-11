// THE FILM (16:9 tutorial) — "ספר משלי": real captures of /printables/my-book on the left,
// step header + tip on the right. Paper + dot grid, ink cards, Heebo; real characters only.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

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
      g.addColorStop(0, '#e3efff'); g.addColorStop(0.55, C.lilac); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step panel (right) ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, PX1 - 54, 150, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 54, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 54, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 23, { size: 66, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, PX1 - 130 + dx, 176, { size: 64, w: 900, align: 'right', alpha: a, maxW: PW - 130 });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = PX1 - 130, len = Math.min(measure(ctx, f.title, 64, 900), PW - 130) * u;
      G.line(ctx, [[x1, 200], [x1 - len, 204]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
    const sa = UI.fadeIn(t, f.t + 0.2, 0.25);
    wrap(ctx, f.sub, 40, PW, 500).forEach((ln, k) => he(ctx, ln, PX1, 290 + k * 54, { size: 40, w: 500, color: C.muted, align: 'right', alpha: sa }));
  }
  function tip(ctx, t, t0, title, note, { y = 560, color = C.yellow, seed = 300 } = {}) {
    popAt(ctx, t, t0, PC, y, (c) => {
      const lines = note ? wrap(c, note, 32, PW - 70, 500, 3) : [];
      const h = 96 + lines.length * 42;
      card(c, -PW / 2, -48, PW, h, { fill: color, r: 26, seed, shadow: 8, lw: 3.5 });
      he(c, title, PW / 2 - 34, 14, { size: 40, w: 900, align: 'right', maxW: PW - 68 });
      lines.forEach((ln, k) => he(c, ln, PW / 2 - 34, 64 + k * 42, { size: 32, w: 500, color: C.ink, align: 'right' }));
    }, { rot: -0.015 });
  }
  function character(ctx, t, t0, im, { h = 300, rot = 0.03, flip = false } = {}) {
    const p = ease.outBack(clamp((t - t0) / 0.45), 1.5);
    if (p > 0) img(ctx, im, PC + 60, 1060 + (1 - p) * 400 - hop(t, 10), h, { rot, flip });
  }

  // ---------- real captures ----------
  // panel clips c*.png: CSS origin (296,519) at DSF 2; pr.png: the viewport at DSF 2 (CSS origin 0,0).
  // Boxes are CSS px (shots/boxes.json): panel boxes in page coords, v_* boxes in viewport coords.
  const BOX = {
    pHan: [581, 593, 104, 47], presets: [382, 593, 637, 47], name: [333, 689, 361, 47], title: [706, 689, 361, 47], text: [333, 785, 734, 191],
    sDraw: [849, 1039, 115, 47], sLines: [677, 1039, 165, 47], sWrite: [561, 1039, 107, 47], sComic: [436, 1039, 117, 47],
    print: [316, 324, 220, 52], sheet: [836, 292, 208, 281], fold: [600, 292, 208, 281], pages: [592, 284, 460, 297],
  };
  const SRC = { panel: { org: [296, 519], dsf: 2 }, view: { org: [0, 0], dsf: 2 } };
  const REG = { panel: [296, 519, 808, 703], print: [290, 272, 790, 316] };
  let R = REG.panel, O = SRC.panel, SC = 1, VX = 0, VY = 0, VW = 0, VH = 0;
  function useRegion(reg, src, box = [DX, DY, DW, DH]) {
    R = reg; O = src; SC = Math.min((box[2] - 24) / reg[2], (box[3] - 24) / reg[3]);
    VW = reg[2] * SC; VH = reg[3] * SC; VX = box[0] + (box[2] - VW) / 2; VY = box[1] + (box[3] - VH) / 2;
  }
  const sx = (x) => VX + (x - R[0]) * SC, sy = (y) => VY + (y - R[1]) * SC;
  function view(ctx, im, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(VX, VY, VW, VH);
    const k = SC / O.dsf;
    ctx.drawImage(im, VX - (R[0] - O.org[0]) * SC, VY - (R[1] - O.org[1]) * SC, im.width * k, im.height * k);
    ctx.restore();
  }
  const pick = (t, list) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k; return i; };
  function stateView(ctx, t, list) {
    const i = pick(t, list);
    const a = i ? clamp((t - list[i].t) / 0.25) : 1;
    if (i && a < 1) view(ctx, IMG[list[i - 1].k]);
    view(ctx, IMG[list[i].k], a);
  }
  function ring(ctx, t, t0, b, { color = C.red, pad = 8, until = 1e9, r = 22 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1]) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2), t, t0, { color, size: 100 });
  const siteCard = (ctx) => card(ctx, VX - 12, VY - 12, VW + 24, VH + 24, { seed: 400, r: 30 });

  // An A4 preview (1248×1686 element shot, the page-number badge hidden by shoot2.js).
  function a4(ctx, im, cx, cy, h, { rot = 0, seed = 40, land = false, half = false } = {}) {
    if (!im) return;
    const iw = im.width, ih = im.height, k = h / (land ? iw : ih);
    const w = (land ? ih : iw) * k;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    const ch = half ? h / 2 : h;
    card(ctx, -w / 2 - 14, -ch / 2 - 14, w + 28, ch + 28, { seed, r: 18 });
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -ch / 2, w, ch); ctx.clip();
    if (half) ctx.translate(0, -h / 4);
    if (land) ctx.rotate(-Math.PI / 2);
    const dw = iw * k, dh = ih * k;
    ctx.save();
    ctx.drawImage(im, -dw / 2, -dh / 2, dw, dh);
    ctx.restore(); ctx.restore();
    ctx.restore();
    return { w, h, k };
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) a4(ctx, IMG.sh2, 480, 680 + (1 - sp) * 700 - hop(t, 6), 640, { rot: -0.035, seed: 40, land: true, half: true });
    const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
    if (s2 > 0) a4(ctx, IMG.fold, 790, 300 + (1 - s2) * -700, 380, { rot: 0.06, seed: 41 });
    const X = 1420;
    he(ctx, 'רוצים שהילדים יכתבו ספר משלהם?', X, 250, { size: 58, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 860 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'ספר של 8 עמודים מדף אחד!', 0, 0, { size: 80, w: 900, color: C.red, maxW: 840 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'ספר משלי 📖', { size: 62, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 330 - i * 220;
      popAt(ctx, t, t0, x, 770, (c) => {
        card(c, -102, -70, 204, 140, { fill: [C.yellow, '#e3f6ea', '#ffe3ea', C.lilac][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 32, w: 900, maxW: 180 });
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const fp = clamp((t - ev.free) / 0.18);
    if (fp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(fp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 950); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(fp * 2);
      pill(ctx, 0, 0, 'חינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }

  // ================= 1. TOPIC =================
  function shotTopic(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    useRegion(REG.panel, SRC.panel); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'c0' }, { t: ev.tapHan + 0.12, k: 'c1' }]);
    ring(ctx, t, ev.ringTopics, BOX.presets, { color: C.red, pad: 10, until: ev.tapHan - 0.1 });
    tapAt(ctx, t, ev.tapHan, BOX.pHan);
    ring(ctx, t, ev.tapHan + 0.1, BOX.pHan, { color: C.red, pad: 6 });
    ring(ctx, t, ev.ringText, BOX.title, { color: C.red, pad: 6 });
    ring(ctx, t, ev.ringText + 0.2, BOX.text, { color: C.red, pad: 6 });
    tip(ctx, t, ev.tipTopic, '🕎 הכול מתמלא לבד', 'שם הספר "החנוכה שלי", ושש שורות: מדליקים נרות, החנוכייה שלי, סופגניות ולביבות…', { seed: 301, color: '#ffe3ea' });
    character(ctx, t, T(4, 1), IMG.girl, { h: 230 });
  }
  // ================= 2. WRITE =================
  function shotWrite(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    useRegion(REG.panel, SRC.panel); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'c1' }, { t: ev.typed, k: 'c2' }]);
    tapAt(ctx, t, ev.tapName, BOX.name, 'rgba(34,107,215,0.8)');
    ring(ctx, t, ev.tapName + 0.1, BOX.name, { color: C.blue, pad: 8, until: ev.ringLines });
    ring(ctx, t, ev.ringLines, BOX.text, { color: C.blue, pad: 8 });
    tip(ctx, t, ev.tipWrite, '✍️ אפשר גם לכתוב שורות משלכם', 'כל שורה מופיעה בראש עמוד בספר. השם מופיע בשער: "מאת: נועה"', { seed: 302, color: '#e0f0ff' });
    character(ctx, t, T(7, 1), IMG.boy, { h: 230, flip: true });
  }
  // ================= 3. STYLE =================
  function shotStyle(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const list = [{ t: 0, k: 'sh2', lbl: '✏️ ציור ו־2 שורות' }].concat(S.STYLES.map(([e, k, lbl]) => ({ t: ev[e], k, lbl })));
    const i = pick(t, list), cur = list[i];
    const bump = i ? 1 - 0.03 * Math.sin(Math.PI * clamp((t - cur.t) / 0.25)) : 1;
    ctx.save(); ctx.translate(DX + DW / 2, 600); ctx.scale(bump, bump);
    a4(ctx, IMG[cur.k], 0, 0, 760, { seed: 44, land: true });
    ctx.restore();
    popAt(ctx, t, i ? cur.t : S.steps[2].t + 0.2, DX + DW / 2, 140, (c) => pill(c, 0, 0, cur.lbl, { size: 52, w: 900, bg: C.yellow, seed: 60 + i, padX: 44 }), { rot: -0.02 });
    tip(ctx, t, ev.tipStyle, '👀 רואים את הדף לפני ההדפסה', 'השורה העליונה הפוכה בכוונה — אחרי הקיפול הכול ישר', { seed: 303, color: C.yellow, y: 600 });
  }
  // ================= 4. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    useRegion(REG.print, SRC.view); siteCard(ctx); view(ctx, IMG.pr);
    ring(ctx, t, ev.ringPrint, BOX.print, { color: C.green, pad: 8, until: ev.ringPages });
    tapAt(ctx, t, ev.tapPrint, BOX.print, 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.ringPages, BOX.pages, { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipPrint, '🖨️ הספר עצמו — דף אחד בלבד', 'הדף השני הוא הוראות הקיפול (אפשר לבחור "בלי"). אפשר גם לשמור PDF', { seed: 304, color: '#e3f6ea' });
    character(ctx, t, T(13, 2), IMG.printer, { h: 230 });
  }
  // the four lines of FoldSheet (MyBookComic.jsx), word for word
  const FOLD = [
    'מקפלים את הדף לחצי לרוחב, ושוב לחצי, ושוב לחצי — ופותחים. יש עכשיו 8 מלבנים.',
    'מקפלים את הדף לחצי כך שהצלעות הקצרות נפגשות. גוזרים מהצד המקופל לאורך הקו האדום בלבד — עד הקפל הבא, לא יותר.',
    'פותחים, ומקפלים לאורך כך שהציורים בחוץ. אוחזים בשני הקצוות ודוחפים אותם זה אל זה — החריץ נפתח.',
    'סוגרים את הדפים כמו ספר, כשהשער (עמוד 1) מקדימה. הספר נפתח מימין לשמאל, כמו כל ספר בעברית.',
  ];
  // ================= 5. FOLD =================
  function shotFold(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const cx = DX + 340, cy = DY + DH / 2, h = 900;
    const g = a4(ctx, IMG.fold, cx, cy, h, { seed: 45 });
    const rows = [ev.f1, ev.f2, ev.f3, ev.f4];
    const i = t < ev.f1 ? -1 : pick(t, rows.map((x) => ({ t: x })));
    if (i >= 0 && g) {
      const k = g.k, x0 = cx - g.w / 2, y0 = cy - h / 2;
      const ry = y0 + (196 + i * 362) * k, rh = 350 * k;
      const a = UI.fadeIn(t, rows[i], 0.2);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.purple; ctx.lineWidth = 7 + 2.5 * Math.sin((t - rows[i]) * 7);
      ctx.beginPath(); ctx.roundRect(x0 + 10, ry, g.w - 20, rh, 18); ctx.stroke(); ctx.restore();
      const MX = (cx + g.w / 2 + PX0) / 2;
      popAt(ctx, t, rows[i], MX, 210, (c) => pill(c, 0, 0, `קיפול ${i + 1} מתוך 4`, { size: 44, w: 900, bg: C.yellow, seed: 70 + i, padX: 36 }), { rot: -0.02 });
      const ta = UI.fadeIn(t, rows[i] + 0.1, 0.25);
      wrap(ctx, FOLD[i], 34, 470, 600, 6).forEach((ln, kk) => he(ctx, ln, MX + 235, 330 + kk * 50, { size: 34, w: 600, align: 'right', alpha: ta }));
    }
    tip(ctx, t, ev.tipFold, '✂️ מגיל 4 עם עזרה בגזירה', 'ומגיל ⁦6–7⁩ ילדים מקפלים לבד', { seed: 305, color: C.lilac, y: 560 });
    character(ctx, t, T(16, 2), IMG.bday, { h: 220, flip: true });
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
    he(ctx, 'ספר משלי — מדף אחד', X, 230, { size: 86, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1120 });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/printables/my-book', { size: 42, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 📖', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '📚 על מה יהיה הספר של הילדים שלכם? כתבו בתגובות', X, 800, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1160 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotTopic }, { t0: T(5), fn: shotWrite }, { t0: T(8), fn: shotStyle },
    { t0: T(11), fn: shotPrint }, { t0: T(14), fn: shotFold }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.printer = await L('img/home-printer.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['c0', 'c1', 'c2', 'sh2', 'shs1', 'shs2', 'shs3', 'shs4', 'fold', 'pr']) IMG[k] = await L(`img/${k}.png`);
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
