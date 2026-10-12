// The animated stage for story videos: an HTML page with a drawn scene (sky, hills, props),
// emoji characters that move, and subtitles. window.frame(t) poses everything for second t,
// so frames can be captured one by one (deterministic, no real-time playback).

const SKY = {
  morning: ['#bfe6ff', '#ffe2b8', '#7cc46a', '#5aa850'],
  day: ['#7fcbff', '#dff3ff', '#79c95f', '#4f9f45'],
  afternoon: ['#8fc6f0', '#ffe6b0', '#86c45a', '#5a9a3e'],
  sunset: ['#6a4c9c', '#ff9a5a', '#6f9440', '#4c6e2c'],
  night: ['#070b26', '#2b2a6e', '#1f3d3a', '#132a28'],
}

// Drawn props, in world units (1600×1000). Each returns SVG placed at its anchor (bottom centre).
const PROPS = {
  lemonTree: () => `<rect x="-26" y="-330" width="52" height="330" rx="18" fill="#8a5a33"/>
    <path d="M0 -250 L-120 -330 M0 -200 L110 -290" stroke="#8a5a33" stroke-width="22" stroke-linecap="round"/>
    <g fill="#3f9a3c"><circle cx="0" cy="-420" r="150"/><circle cx="-130" cy="-360" r="110"/><circle cx="130" cy="-370" r="115"/><circle cx="-40" cy="-520" r="95"/><circle cx="70" cy="-500" r="100"/></g>
    <g fill="#59b54a" opacity=".7"><circle cx="-60" cy="-450" r="70"/><circle cx="60" cy="-400" r="60"/></g>
    <g fill="#ffe14a" stroke="#e8b923" stroke-width="3">${[[-90, -400], [40, -460], [110, -360], [-20, -330], [-150, -320], [80, -540], [-110, -500]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="15"/>`).join('')}</g>`,
  pumpkin: () => `<path d="M-40 -95 C-160 -260 -320 -170 -260 -60 C-200 -10 -90 -40 -40 -95Z" fill="#3e9b3a"/>
    <path d="M-40 -95 C-140 -150 -220 -130 -250 -70" stroke="#2d7a2a" stroke-width="5" fill="none"/>
    <ellipse cx="-70" cy="-55" rx="70" ry="55" fill="#f08a24"/><ellipse cx="70" cy="-55" rx="70" ry="55" fill="#f08a24"/>
    <ellipse cx="0" cy="-58" rx="80" ry="60" fill="#f79a2e"/><path d="M-40 -110 Q-10 -60 -30 -5 M40 -110 Q10 -60 30 -5" stroke="#d8731a" stroke-width="5" fill="none"/>
    <rect x="-8" y="-140" width="16" height="36" rx="6" fill="#6b4a22"/>`,
  tap: () => `<rect x="-14" y="-230" width="28" height="230" fill="#9aa7b4"/><rect x="-14" y="-230" width="90" height="26" rx="10" fill="#b5c1cc"/>
    <rect x="60" y="-212" width="22" height="40" rx="6" fill="#b5c1cc"/><circle cx="0" cy="-250" r="26" fill="#d94a4a"/><rect x="-6" y="-270" width="12" height="40" fill="#b23a3a"/>`,
  stone: () => `<ellipse cx="0" cy="-34" rx="120" ry="48" fill="#8b8f99"/><ellipse cx="-20" cy="-48" rx="70" ry="20" fill="#a3a8b2"/>`,
  bigLeaf: () => `<path d="M-520 0 C-400 -260 300 -300 560 -40 C300 40 -300 60 -520 0Z" fill="#4fae46"/>
    <path d="M-500 -5 C-200 -80 200 -100 540 -40" stroke="#2f8a33" stroke-width="8" fill="none"/>`,
  grass: () => Array.from({ length: 40 }, (_, i) => { const x = i * 41 - 800; return `<path d="M${x} 360 q8 -60 4 -110 M${x + 10} 360 q-6 -50 10 -90" stroke="#3c8f3a" stroke-width="7" fill="none"/>` }).join(''),
  flowers: () => [[-650, 330], [-480, 360], [-120, 345], [260, 350], [520, 330], [700, 355], [-300, 380]].map(([x, y], i) =>
    `<g transform="translate(${x} ${y})"><path d="M0 0 v-46" stroke="#3a8a35" stroke-width="5"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-60" rx="9" ry="16" fill="${['#ff8fb1', '#ffd23f', '#ffffff', '#c9a7ff'][i % 4]}" transform="rotate(${a} 0 -46)"/>`).join('')}<circle cx="0" cy="-46" r="8" fill="#ffb02e"/></g>`).join(''),
  quilt: () => `<g opacity=".0" class="quilt">${Array.from({ length: 24 }, (_, i) => `<rect x="${(i % 8) * 120 - 480}" y="${Math.floor(i / 8) * 70 + 230}" width="114" height="64" rx="8" fill="${['#62b553', '#79c95f', '#4f9f45'][(i + Math.floor(i / 8)) % 3]}"/>`).join('')}</g>`,
}

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')

export function stageHtml({ w, h, fonts, scene, subs = [], total, title, sub, end, part, cont, brand = true }) {
  const tall = h > w
  const [skyTop, skyBottom, hill1, hill2] = SKY[scene.sky] || SKY.day
  const night = scene.sky === 'night'
  // The world (1600×1000) covers the scene area; reels keep the middle 1280 px of it.
  const sceneH = tall ? 1250 : h
  const scale = tall ? 0.95 : w / 1600
  const worldLeft = tall ? -(1600 * scale - w) / 2 : 0
  const worldTop = tall ? sceneH - 1000 * scale : h - 1000 * scale - 70
  const props = scene.props.map(p => p.svg === 'quilt' ? `<g transform="translate(420 -150) scale(.55)">${PROPS.quilt()}</g>`
    : p.svg === 'flowers' || p.svg === 'grass'
    ? `<g transform="translate(800 640)">${PROPS[p.svg]()}</g>`
    : `<g transform="translate(${p.x} ${p.y}) scale(${p.s || 1})">${PROPS[p.svg]()}</g>`).join('')
  const stars = Array.from({ length: 60 }, (_, i) => [(i * 37.7) % 1600, (i * 61.3) % 520, 1.5 + (i % 3)])
  const data = { scene, subs, total, tall, night }
  return `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>${fonts}
  *{box-sizing:border-box;margin:0}body{width:${w}px;height:${h}px;overflow:hidden;font-family:Heebo,sans-serif;color:#fff;background:#141a3a}
  #view{position:absolute;left:0;top:0;width:${w}px;height:${sceneH}px;overflow:hidden;background:linear-gradient(${skyTop},${skyBottom} 70%)}
  #cam{position:absolute;inset:0;transform-origin:50% 62%}
  #world{position:absolute;left:${worldLeft}px;top:${worldTop}px;width:1600px;height:1000px;transform-origin:0 0;transform:scale(${scale})}
  #world svg{position:absolute;left:0;top:0;overflow:visible}
  .e{position:absolute;left:0;top:0;font-family:'Noto Color Emoji';line-height:1;will-change:transform;transform-origin:50% 100%}
  .e span{display:inline-block}
  #fade{position:absolute;inset:0;background:#000;pointer-events:none}
  .brand{position:absolute;top:${tall ? 70 : 34}px;right:${tall ? 50 : 44}px;padding:${tall ? '12px 26px' : '8px 20px'};border-radius:99px;background:rgba(20,26,58,.55);font-weight:700;font-size:${tall ? 36 : 28}px}
  .part{position:absolute;top:${tall ? 150 : 34}px;${tall ? 'right' : 'left'}:${tall ? 50 : 44}px;padding:6px 18px;border-radius:99px;background:#ffe9a8;color:#1b1b4b;font-weight:900;font-size:${tall ? 32 : 26}px}
  #sub{position:absolute;${tall ? `top:${sceneH}px;bottom:0;left:0;right:0;padding:40px 56px 120px;background:linear-gradient(#1b1f4d,#10132e);display:flex;align-items:center;justify-content:center`
    : 'left:50%;bottom:44px;transform:translateX(-50%);max-width:1560px;padding:22px 44px;border-radius:30px;background:rgba(12,16,44,.62)'};
    font-size:${tall ? 60 : 46}px;line-height:1.4;text-align:center;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,.4)}
  #sub:empty{display:none}
  #sub b{font-weight:700;color:#fff}#sub i{font-style:normal;color:rgba(255,255,255,.45)}
  .titlebox{position:absolute;left:${tall ? 0 : 60}px;right:${tall ? 0 : 860}px;top:${tall ? 190 : 110}px;text-align:center}
  .titlebox h1{font-weight:900;font-size:${tall ? 110 : 112}px;line-height:1.1;text-shadow:0 6px 24px rgba(0,0,40,.45)}
  .titlebox p{font-size:${tall ? 44 : 40}px;font-weight:700;margin-top:14px;text-shadow:0 3px 12px rgba(0,0,40,.5)}
  .endbox{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${tall ? 40 : 26}px;padding:0 80px;text-align:center}
  .endbox h1{font-weight:900;font-size:${tall ? 96 : 92}px}.endbox .m{font-size:${tall ? 50 : 44}px;line-height:1.5;max-width:1400px}
  .endbox .u{font-weight:900;font-size:${tall ? 78 : 70}px;color:#ffe9a8}.endbox .s{font-size:${tall ? 40 : 36}px;opacity:.85}
  .cont{position:absolute;left:0;right:0;bottom:${tall ? 40 : 150}px;text-align:center;font-weight:900;font-size:${tall ? 44 : 36}px;color:#ffe9a8}
  </style></head><body>
  <div id="view"><div id="cam"><div id="world">
    <svg width="1600" height="1000" viewBox="0 0 1600 1000">
      ${night ? stars.map(([x, y, s], i) => `<circle class="star" data-i="${i}" cx="${x}" cy="${y}" r="${s}" fill="#fff"/>`).join('') : ''}
      ${night ? '<g id="moon" transform="translate(1300 150)"><circle r="70" fill="#fff4c4"/><circle cx="28" cy="-18" r="62" fill="#2b2a6e" opacity="0"/></g>'
      : scene.sky === 'sunset' ? '<circle id="sun" cx="1250" cy="520" r="110" fill="#ffcf6a"/>' : '<g id="sun" transform="translate(1380 140)"><circle r="80" fill="#ffd84d"/><circle r="110" fill="#ffd84d" opacity=".25"/></g>'}
      <g id="clouds">${!night && scene.fx?.includes('clouds') ? [[200, 140, 1], [800, 90, 0.8], [1250, 260, 0.7]].map(([x, y, s]) => `<g class="cloud" data-x="${x}" transform="translate(${x} ${y}) scale(${s})"><ellipse rx="110" ry="42" fill="#fff" opacity=".92"/><ellipse cx="-60" cy="-26" rx="60" ry="44" fill="#fff" opacity=".92"/><ellipse cx="40" cy="-38" rx="70" ry="52" fill="#fff" opacity=".92"/></g>`).join('') : ''}</g>
      <path d="M0 620 C250 520 520 560 760 610 C1000 660 1250 540 1600 590 L1600 1500 L0 1500Z" fill="${hill1}"/>
      <path d="M0 700 C300 640 700 690 900 700 C1150 712 1350 650 1600 680 L1600 1500 L0 1500Z" fill="${hill2}"/>
      ${props}
    </svg>
    <div id="cast"></div>
  </div></div>
  ${title ? `<div class="titlebox"><h1>${esc(title)}</h1><p>${esc(sub || '')}</p></div>` : ''}
  </div>
  ${end ? `<div class="endbox">${end}</div>` : ''}
  <div id="sub"></div>
  ${brand ? '<div class="brand">🎂 עוגה בוגה · סיפורים לפני השינה</div>' : ''}
  ${part ? `<div class="part">${esc(part)}</div>` : ''}
  ${cont ? `<div class="cont">⬅ המשך בחלק ${cont}</div>` : ''}
  <div id="fade"></div>
  <script>{
  // Block scope: the page is reused for the next segment, so nothing may stay declared.
  const D = ${JSON.stringify(data)}
  const S = D.scene, T = D.total
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
  const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
  const lerp = (a, b, k) => a + (b - a) * k
  const pair = v => Array.isArray(v) ? v : [v, v]
  const cast = document.getElementById('cast')
  // Expand the cast: "ants" is a marching line, extra fx add butterflies/hearts/fireflies.
  const actors = []
  for (const c of S.cast) {
    if (c.a === 'ants') for (let k = 0; k < c.n; k++) actors.push({ ...c, a: 'walk', delay: k * 0.035, n: 0 })
    else actors.push(c)
  }
  if (S.fx?.includes('butterflies')) actors.push({ e: '🦋', s: 60, a: 'flutter', x: 500, y: 420, seed: 1 }, { e: '🦋', s: 50, a: 'flutter', x: 1100, y: 380, seed: 2 })
  if (S.fx?.includes('hearts')) for (let k = 0; k < 4; k++) actors.push({ e: '💛', s: 50, a: 'rise', x: 700 + k * 90, y: 700, seed: k })
  if (S.fx?.includes('fireflies')) for (let k = 0; k < 9; k++) actors.push({ e: '✨', s: 34, a: 'firefly', x: 200 + k * 150, y: 560 + (k % 3) * 70, seed: k })
  if (S.fx?.includes('sparkles')) for (let k = 0; k < 5; k++) actors.push({ e: '✨', s: 40, a: 'twinkle', x: 300 + k * 230, y: 420 + (k % 2) * 120, seed: k })
  for (const a of actors) {
    a.el = document.createElement('div'); a.el.className = 'e'; a.el.style.fontSize = a.s + 'px'
    a.el.innerHTML = '<span>' + a.e + '</span>' + (a.rider ? '<span class="rider" style="position:absolute;font-size:' + a.rider.s + 'px;left:' + (a.s * .1) + 'px;top:' + (-a.rider.s * .55) + 'px">' + a.rider.e + '</span>' : '')
    if (D.night) a.el.style.filter = 'brightness(.85)'
    cast.appendChild(a.el)
  }
  const world = document.getElementById('cam'), fade = document.getElementById('fade'), sub = document.getElementById('sub')
  const clouds = [...document.querySelectorAll('.cloud')], stars = [...document.querySelectorAll('.star')]
  const quilt = document.querySelector('.quilt'), sun = document.getElementById('sun')
  function pose(a, t, p) {
    const [x0, x1] = pair(a.x), [y0, y1] = pair(a.y), at = a.at || [0, 1]
    let k = ease(clamp((p - at[0] - (a.delay || 0)) / (at[1] - at[0])))
    let x = lerp(x0, x1, k), y = lerp(y0, y1, k), rot = 0, sx = x1 > x0 ? -1 : 1, sc = 1, op = 1
    const moving = k > 0 && k < 1, ph = (a.seed || 0) * 1.7
    switch (a.a) {
      case 'walk': if (moving) { y -= Math.abs(Math.sin(t * 5)) * 5; rot = Math.sin(t * 5) * 3 } break
      case 'hop': y -= Math.abs(Math.sin(t * 3.2)) * 34; rot = Math.sin(t * 3.2) * 4; break
      case 'bob': y -= Math.sin(t * 1.6) * 6; rot = Math.sin(t * 1.2) * 2; break
      case 'peek': rot = -12 + Math.sin(t * 1.3) * 8; y -= Math.abs(Math.sin(t * 2)) * 8; break
      case 'fly': y += Math.sin(t * 4) * 26 * (1 - k * .6); sc = 1 + Math.sin(t * 14) * .05; break
      case 'land': if (moving) { y += Math.sin(t * 4) * 20 } else if (k >= 1) y -= Math.abs(Math.sin(t * 3)) * 22; break
      case 'circle': { const r = a.r || 300, w = (t / 4) * Math.PI * 2; x = x0 + Math.cos(w) * r; y = y0 + Math.sin(w) * r * .35; sx = Math.sin(w) > 0 ? 1 : -1; sc = 1 + Math.sin(t * 14) * .05; if (a.at && k >= 1) { x = x0 - r * .4; y = 760; sc = 1 } break }
      case 'trip': { const q = clamp(p / (at[1] || 1)); const go = q < .5 ? ease(q * 2) : ease((1 - q) * 2); x = lerp(x0, x1, go); y = lerp(y0, y1, go) - Math.sin(go * Math.PI) * 220 + Math.sin(t * 5) * 10; sx = q < .5 ? 1 : -1; if (q >= 1) y -= Math.abs(Math.sin(t * 3)) * 22; break }
      case 'hopAhead': { const step = Math.floor(p * 5), f = p * 5 - step, g = ease(clamp(f * 2)); x = lerp(x0, x1, (step + g) / 5); y -= Math.sin(clamp(f * 2) * Math.PI) * 70; break }
      case 'sleep': sc = 1 + Math.sin(t * 1.4) * .025; rot = 0; break
      case 'zzz': { const f = (t % 3) / 3; y -= f * 120; x += Math.sin(t * 2) * 14; op = Math.sin(f * Math.PI); break }
      case 'pop': sc = .6 + .4 * ease(clamp((p - (a.show?.[0] || 0)) * 8)); y -= Math.sin(t * 2) * 6; break
      case 'drip': { const f = (t % 1.6) / 1.6; y += f * 90; op = 1 - f; break }
      case 'glint': sc = 1 + Math.sin(t * 3) * .12; rot = Math.sin(t * 2) * 8; break
      case 'twinkle': sc = .7 + Math.abs(Math.sin(t * 2 + ph)) * .5; op = .5 + Math.abs(Math.sin(t * 2 + ph)) * .5; break
      case 'flutter': x += Math.sin(t * .7 + ph) * 260; y += Math.sin(t * 1.9 + ph) * 60; sc = 1 + Math.sin(t * 16) * .15; sx = Math.cos(t * .7 + ph) > 0 ? -1 : 1; break
      case 'rise': { const f = ((t + ph) % 4) / 4; y -= f * 260; x += Math.sin(t * 2 + ph) * 20; op = Math.sin(f * Math.PI); break }
      case 'firefly': x += Math.sin(t * .6 + ph) * 60; y += Math.cos(t * .8 + ph) * 40; op = .3 + Math.abs(Math.sin(t * 1.3 + ph)) * .7; break
    }
    if (a.flip) sx = -sx
    if (a.show) { const [i, o] = a.show; const fi = clamp((p - i) * 12), fo = o < 1 ? clamp((o - p) * 12) : 1; op *= Math.min(fi, fo); if (a.a !== 'pop' && a.a !== 'zzz') sc *= .7 + .3 * fi }
    a.el.style.opacity = op
    a.el.style.transform = 'translate(' + (x - a.s / 2) + 'px,' + (y - a.s) + 'px) rotate(' + rot + 'deg) scale(' + (sx * sc) + ',' + sc + ')'
  }
  window.frame = function (t) {
    const p = clamp(t / T)
    const cam = S.cam || [1, 1], k = ease(p)
    const z = lerp(cam[0], cam[1], k), pan0 = cam[2] || [0, 0], pan1 = cam[3] || [0, 0]
    world.style.transform = 'translate(' + lerp(pan0[0], pan1[0], k) + 'px,' + lerp(pan0[1], pan1[1], k) + 'px) scale(' + z + ')'
    clouds.forEach((c, i) => c.setAttribute('transform', 'translate(' + (((+c.dataset.x + t * (14 + i * 6)) % 1900) - 150) + ' ' + (140 + i * 60 - (i === 1 ? 50 : 0)) + ') scale(' + (1 - i * .15) + ')'))
    if (sun && S.sky === 'sunset') sun.setAttribute('cy', 520 + p * 90)
    stars.forEach((s, i) => {
      let o = .45 + Math.abs(Math.sin(t * 1.3 + i)) * .55
      if (S.fx?.includes('starsOneByOne')) o *= clamp((p - (i / stars.length) * .85) * 10)
      s.setAttribute('opacity', o)
    })
    if (quilt) quilt.setAttribute('opacity', clamp((p - .45) * 4) * .85)
    for (const a of actors) pose(a, t, p)
    // Subtitles: the current line, words already said in white, the rest dimmed.
    const line = D.subs.find(s => t >= s.from && t < s.to)
    if (!line) sub.innerHTML = ''
    else {
      const f = clamp((t - line.from) / Math.max(.1, line.to - line.from - .25)), words = line.text.split(' ')
      const total = line.text.length; let acc = 0
      sub.innerHTML = '<div>' + words.map(w => { acc += w.length + 1; return acc / total <= f + .02 ? '<b>' + w + '</b>' : '<i>' + w + '</i>' }).join(' ') + '</div>'
    }
    fade.style.opacity = Math.max(clamp(1 - t / .45), clamp(1 - (T - t) / .45))
  }
  window.frame(0)
  }</script></body></html>`
}
