import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { buildLevel, isFree, blocker, freeCubes, DIRS } from '../logic/cubes'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// Real 3D: glossy rounded cubes floating in space, raised arrows on every face,
// drag to spin the block, tap a cube to launch it.
const PALETTE = ['#ffd36e', '#ff9ec3', '#7fdcb0', '#8fcaff', '#c9a8ff', '#ffb084']
const ARROW_COLOR = '#25304f'
const LIVES = 3
const V = (a) => new THREE.Vector3(a[0], a[1], a[2])

// One merged "arrows on all six faces" geometry per direction, shared by every cube.
function arrowShape() {
  const s = new THREE.Shape()
  const pts = [[-0.3, 0.075], [0.04, 0.075], [0.04, 0.19], [0.31, 0], [0.04, -0.19], [0.04, -0.075], [-0.3, -0.075]]
  s.moveTo(...pts[0]); pts.slice(1).forEach(p => s.lineTo(...p)); s.closePath()
  return s
}
function dotShape(ring) {
  const s = new THREE.Shape()
  s.absarc(0, 0, 0.16, 0, Math.PI * 2, false)
  if (ring) { const h = new THREE.Path(); h.absarc(0, 0, 0.09, 0, Math.PI * 2, true); s.holes.push(h) }
  return s
}
const EXTRUDE = { depth: 0.022, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 2, curveSegments: 18 }
function arrowsFor(d) {
  const dv = V(d)
  const parts = DIRS.map(n => {
    const nv = V(n)
    const along = dv.dot(nv)
    let geo, x
    if (Math.abs(along) > 0.5) {
      geo = new THREE.ExtrudeGeometry(dotShape(along < 0), EXTRUDE)
      x = Math.abs(n[0]) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
    } else {
      geo = new THREE.ExtrudeGeometry(arrowShape(), EXTRUDE)
      x = dv.clone()
    }
    const z = nv.clone(), y = new THREE.Vector3().crossVectors(z, x)
    const m = new THREE.Matrix4().makeBasis(x, y, z).setPosition(nv.clone().multiplyScalar(0.462))
    geo.applyMatrix4(m)
    return geo
  })
  return mergeGeometries(parts)
}

function fitCamera(s, reset) {
  const vfov = THREE.MathUtils.degToRad(s.camera.fov)
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * s.camera.aspect)
  const dist = (s.radius * 1.0) / Math.sin(Math.min(vfov, hfov) / 2)
  const dir = reset ? new THREE.Vector3(0.62, 0.5, 0.78).normalize() : s.camera.position.clone().normalize()
  s.camera.position.copy(dir.multiplyScalar(dist))
  s.controls.minDistance = dist * 0.55
  s.controls.maxDistance = dist * 1.8
  s.camGoal = null
}

export default function FlyingCubes({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('flying-cubes', { level: 1 })
  const [level, setLevel] = useState(progress.level)
  const [run, setRun] = useState(0) // bump to rebuild the same level
  const [left, setLeft] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [won, setWon] = useState(false)
  const lost = mistakes >= LIVES
  const [toast, setToast] = useState(null)
  const [boxRef, box] = useBox()
  const mountRef = useRef(null)
  const three = useRef(null)
  const api = useRef({})

  // --- one-time 3D setup ---
  useEffect(() => {
    const mount = mountRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    renderer.domElement.className = 'fc-canvas'
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    const sun = new THREE.DirectionalLight('#ffffff', 1.1)
    sun.position.set(3, 6, 4)
    scene.add(sun, new THREE.HemisphereLight('#ffffff', '#b9a6ff', 0.55))
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200)
    camera.position.set(6, 4.6, 7.5)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.rotateSpeed = 0.85
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.2
    const stopAuto = () => { controls.autoRotate = false }
    renderer.domElement.addEventListener('pointerdown', stopAuto)

    const geo = new RoundedBoxGeometry(0.93, 0.93, 0.93, 4, 0.13)
    const mats = PALETTE.map(c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.34, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.22 }))
    const arrowMat = new THREE.MeshStandardMaterial({ color: ARROW_COLOR, roughness: 0.45 })
    const arrowGeos = new Map(DIRS.map(d => [d.join(','), arrowsFor(d)]))
    const group = new THREE.Group()
    scene.add(group)

    const state = { renderer, scene, camera, controls, geo, mats, arrowMat, arrowGeos, group, meshes: new Map(), anims: [], camGoal: null, radius: 2 }
    three.current = state
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const now = nowSec()
      // camera glide (hint)
      if (state.camGoal) {
        camera.position.lerp(state.camGoal, 0.09)
        if (camera.position.distanceTo(state.camGoal) < 0.02) state.camGoal = null
      }
      // per-cube animations
      state.anims = state.anims.filter(a => {
        const t = Math.min(1, (now - a.t0) / a.dur)
        const { mesh, cube } = a
        if (a.type === 'fly') {
          const e = t * t * 11
          mesh.position.set(cube.px + cube.d[0] * e, cube.py + cube.d[1] * e, cube.pz + cube.d[2] * e)
          mesh.rotation.set(cube.d[1] * t * 2, cube.d[2] * t * 2, cube.d[0] * t * 2)
          const o = 1 - Math.max(0, (t - 0.4) / 0.6)
          mesh.traverse(m => { if (m.material) m.material.opacity = o })
          if (t >= 1) { group.remove(mesh); return false }
        } else if (a.type === 'bump') {
          const e = Math.sin(t * Math.PI) * 0.22
          mesh.position.set(cube.px + cube.d[0] * e, cube.py + cube.d[1] * e, cube.pz + cube.d[2] * e)
          mesh.material.emissive.set(a.color).multiplyScalar(0.55 * (1 - t))
          if (t >= 1) { mesh.material = mats[cube.color % mats.length]; mesh.position.set(cube.px, cube.py, cube.pz); return false }
        } else if (a.type === 'glow') {
          mesh.material.emissive.set(a.color).multiplyScalar(0.45 * (0.5 + 0.5 * Math.sin(now * 9)) * (1 - t))
          if (t >= 1) { mesh.material = mats[cube.color % mats.length]; return false }
        }
        return true
      })
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    // tap (not drag) → launch
    let down = null
    const onDown = e => { down = { x: e.clientX, y: e.clientY } }
    const onUp = e => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) { down = null; return }
      down = null
      const r = renderer.domElement.getBoundingClientRect()
      const ray = new THREE.Raycaster()
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
      const hit = ray.intersectObjects([...state.meshes.values()].filter(m => !m.userData.cube.gone), true)[0]
      let obj = hit?.object
      while (obj && !obj.userData.cube) obj = obj.parent
      if (obj) api.current.tap?.(obj.userData.cube)
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)

    return () => {
      cancelAnimationFrame(frame)
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointerdown', stopAuto)
      controls.dispose()
      geo.dispose(); mats.forEach(m => m.dispose()); arrowMat.dispose(); arrowGeos.forEach(g => g.dispose())
      scene.environment?.dispose(); pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      three.current = null
    }
  }, [])

  // --- size ---
  useEffect(() => {
    const s = three.current
    if (!s || !box.w || !box.h) return
    s.renderer.setSize(box.w, box.h)
    s.camera.aspect = box.w / box.h
    s.camera.updateProjectionMatrix()
    fitCamera(s)
  }, [box.w, box.h])

  // --- level ---
  const boardRef = useRef(null)
  useEffect(() => {
    const s = three.current
    if (!s) return
    const board = buildLevel(level)
    boardRef.current = board
    s.group.clear(); s.meshes.clear(); s.anims = []
    for (const c of board.cubes) {
      const mesh = new THREE.Mesh(s.geo, s.mats[c.color % s.mats.length])
      mesh.add(new THREE.Mesh(s.arrowGeos.get(c.d.join(',')), s.arrowMat))
      mesh.position.set(c.px, c.py, c.pz)
      mesh.userData.cube = c
      s.group.add(mesh)
      s.meshes.set(c.id, mesh)
    }
    s.radius = board.radius
    s.controls.autoRotate = true
    fitCamera(s, true)
    setLeft(board.cubes.length); setMistakes(0); setWon(false)
  }, [level, run])

  const tap = cube => {
    const s = three.current, board = boardRef.current
    if (!s || !board || won || lost) return
    const mesh = s.meshes.get(cube.id)
    const at = nowSec()
    if (isFree(board.cubes, cube)) {
      cube.gone = true
      s.anims = s.anims.filter(a => a.mesh !== mesh)
      mesh.material = mesh.material.clone(); mesh.material.transparent = true
      mesh.children[0].material = s.arrowMat.clone(); mesh.children[0].material.transparent = true
      s.anims.push({ type: 'fly', mesh, cube, t0: at, dur: 0.55 })
      const remaining = board.cubes.filter(c => !c.gone).length
      setLeft(remaining)
      if (!remaining) setTimeout(() => setWon(true), 650)
    } else {
      setMistakes(m => m + 1)
      setToast({ k: performance.now(), text: 'חסום! יש קובייה בדרך — איבדתם לב 💔' })
      if (!s.anims.some(a => a.mesh === mesh)) {
        mesh.material = mesh.material.clone()
        s.anims.push({ type: 'bump', mesh, cube, t0: at, dur: 0.35, color: '#ff3b3b' })
      }
      const b = blocker(board.cubes, cube)
      const bm = b && s.meshes.get(b.id)
      if (bm && !s.anims.some(a => a.mesh === bm)) {
        bm.material = bm.material.clone()
        s.anims.push({ type: 'glow', mesh: bm, cube: b, t0: at, dur: 0.9, color: '#ff8a00' })
      }
    }
  }

  useEffect(() => { api.current.tap = tap })

  // Automated-test helper, only when localStorage 'buga-debug' is '1': solves one step.
  useEffect(() => {
    let debug = false
    try { debug = localStorage.getItem('buga-debug') === '1' } catch { /* ignore */ }
    if (!debug) return undefined
    window.__flyingCubesStep = () => {
      const c = freeCubes(boardRef.current?.cubes || [])[0]
      if (c) api.current.tap?.(c)
      return !!c
    }
    return () => { delete window.__flyingCubesStep }
  }, [])

  const hint = () => {
    const s = three.current, board = boardRef.current
    if (!s || !board) return
    const free = freeCubes(board.cubes)
    if (!free.length) return
    const c = free[Math.floor(Math.random() * free.length)]
    s.controls.autoRotate = false
    // look at it from the side it will fly out of — that side is always open
    const dist = s.camera.position.length()
    const side = V(c.d).add(new THREE.Vector3(0.35, 0.45, 0.3)).normalize()
    s.camGoal = side.multiplyScalar(dist)
    const mesh = s.meshes.get(c.id)
    if (!s.anims.some(a => a.mesh === mesh)) {
      mesh.material = mesh.material.clone()
      s.anims.push({ type: 'glow', mesh, cube: c, t0: nowSec(), dur: 2.6, color: '#ffffff' })
    }
  }
  const start = n => { setLevel(n); setRun(r => r + 1) }
  const stars = Math.max(1, LIVES - mistakes)

  useEffect(() => {
    if (!won) return
    saveProgress(p => ({ level: Math.max(p.level, level + 1) }))
    onReport?.({ text: `🏆 עברתי את שלב ${level} בקוביות מעופפות${mistakes ? '' : ' בלי אף טעות'}! מי מנצח אותי?` })
  }, [won, level, mistakes, saveProgress, onReport])

  return (
    <div className="arc-game fc-game">
      <Hud stats={[['שלב', level], ['נשארו', left], ['', <span key="h" className="fc-hearts" aria-label={`${LIVES - mistakes} לבבות`}>{Array.from({ length: LIVES }, (_, i) => <span key={i} className={i < LIVES - mistakes ? 'on' : ''}>♥</span>)}</span>]]}>
        <ToolButton onClick={hint} label="רמז">💡</ToolButton>
        <ToolButton onClick={() => start(level)} label="שלב מחדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef}>
        <div ref={mountRef} className="fc-mount" role="img" aria-label="קובייה עשויה מקוביות קטנות. גררו כדי לסובב, לחצו על קובייה כדי להעיף אותה" />
        {toast && <div key={toast.k} className="arc-toast">{toast.text}</div>}
        <p className="fc-help" aria-hidden="true">👆 גוררים לסיבוב · לוחצים להעפה</p>
      </div>
      {lost && !won && <EndCard title="💔 נגמרו הלבבות" text="שלוש פעמים לחצתם על קובייה חסומה. מנסים שוב? טיפ: חפשו קוביות שהחץ שלהן מצביע החוצה."
        primary="🔄 לנסות שוב" onPrimary={() => start(level)} />}
      {won && <EndCard title={stars === 3 ? '🎉 מושלם!' : '🎉 כל הכבוד!'} stars={stars}
        text={mistakes ? `פירקתם את כל הקובייה ונשארו לכם ${LIVES - mistakes} ${LIVES - mistakes === 1 ? 'לב' : 'לבבות'}.` : 'פירקתם הכול בלי לאבד אף לב!'}
        primary="▶ לשלב הבא" onPrimary={() => start(level + 1)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🏆 עברתי את שלב ${level} בקוביות מעופפות! מי מנצח אותי?`)} />}
    </div>
  )
}

// Seconds, shared by the render loop and the tap handlers.
function nowSec() { return performance.now() / 1000 }
