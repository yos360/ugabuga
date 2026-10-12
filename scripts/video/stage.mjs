// The animated stage for story videos: an HTML page with a drawn, layered scene (sky, far hills,
// hills, props, swaying foreground grass), emoji characters that move, and storybook subtitles.
// window.frame(t) poses everything for second t, so frames can be captured one by one.
// sceneEvents() lists the moments that get a soft sound effect (see audio.mjs).

// sky top, sky bottom, far hills, hill, front hill, light
const SKY = {
  morning: ['#a9dcff', '#ffe4bd', '#b9d9c2', '#86cc6e', '#5eae52', '#fff1c9'],
  day: ['#6ec3ff', '#dcf3ff', '#a8d6b8', '#7fce62', '#52a447', '#ffffff'],
  afternoon: ['#86c0ee', '#ffe2a8', '#b7cfa8', '#8cc75c', '#5d9c40', '#fff0c0'],
  sunset: ['#5a3f93', '#ff9259', '#8f6f86', '#76984a', '#4e702d', '#ffcf8a'],
  night: ['#060a24', '#2a2a6c', '#1e2a4e', '#1f4038', '#14302a', '#b9c4ff'],
}

// Drawn props, in world units (1600×1000). Each returns SVG placed at its anchor (bottom centre).
const PROPS = {
  lemonTree: () => `<ellipse cx="0" cy="0" rx="150" ry="22" fill="#000" opacity=".12"/>
    <path d="M-30 0 C-20 -120 -26 -250 -14 -330 L14 -330 C26 -250 22 -120 34 0Z" fill="#8a5a33"/>
    <path d="M-8 -40 C-4 -120 -10 -200 -2 -300" stroke="#6e4426" stroke-width="5" fill="none" opacity=".6"/>
    <path d="M0 -250 C-50 -280 -90 -310 -120 -330 M0 -200 C40 -230 80 -260 110 -290" stroke="#8a5a33" stroke-width="20" stroke-linecap="round" fill="none"/>
    <g fill="#3a9238"><circle cx="0" cy="-420" r="150"/><circle cx="-130" cy="-360" r="110"/><circle cx="130" cy="-370" r="115"/><circle cx="-40" cy="-520" r="95"/><circle cx="70" cy="-500" r="100"/></g>
    <g fill="#57b54a"><circle cx="-60" cy="-470" r="80"/><circle cx="70" cy="-420" r="70"/><circle cx="-150" cy="-380" r="55"/><circle cx="20" cy="-560" r="50"/></g>
    <g fill="#7fd06a" opacity=".55"><circle cx="-80" cy="-500" r="34"/><circle cx="50" cy="-460" r="28"/><circle cx="-160" cy="-400" r="22"/></g>
    <g class="lemons" fill="#ffe14a" stroke="#e0ad1e" stroke-width="3">${[[-90, -400], [40, -460], [110, -360], [-20, -330], [-150, -320], [80, -540], [-110, -500], [150, -440]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse rx="21" ry="16"/><ellipse cx="-6" cy="-5" rx="6" ry="4" fill="#fff6b0" stroke="none"/></g>`).join('')}</g>`,
  pumpkin: () => `<ellipse cx="0" cy="0" rx="190" ry="20" fill="#000" opacity=".12"/>
    <path d="M-40 -95 C-160 -260 -320 -170 -260 -60 C-200 -10 -90 -40 -40 -95Z" fill="#3e9b3a"/>
    <path d="M-40 -95 C-140 -150 -220 -130 -250 -70 M-120 -140 L-170 -190 M-160 -110 L-230 -130" stroke="#2d7a2a" stroke-width="5" fill="none"/>
    <path d="M60 -40 C120 -90 170 -60 200 -20" stroke="#3e9b3a" stroke-width="6" fill="none"/><circle cx="205" cy="-22" r="8" fill="none" stroke="#3e9b3a" stroke-width="4"/>
    <ellipse cx="-70" cy="-55" rx="70" ry="55" fill="#ea7f1c"/><ellipse cx="70" cy="-55" rx="70" ry="55" fill="#ea7f1c"/>
    <ellipse cx="0" cy="-58" rx="80" ry="60" fill="#f79a2e"/><path d="M-40 -110 Q-10 -60 -30 -5 M40 -110 Q10 -60 30 -5" stroke="#d8731a" stroke-width="5" fill="none"/>
    <ellipse cx="-30" cy="-85" rx="22" ry="10" fill="#ffc27a" opacity=".6"/>
    <path d="M-6 -104 C-10 -130 0 -140 12 -146" stroke="#6b4a22" stroke-width="14" stroke-linecap="round" fill="none"/>`,
  tap: () => `<ellipse cx="0" cy="0" rx="60" ry="10" fill="#000" opacity=".12"/><rect x="-14" y="-230" width="28" height="230" fill="#9aa7b4"/><rect x="-6" y="-230" width="6" height="230" fill="#c7d1da"/>
    <rect x="-14" y="-230" width="90" height="26" rx="10" fill="#b5c1cc"/>
    <rect x="60" y="-212" width="22" height="40" rx="6" fill="#b5c1cc"/><circle cx="0" cy="-250" r="26" fill="#d94a4a"/><rect x="-6" y="-270" width="12" height="40" fill="#b23a3a"/>
    <ellipse cx="72" cy="-6" rx="46" ry="9" fill="#9fd6ff" opacity=".7"/>`,
  stone: () => `<ellipse cx="0" cy="-34" rx="120" ry="48" fill="#8b8f99"/><ellipse cx="-20" cy="-50" rx="70" ry="20" fill="#a3a8b2"/><ellipse cx="40" cy="-20" rx="40" ry="10" fill="#767a84"/>`,
  bigLeaf: () => `<path d="M-520 0 C-400 -260 300 -300 560 -40 C300 40 -300 60 -520 0Z" fill="#4fae46"/>
    <path d="M-500 -5 C-200 -80 200 -100 540 -40" stroke="#2f8a33" stroke-width="8" fill="none"/>
    ${[-300, -100, 100, 300].map(x => `<path d="M${x} ${-50 - Math.abs(x) / 30} q60 -60 120 -110 M${x} ${-50 - Math.abs(x) / 30} q60 40 120 50" stroke="#3a9a3a" stroke-width="5" fill="none"/>`).join('')}`,
  grass: () => Array.from({ length: 40 }, (_, i) => { const x = i * 41 - 800; return `<path d="M${x} 360 q8 -60 4 -110 M${x + 10} 360 q-6 -50 10 -90" stroke="#3c8f3a" stroke-width="7" fill="none"/>` }).join(''),
  flowers: () => [[-650, 330], [-480, 360], [-120, 345], [260, 350], [520, 330], [700, 355], [-300, 380]].map(([x, y], i) =>
    `<g class="sway" data-i="${i}" transform="translate(${x} ${y})"><path d="M0 0 v-46" stroke="#3a8a35" stroke-width="5"/><path d="M0 -20 q-14 -6 -18 -18 q14 0 18 12" fill="#4c9e3f"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-60" rx="9" ry="16" fill="${['#ff8fb1', '#ffd23f', '#ffffff', '#c9a7ff'][i % 4]}" transform="rotate(${a} 0 -46)"/>`).join('')}<circle cx="0" cy="-46" r="8" fill="#ffb02e"/></g>`).join(''),
  quilt: () => `<g opacity=".0" class="quilt"><rect x="-500" y="210" width="1000" height="230" rx="30" fill="#fff8e7" stroke="#e9cf9a" stroke-width="10"/>${Array.from({ length: 24 }, (_, i) => `<rect x="${(i % 8) * 120 - 480}" y="${Math.floor(i / 8) * 70 + 230}" width="114" height="64" rx="8" fill="${['#62b553', '#79c95f', '#4f9f45'][(i + Math.floor(i / 8)) % 3]}"/>`).join('')}
    <circle cx="-300" cy="320" r="26" fill="#f79a2e"/><circle cx="380" cy="260" r="14" fill="#cfd8e0"/><circle cx="380" cy="260" r="26" fill="#fff" opacity=".35"/></g>`,
}

// Small seeded random, so the same scene always gets the same details.
const rand = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

// Ground details sprinkled on every scene: pebbles, mushrooms, tiny flower clusters, clover.
function details(seed, night) {
  const r = rand(seed * 97 + 13), out = []
  for (let i = 0; i < 9; i++) {
    const x = 60 + r() * 1480, y = 720 + r() * 230, k = r()
    if (k < .35) out.push(`<ellipse cx="${x}" cy="${y}" rx="${10 + r() * 14}" ry="${6 + r() * 6}" fill="${night ? '#3c4a52' : '#a9a49a'}"/><ellipse cx="${x - 3}" cy="${y - 3}" rx="5" ry="2" fill="#fff" opacity=".35"/>`)
    else if (k < .55) out.push(`<g transform="translate(${x} ${y}) scale(${.7 + r() * .5})"><rect x="-5" y="-26" width="10" height="26" rx="4" fill="#f4ead6"/><path d="M-22 -24 Q0 -52 22 -24Z" fill="#e2483d"/><circle cx="-8" cy="-34" r="3.5" fill="#fff"/><circle cx="7" cy="-30" r="3" fill="#fff"/></g>`)
    else if (k < .8) out.push(`<g transform="translate(${x} ${y})">${[[-10, 0], [0, -8], [10, 0]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy - 12}" r="6" fill="${['#fff', '#ffd23f', '#ff9ec0'][Math.floor(r() * 3)]}"/>`).join('')}<path d="M0 0 v-10" stroke="#3a8a35" stroke-width="3"/></g>`)
    else out.push(`<g transform="translate(${x} ${y})" fill="${night ? '#2c5a46' : '#47a03f'}"><circle cx="-7" cy="-6" r="7"/><circle cx="7" cy="-6" r="7"/><circle cx="0" cy="-15" r="7"/></g>`)
  }
  return out.join('')
}

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const GROUND = ['walk', 'hop', 'bob', 'peek', 'sleep', 'hopAhead', 'land']
const FLYING = ['fly', 'circle', 'trip', 'land']

export function stageHtml({ w, h, fonts, scene, subs = [], total, title, sub, end, part, cont, brand = true, seed = 1 }) {
  const tall = h > w
  const [skyTop, skyBottom, far, hill1, hill2, light] = SKY[scene.sky] || SKY.day
  const night = scene.sky === 'night', sunset = scene.sky === 'sunset'
  // The world (1600×1000) covers the scene area; reels keep its middle part.
  const sceneH = tall ? 1250 : h
  const scale = tall ? 0.95 : w / 1600
  const worldLeft = tall ? -(1600 * scale - w) / 2 : 0
  const worldTop = tall ? sceneH - 1000 * scale : h - 1000 * scale - 70
  const props = scene.props.map(p => p.svg === 'quilt' ? `<g transform="translate(420 -150) scale(.55)">${PROPS.quilt()}</g>`
    : p.svg === 'flowers' || p.svg === 'grass'
    ? `<g transform="translate(800 640)">${PROPS[p.svg]()}</g>`
    : `<g transform="translate(${p.x} ${p.y}) scale(${p.s || 1})">${PROPS[p.svg]()}</g>`).join('')
  const r = rand(seed * 31 + 7)
  const stars = Array.from({ length: 90 }, () => [r() * 1600, r() * 540, 1 + r() * 2.6])
  const farTrees = Array.from({ length: 9 }, (_, i) => [80 + i * 180 + r() * 60, 560 + r() * 40, .6 + r() * .5])
  const tufts = Array.from({ length: 16 }, (_, i) => [i * 105 + r() * 40 - 20, 1000 + r() * 30, .8 + r() * .7])
  const words = title ? title.split(' ') : []
  const data = { scene, subs, total, tall, night }
  return `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>${fonts}
  *{box-sizing:border-box;margin:0}body{width:${w}px;height:${h}px;overflow:hidden;font-family:Heebo,sans-serif;color:#fff;
    background:radial-gradient(circle at 50% 40%,#232a63,#0d1130 70%)}
  #view{position:absolute;left:0;top:0;width:${w}px;height:${sceneH}px;overflow:hidden;background:linear-gradient(${skyTop},${skyBottom} 72%)}
  #cam{position:absolute;inset:0;transform-origin:50% 62%}
  .world{position:absolute;left:${worldLeft}px;top:${worldTop}px;width:1600px;height:1000px;transform-origin:0 0;transform:scale(${scale})}
  .world svg{position:absolute;left:0;top:0;overflow:visible}
  .e{position:absolute;left:0;top:0;font-family:'Noto Color Emoji';line-height:1;will-change:transform;transform-origin:50% 100%}
  .e span{display:inline-block}
  .shadow{position:absolute;left:0;top:0;border-radius:50%;background:radial-gradient(rgba(0,0,0,.28),rgba(0,0,0,0) 70%)}
  #vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(10,10,40,${night ? .55 : .28}) 100%)}
  #glow{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:${night ? .0 : .5};background:radial-gradient(circle at 86% 8%,${light} 0,rgba(255,255,255,0) 45%)}
  .brand{position:absolute;top:${tall ? 70 : 34}px;right:${tall ? 50 : 44}px;padding:${tall ? '12px 26px' : '8px 20px'};border-radius:99px;background:rgba(20,26,58,.55);font-weight:700;font-size:${tall ? 36 : 28}px}
  .part{position:absolute;top:${tall ? 150 : 34}px;${tall ? 'right' : 'left'}:${tall ? 50 : 44}px;padding:6px 18px;border-radius:99px;background:#ffe9a8;color:#1b1b4b;font-weight:900;font-size:${tall ? 32 : 26}px}
  #sub{position:absolute;${tall ? `top:${sceneH}px;bottom:0;left:0;right:0;padding:40px 56px 120px;display:flex;align-items:center;justify-content:center;color:#fff8e7`
    : 'left:50%;bottom:40px;transform:translateX(-50%);max-width:1520px;padding:20px 46px;border-radius:30px;background:#fff8e7;color:#3b2a1a;border:5px solid #f0d49c;box-shadow:0 10px 30px rgba(0,0,0,.25)'};
    font-size:${tall ? 60 : 46}px;line-height:1.4;text-align:center;font-weight:700}
  ${tall ? '#subbg{position:absolute;top:' + sceneH + 'px;bottom:0;left:0;right:0;background:linear-gradient(#1b1f4d,#10132e)}#subbg:before{content:"";position:absolute;left:0;right:0;top:-40px;height:40px;background:linear-gradient(rgba(27,31,77,0),#1b1f4d)}' : ''}
  #sub:empty{display:none}
  #sub b{font-weight:700}#sub i{font-style:normal;opacity:.42}
  #sub u{text-decoration:none;color:${tall ? '#ffd36a' : '#d9631e'}}
  .titlebox{position:absolute;left:${tall ? 0 : 60}px;right:${tall ? 0 : 860}px;top:${tall ? 250 : 100}px;text-align:center}
  .titlebox h1{font-weight:900;font-size:${tall ? 110 : 112}px;line-height:1.1;color:#fff;text-shadow:0 6px 0 #c2571c,0 12px 30px rgba(0,0,40,.4)}
  .titlebox h1 span{display:inline-block;transform-origin:50% 90%}
  .titlebox p{display:inline-block;font-size:${tall ? 40 : 36}px;font-weight:700;margin-top:18px;padding:6px 22px;border-radius:99px;background:rgba(255,248,231,.92);color:#7a3d14}
  .endbox{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${tall ? 36 : 22}px;padding:0 80px;text-align:center}
  .endbox>*{opacity:0}
  .endbox h1{font-weight:900;font-size:${tall ? 96 : 92}px;text-shadow:0 6px 0 #4a3aa7,0 12px 30px rgba(0,0,0,.4)}
  .endbox .m{font-size:${tall ? 48 : 42}px;line-height:1.5;max-width:1400px;padding:18px 40px;border-radius:28px;background:rgba(255,248,231,.94);color:#3b2a1a}
  .endbox .u{font-weight:900;font-size:${tall ? 78 : 70}px;color:#ffe9a8}.endbox .s{font-size:${tall ? 40 : 36}px;opacity:.9}
  .cont{position:absolute;left:0;right:0;bottom:${tall ? 40 : 150}px;text-align:center;font-weight:900;font-size:${tall ? 44 : 36}px;color:#ffe9a8}
  </style></head><body>
  ${tall ? '<div id="subbg"></div>' : ''}
  <div id="view"><div id="cam">
    <div class="world" id="farL"><svg width="1600" height="1000" viewBox="0 0 1600 1000">
      <defs>
        <radialGradient id="halo"><stop offset="0" stop-color="${light}" stop-opacity=".55"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>
        <linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hill1}"/><stop offset="1" stop-color="${hill2}"/></linearGradient>
        <linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hill2}"/><stop offset=".6" stop-color="${hill2}"/><stop offset="1" stop-color="#2e5e2a" stop-opacity="${night ? 0 : .6}"/></linearGradient>
        <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${sunset ? '#ffd2b0' : '#dfeefa'}"/></linearGradient>
      </defs>
      ${night ? stars.map(([x, y, s], i) => `<circle class="star" data-i="${i}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#fff"/>`).join('') + '<line id="shoot" x1="0" y1="0" x2="-160" y2="-60" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0"/>' : ''}
      ${night ? '<g transform="translate(1300 150)"><circle r="190" fill="url(#halo)"/><circle r="70" fill="#fff4c4"/><circle cx="-20" cy="-14" r="12" fill="#efe2a8"/><circle cx="18" cy="20" r="8" fill="#efe2a8"/></g>'
      : sunset ? '<circle cx="1250" cy="540" r="300" fill="url(#halo)"/><circle id="sun" cx="1250" cy="520" r="110" fill="#ffcf6a"/>'
      : `<g transform="translate(1380 140)"><g id="rays">${Array.from({ length: 12 }, (_, i) => `<path d="M0 0 L-24 -520 L24 -520Z" fill="${light}" opacity=".18" transform="rotate(${i * 30})"/>`).join('')}</g><circle r="190" fill="url(#halo)"/><circle r="80" fill="#ffd84d"/><circle r="64" fill="#ffe57a"/></g>`}
      ${sunset ? [[300, 300], [380, 270], [340, 330]].map(([x, y]) => `<path class="gull" d="M${x - 14} ${y} q7 -8 14 0 q7 -8 14 0" stroke="#3b2a4a" stroke-width="3" fill="none"/>`).join('') : ''}
      <g id="clouds">${!night && scene.fx?.includes('clouds') ? [[200, 140, 1], [800, 90, 0.8], [1250, 260, 0.7], [1500, 180, .6]].map(([x, y, s]) => `<g class="cloud" data-x="${x}" data-y="${y}" data-s="${s}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="8" rx="120" ry="40" fill="#000" opacity=".05"/><ellipse rx="110" ry="42" fill="url(#cl)"/><ellipse cx="-60" cy="-26" rx="60" ry="44" fill="url(#cl)"/><ellipse cx="40" cy="-38" rx="70" ry="52" fill="url(#cl)"/></g>`).join('') : ''}</g>
      <path d="M0 600 C200 540 380 560 560 590 C760 620 980 520 1200 560 C1380 590 1500 540 1600 560 L1600 1000 L0 1000Z" fill="${far}" opacity=".9"/>
      ${farTrees.map(([x, y, s]) => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})" opacity=".55"><rect x="-5" y="-60" width="10" height="60" fill="${night ? '#1a2440' : '#7d8f86'}"/><circle cy="-80" r="38" fill="${night ? '#1d2a4a' : '#8fb39a'}"/></g>`).join('')}
    </svg></div>
    <div class="world" id="midL"><svg width="1600" height="1000" viewBox="0 0 1600 1000">
      <path d="M0 620 C250 520 520 560 760 610 C1000 660 1250 540 1600 590 L1600 1500 L0 1500Z" fill="url(#h1)"/>
      <path d="M0 700 C300 640 700 690 900 700 C1150 712 1350 650 1600 680 L1600 1500 L0 1500Z" fill="url(#h2)"/>
      <path d="M0 700 C300 640 700 690 900 700 C1150 712 1350 650 1600 680" stroke="#fff" stroke-width="5" opacity=".12" fill="none"/>
      ${scene.plain ? '' : details(seed, night)}
      ${props}
    </svg>
    <div id="cast"></div></div>
    <div class="world" id="fgL"><svg width="1600" height="1000" viewBox="0 0 1600 1000">
      ${tufts.map(([x, y, s], i) => `<g class="tuft" data-i="${i}" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})">${[-14, -4, 6, 16].map((dx, k) => `<path d="M${dx} 0 Q${dx + (k % 2 ? 10 : -10)} -50 ${dx + (k % 2 ? 4 : -6)} -${80 + k * 12}" stroke="${night ? '#163a2c' : ['#2f7d32', '#3e9b3a', '#4fae46'][k % 3]}" stroke-width="9" stroke-linecap="round" fill="none"/>`).join('')}</g>`).join('')}
    </svg></div>
  </div>
  <div id="glow"></div><div id="vignette"></div>
  ${title ? `<div class="titlebox"><h1>${words.map(x => `<span>${esc(x)}</span>`).join(' ')}</h1><p>${esc(sub || '')}</p></div>` : ''}
  ${end ? `<div class="endbox">${end}</div>` : ''}
  </div>
  <div id="sub"></div>
  ${brand ? '<div class="brand">🎂 עוגה בוגה · סיפורים לפני השינה</div>' : ''}
  ${part ? `<div class="part">${esc(part)}</div>` : ''}
  ${cont ? `<div class="cont">⬅ המשך בחלק ${cont}</div>` : ''}
  <script>{
  // Block scope: the page is reused for the next segment, so nothing may stay declared.
  const D = ${JSON.stringify(data)}
  const S = D.scene, T = D.total
  const GROUND = ${JSON.stringify(GROUND)}, FLYING = ${JSON.stringify(FLYING)}
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
  const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
  const back = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) }
  const lerp = (a, b, k) => a + (b - a) * k
  const pair = v => Array.isArray(v) ? v : [v, v]
  const cast = document.getElementById('cast')
  ${actorsJs}
  const view = document.getElementById('view'), cam = document.getElementById('cam'), sub = document.getElementById('sub')
  const farL = document.getElementById('farL'), fgL = document.getElementById('fgL')
  const clouds = [...document.querySelectorAll('.cloud')], stars = [...document.querySelectorAll('.star')]
  const tufts = [...document.querySelectorAll('.tuft')], sways = [...document.querySelectorAll('.sway')], gulls = [...document.querySelectorAll('.gull')]
  const quilt = document.querySelector('.quilt'), sun = document.getElementById('sun'), rays = document.getElementById('rays'), shoot = document.getElementById('shoot')
  const titleWords = [...document.querySelectorAll('.titlebox h1 span')], titleSub = document.querySelector('.titlebox p'), endItems = [...document.querySelectorAll('.endbox > *')]
  const base = ${scale}
  window.frame = function (t) {
    const p = clamp(t / T), k = ease(p)
    const c = S.cam || [1, 1], z = lerp(c[0], c[1], k), pan0 = c[2] || [0, 0], pan1 = c[3] || [0, 0]
    const px = lerp(pan0[0], pan1[0], k), py = lerp(pan0[1], pan1[1], k)
    cam.style.transform = 'translate(' + px + 'px,' + py + 'px) scale(' + z + ')'
    // Parallax: far hills move less than the camera, the foreground grass more.
    farL.style.transform = 'translate(' + (-px * .45 + t * -1.5) + 'px,' + (-py * .35) + 'px) scale(' + base + ')'
    fgL.style.transform = 'translate(' + (px * .35) + 'px,' + (py * .2) + 'px) scale(' + (base * 1.04) + ')'
    clouds.forEach((cl, i) => cl.setAttribute('transform', 'translate(' + (((+cl.dataset.x + t * (12 + i * 5)) % 1900) - 150) + ' ' + (+cl.dataset.y + Math.sin(t * .4 + i) * 6) + ') scale(' + cl.dataset.s + ')'))
    if (rays) rays.setAttribute('transform', 'rotate(' + (t * 4) + ')')
    if (sun && S.sky === 'sunset') sun.setAttribute('cy', 520 + p * 90)
    gulls.forEach((g, i) => g.setAttribute('transform', 'translate(' + (t * 18 + i * 10) + ' ' + (Math.sin(t + i) * 6) + ')'))
    tufts.forEach((g, i) => { const tr = g.getAttribute('transform').replace(/ rotate\\([^)]*\\)/, ''); g.setAttribute('transform', tr + ' rotate(' + (Math.sin(t * 1.3 + i * .7) * 5) + ')') })
    sways.forEach((g, i) => { const tr = g.getAttribute('transform').replace(/ rotate\\([^)]*\\)/, ''); g.setAttribute('transform', tr + ' rotate(' + (Math.sin(t * 1.6 + i) * 4) + ')') })
    stars.forEach((s, i) => {
      let o = .35 + Math.abs(Math.sin(t * (.8 + (i % 5) * .2) + i)) * .65
      if (S.fx?.includes('starsOneByOne')) o *= clamp((p - (i / stars.length) * .85) * 10)
      s.setAttribute('opacity', o)
    })
    if (shoot) { const f = (t % 7) / 1.1; shoot.setAttribute('opacity', f < 1 ? Math.sin(f * Math.PI) : 0); shoot.setAttribute('transform', 'translate(' + (1150 - f * 500) + ' ' + (80 + f * 190) + ')') }
    if (quilt) quilt.setAttribute('opacity', clamp((p - .45) * 4))
    for (const a of actors) pose(a, t, p)
    titleWords.forEach((wd, i) => { const f = clamp((t - .35 - i * .28) / .5); wd.style.opacity = f > 0 ? 1 : 0; wd.style.transform = 'scale(' + back(f) + ') translateY(' + (1 - f) * 30 + 'px)' })
    if (titleSub) { const f = clamp((t - .4 - titleWords.length * .28) / .5); titleSub.style.opacity = f; titleSub.style.transform = 'translateY(' + (1 - f) * 20 + 'px)' }
    endItems.forEach((el, i) => { const f = clamp((t - .4 - i * .45) / .5); el.style.opacity = f; el.style.transform = 'scale(' + (.8 + .2 * back(f)) + ')' })
    // Subtitles: words already said, the current word highlighted, the rest dimmed.
    const line = D.subs.find(s => t >= s.from && t < s.to)
    if (!line) sub.innerHTML = ''
    else {
      const f = clamp((t - line.from) / Math.max(.1, line.to - line.from - .25)), ws = line.text.split(' ')
      const len = line.text.length; let acc = 0, cur = false
      sub.innerHTML = '<div>' + ws.map(x => { const st = acc / len; acc += x.length + 1; const en = acc / len
        if (en <= f) return '<b>' + x + '</b>'
        if (!cur && st <= f + .02) { cur = true; return '<u>' + x + '</u>' }
        return '<i>' + x + '</i>' }).join(' ') + '</div>'
    }
    // Iris: the scene opens from a circle and closes into one between segments.
    const open = Math.min(clamp(t / .7), clamp((T - t) / .6)), R = Math.hypot(${w}, ${sceneH})
    view.style.clipPath = open >= 1 ? 'none' : 'circle(' + (ease(open) * R * .6) + 'px at 50% 55%)'
    sub.style.opacity = Math.min(clamp(t / .5), clamp((T - t) / .4))
  }
  window.frame(0)
  }</script></body></html>`
}

// Actor setup and posing, shared by the page (as source) — kept here so the HTML stays readable.
const actorsJs = `
  const actors = []
  for (const c of S.cast) {
    if (c.a === 'ants') for (let k = 0; k < c.n; k++) actors.push({ ...c, a: 'walk', delay: k * 0.035, n: 0 })
    else actors.push(c)
  }
  if (S.fx?.includes('butterflies')) actors.push({ e: '🦋', s: 60, a: 'flutter', x: 500, y: 420, seed: 1 }, { e: '🦋', s: 50, a: 'flutter', x: 1100, y: 380, seed: 2 })
  if (S.fx?.includes('hearts')) for (let k = 0; k < 4; k++) actors.push({ e: '💛', s: 50, a: 'rise', x: 700 + k * 90, y: 700, seed: k })
  if (S.fx?.includes('fireflies')) for (let k = 0; k < 12; k++) actors.push({ e: '✨', s: 30, a: 'firefly', x: 120 + k * 120, y: 520 + (k % 4) * 70, seed: k })
  if (S.fx?.includes('sparkles')) for (let k = 0; k < 5; k++) actors.push({ e: '✨', s: 40, a: 'twinkle', x: 300 + k * 230, y: 420 + (k % 2) * 120, seed: k })
  if (!D.night) for (let k = 0; k < 10; k++) actors.push({ e: '<i style="display:block;width:10px;height:10px;border-radius:50%;background:rgba(255,255,230,.85);box-shadow:0 0 10px #fff"></i>', s: 10, a: 'mote', x: 80 + k * 150, y: 300 + (k % 3) * 120, seed: k + 3 })
  for (const a of actors) {
    a.el = document.createElement('div'); a.el.className = 'e'; a.el.style.fontSize = a.s + 'px'
    a.el.innerHTML = '<span>' + a.e + '</span>' + (a.rider ? '<span style="position:absolute;font-size:' + a.rider.s + 'px;left:' + (a.s * .1) + 'px;top:' + (-a.rider.s * .55) + 'px">' + a.rider.e + '</span>' : '')
    if (D.night) a.el.style.filter = 'brightness(.85)'
    if (GROUND.includes(a.a) && a.s >= 90) { a.sh = document.createElement('div'); a.sh.className = 'shadow'; cast.appendChild(a.sh) }
    if (FLYING.includes(a.a)) a.trail = Array.from({ length: 5 }, () => { const d = document.createElement('div'); d.className = 'e'; d.style.fontSize = '26px'; d.innerHTML = '✨'; cast.appendChild(d); return d })
    cast.appendChild(a.el)
  }
  // Pure position for actor a at time t (p = t / T): used for the actor and its trail.
  function place(a, t, p) {
    const [x0, x1] = pair(a.x), [y0, y1] = pair(a.y), at = a.at || [0, 1]
    const k = ease(clamp((p - at[0] - (a.delay || 0)) / (at[1] - at[0])))
    let x = lerp(x0, x1, k), y = lerp(y0, y1, k), rot = 0, sx = x1 > x0 ? -1 : 1, sc = 1, sy = 1, op = 1
    const gy = y, moving = k > 0 && k < 1, ph = (a.seed || 0) * 1.7
    switch (a.a) {
      case 'walk': if (moving) { y -= Math.abs(Math.sin(t * 5)) * 5; rot = Math.sin(t * 5) * 3 } else sy = 1 + Math.sin(t * 1.5) * .02; break
      case 'hop': { const s = Math.abs(Math.sin(t * 3.2)); y -= s * 34; rot = Math.sin(t * 3.2) * 4; if (s < .2) { sy = .9 + s * .5; sc = 1.06 - s * .3 } break }
      case 'bob': y -= Math.sin(t * 1.6) * 6; rot = Math.sin(t * 1.2) * 2; sy = 1 + Math.sin(t * 1.6) * .02; break
      case 'peek': rot = -12 + Math.sin(t * 1.3) * 8; y -= Math.abs(Math.sin(t * 2)) * 8; break
      case 'fly': y += Math.sin(t * 4) * 26 * (1 - k * .6); sy = 1 + Math.sin(t * 14) * .07; break
      case 'land': if (moving) { y += Math.sin(t * 4) * 20; sy = 1 + Math.sin(t * 14) * .07 } else if (k >= 1) { const s = Math.abs(Math.sin(t * 3)); y -= s * 22; if (s < .2) sy = .92 } break
      case 'circle': { const r = a.r || 300, w = (t / 4) * Math.PI * 2; x = x0 + Math.cos(w) * r; y = y0 + Math.sin(w) * r * .35; sx = Math.sin(w) > 0 ? 1 : -1; sy = 1 + Math.sin(t * 14) * .07; rot = Math.cos(w) * 10; if (a.at && k >= 1) { x = x0 - r * .4; y = 760; sy = 1; rot = 0 } break }
      case 'trip': { const q = clamp(p / (at[1] || 1)); const go = q < .5 ? ease(q * 2) : ease((1 - q) * 2); x = lerp(x0, x1, go); y = lerp(y0, y1, go) - Math.sin(go * Math.PI) * 220 + Math.sin(t * 5) * 10; sx = q < .5 ? 1 : -1; if (q >= 1) y -= Math.abs(Math.sin(t * 3)) * 22; else sy = 1 + Math.sin(t * 14) * .07; break }
      case 'hopAhead': { const step = Math.floor(p * 5), f = p * 5 - step, g = ease(clamp(f * 2)); x = lerp(x0, x1, (step + g) / 5); const h = Math.sin(clamp(f * 2) * Math.PI); y -= h * 70; if (f > .5) rot = Math.sin(t * 2) * 6; if (h < .15 && f < .5) sy = .9; break }
      case 'sleep': sc = 1 + Math.sin(t * 1.4) * .025; sy = 1 + Math.sin(t * 1.4) * .03; break
      case 'zzz': { const f = (t % 3) / 3; y -= f * 120; x += Math.sin(t * 2) * 14; op = Math.sin(f * Math.PI); sc = .7 + f * .5; break }
      case 'pop': sc = .6 + .4 * back(clamp((p - (a.show?.[0] || 0)) * 8)); y -= Math.sin(t * 2) * 6; break
      case 'drip': { const f = (t % 1.6) / 1.6; y += f * 90; op = 1 - f; sy = 1 + f * .3; break }
      case 'glint': sc = 1 + Math.sin(t * 3) * .12; rot = Math.sin(t * 2) * 8; break
      case 'twinkle': sc = .7 + Math.abs(Math.sin(t * 2 + ph)) * .5; op = .5 + Math.abs(Math.sin(t * 2 + ph)) * .5; rot = t * 20; break
      case 'flutter': x += Math.sin(t * .7 + ph) * 260; y += Math.sin(t * 1.9 + ph) * 60; sy = 1 + Math.sin(t * 16) * .15; sx = Math.cos(t * .7 + ph) > 0 ? -1 : 1; break
      case 'rise': { const f = ((t + ph) % 4) / 4; y -= f * 260; x += Math.sin(t * 2 + ph) * 20; op = Math.sin(f * Math.PI); break }
      case 'firefly': x += Math.sin(t * .6 + ph) * 60; y += Math.cos(t * .8 + ph) * 40; op = .25 + Math.abs(Math.sin(t * 1.3 + ph)) * .75; break
      case 'mote': x += Math.sin(t * .3 + ph) * 80 + t * 6; y += Math.sin(t * .5 + ph * 2) * 50; op = .25 + Math.abs(Math.sin(t * .9 + ph)) * .5; break
    }
    if (a.flip) sx = -sx
    if (a.show) { const [i, o] = a.show; const fi = clamp((p - i) * 12), fo = o < 1 ? clamp((o - p) * 12) : 1; op *= Math.min(fi, fo); if (a.a !== 'pop' && a.a !== 'zzz') sc *= .7 + .3 * back(fi) }
    return { x, y, gy, rot, sx, sc, sy, op }
  }
  function pose(a, t, p) {
    const q = place(a, t, p)
    a.el.style.opacity = q.op
    a.el.style.transform = 'translate(' + (q.x - a.s / 2) + 'px,' + (q.y - a.s) + 'px) rotate(' + q.rot + 'deg) scale(' + (q.sx * q.sc) + ',' + (q.sc * q.sy) + ')'
    if (a.sh) { const lift = Math.max(0, q.gy - q.y), w = a.s * .8 * (1 - Math.min(.5, lift / 200)); a.sh.style.opacity = q.op * (1 - Math.min(.7, lift / 150)); a.sh.style.width = w + 'px'; a.sh.style.height = w * .25 + 'px'; a.sh.style.transform = 'translate(' + (q.x - w / 2) + 'px,' + (q.gy - w * .14) + 'px)' }
    if (a.trail) a.trail.forEach((d, i) => {
      const dt = (i + 1) * .09, b = place(a, t - dt, (t - dt) / T), moved = Math.hypot(b.x - q.x, b.y - q.y)
      d.style.opacity = moved > 12 ? (.55 - i * .1) * q.op : 0
      d.style.transform = 'translate(' + (b.x - 13 + Math.sin(t * 9 + i) * 6) + 'px,' + (b.y - a.s * .55) + 'px) scale(' + (1 - i * .15) + ')'
    })
  }`

// Moments in a segment that get a soft sound effect: [seconds into the scene, kind].
// Mirrors the motions above (appear → chime, flight → wings, drip → drop, hop → chirp…).
export function sceneEvents(scene, total) {
  const ev = [], r = rand(7 + total * 100 | 0)
  for (const a of scene.cast || []) {
    const at = a.at || [0, 1], start = (a.show?.[0] || 0) * total
    if (a.show && a.show[0] > 0) ev.push([start, a.e === '💬' ? 'pop' : 'chime'])
    if (a.a === 'drip') for (let t = start + 1.3; t < total - .5; t += 1.6) ev.push([t, 'drip'])
    if (['fly', 'land', 'trip'].includes(a.a)) ev.push([at[0] * total + .2, 'wings'])
    if (a.a === 'circle') for (let t = start + .3; t < (a.at ? at[1] * total : total) - 1; t += 4) ev.push([t, 'wings'])
    if (a.a === 'land' || a.a === 'trip') ev.push([at[1] * total + .3, 'chirp'])
    if (a.e === '🐦' && ['hop', 'peek', 'hopAhead'].includes(a.a)) for (let t = start + 1 + r() * 2; t < total - 1; t += 5 + r() * 4) ev.push([t, 'chirp'])
    if (a.a === 'twinkle' || a.a === 'glint') for (let t = start + .8; t < total - 1; t += 4.5) ev.push([t, 'twinkle'])
    if (a.a === 'zzz') ev.push([start + .2, 'sleepy'])
  }
  if (scene.fx?.includes('hearts')) ev.push([1.2, 'chime'])
  if (scene.fx?.includes('starsOneByOne')) for (let k = 1; k <= 6; k++) ev.push([total * k * .13, 'twinkle'])
  if (scene.end) ev.push([.5, 'chime'], [1.4, 'twinkle'])
  ev.push([total - .55, 'whoosh'])
  return ev.filter(([t]) => t >= 0 && t < total).sort((a, b) => a[0] - b[0])
}
