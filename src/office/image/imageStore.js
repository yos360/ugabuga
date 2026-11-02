// The photos the visitor added — kept outside React so they survive switching tools (route changes).
import { useSyncExternalStore } from 'react'
import { isHeic } from './imageLogic'
import { readPhoto, heicToJpeg } from './imageIO'

export const MAX_PHOTOS = 40
let state = { items: [], selected: null, busy: 0, note: '' }
const subs = new Set()
const set = patch => { state = { ...state, ...patch }; subs.forEach(f => f()) }
const subscribe = f => { subs.add(f); return () => subs.delete(f) }
const snap = () => state
const SERVER = { items: [], selected: null, busy: 0, note: '' }
export const useImages = () => useSyncExternalStore(subscribe, snap, () => SERVER)

let seq = 0
let queue = Promise.resolve()

// item: { id, name, size (original bytes), type, blob (decodable: the file, or JPG made from HEIC), width, height, thumb, heic }
export function addFiles(fileList) {
  const files = Array.from(fileList || []).filter(f => f && (/^image\//.test(f.type) || isHeic(f) || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || '')))
  const skipped = Array.from(fileList || []).length - files.length
  const room = MAX_PHOTOS - state.items.length
  const take = files.slice(0, Math.max(0, room))
  const notes = []
  if (skipped) notes.push(skipped === 1 ? 'קובץ אחד אינו תמונה ודולג' : `${skipped} קבצים אינם תמונות ודולגו`)
  if (files.length > take.length) notes.push(`אפשר עד ${MAX_PHOTOS} תמונות בבת אחת`)
  set({ busy: state.busy + take.length, note: notes.join(' · ') })
  for (const file of take) {
    queue = queue.then(() => addOne(file)).catch(() => {})
  }
  return queue
}

async function addOne(file) {
  let blob = file, heic = false, failed = false
  try {
    if (isHeic(file)) {
      heic = true
      const jpg = await heicToJpeg(file)
      if (jpg) blob = jpg
    }
    const { width, height, thumb } = await readPhoto(blob)
    const item = { id: ++seq, name: file.name || 'תמונה', size: file.size, type: blob.type || file.type, blob, width, height, thumb, heic }
    set({ items: [...state.items, item], selected: state.selected ?? item.id })
  } catch {
    failed = true
  }
  set({ busy: Math.max(0, state.busy - 1), ...(failed ? { note: `לא הצלחנו לפתוח את ${file.name || 'הקובץ'}` } : {}) })
}

const dropThumb = it => { try { URL.revokeObjectURL(it.thumb) } catch { /* not a blob url */ } }

export function removeItem(id) {
  state.items.filter(i => i.id === id).forEach(dropThumb)
  const items = state.items.filter(i => i.id !== id)
  set({ items, selected: state.selected === id ? (items[0]?.id ?? null) : state.selected })
}
export function clearAll() { state.items.forEach(dropThumb); set({ items: [], selected: null, note: '' }) }
export function select(id) { set({ selected: id }) }
export function moveItem(id, dir) {
  const items = [...state.items]
  const i = items.findIndex(x => x.id === id), j = i + dir
  if (i < 0 || j < 0 || j >= items.length) return
  ;[items[i], items[j]] = [items[j], items[i]]
  set({ items })
}
export function reorder(ids) {
  const byId = new Map(state.items.map(i => [i.id, i]))
  set({ items: ids.map(id => byId.get(id)).filter(Boolean) })
}
export function clearNote() { set({ note: '' }) }
