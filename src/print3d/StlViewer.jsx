import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

// A small turntable preview of a model: either a ready STL file (url) or live geometries
// (the name keychain maker). Drag to turn it, scroll/pinch to zoom.
export default function StlViewer({ url, geometries, colors = ['#f59e0b', '#2563eb'], height = 320, label }) {
  const box = useRef(null)
  const scene = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = box.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      queueMicrotask(() => setFailed(true)) // no WebGL in this browser
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    el.appendChild(renderer.domElement)
    const sc = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 5000)
    camera.up.set(0, 0, 1)
    sc.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.8)
    sun.position.set(1, -1.5, 2)
    sc.add(sun)
    const group = new THREE.Group()
    sc.add(group)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.6
    controls.enablePan = false
    const resize = () => {
      const w = el.clientWidth || 300
      renderer.setSize(w, height)
      camera.aspect = w / height
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    let raf = 0
    const tick = () => { controls.update(); renderer.render(sc, camera); raf = requestAnimationFrame(tick) }
    tick()
    scene.current = { sc, camera, controls, group }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      scene.current = null
    }
  }, [height])

  // show the model(s), framed by the camera
  useEffect(() => {
    const s = scene.current
    if (!s) return undefined
    let cancelled = false
    const show = geoms => {
      if (cancelled) return
      for (const c of [...s.group.children]) { s.group.remove(c); c.material?.dispose() }
      geoms.forEach((g, i) => {
        g.computeVertexNormals?.()
        s.group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.55, metalness: 0.05 })))
      })
      const b = new THREE.Box3().setFromObject(s.group)
      const c = b.getCenter(new THREE.Vector3()), r = b.getSize(new THREE.Vector3()).length() / 2 || 10
      s.controls.target.copy(c)
      s.camera.position.set(c.x + r * 1.3, c.y - r * 2.6, c.z + r * 1.5)
      s.camera.near = r / 50; s.camera.far = r * 50; s.camera.updateProjectionMatrix()
    }
    if (geometries) show(geometries)
    else if (url) new STLLoader().load(url, g => show([g]), undefined, () => !cancelled && setFailed(true))
    return () => { cancelled = true }
  }, [url, geometries, colors])

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-sky-50 to-white">
      <div ref={box} style={{ height }} aria-label={label || 'תצוגה בתלת־ממד'} role="img" className="touch-none" />
      {failed
        ? <p className="absolute inset-0 m-auto h-fit text-center text-sm">התצוגה בתלת־ממד לא נטענה בדפדפן הזה — אבל הקובץ להורדה עובד.</p>
        : <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-slate-500">גוררים כדי לסובב · צובטים או גוללים כדי להגדיל</p>}
    </div>
  )
}
