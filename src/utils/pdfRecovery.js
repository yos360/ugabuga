// A PDF made in the browser lives only behind a temporary blob: link, so a tab that reopens later lands on
// ugabuga.co.il/<uuid> with nothing to show. Keep the last few files in IndexedDB, under that uuid, so the
// 404 page can hand the same file back. Best effort: private windows may refuse, and nothing depends on it.
const DB = 'buga-pdf'
const STORE = 'files'
const KEEP = 5
const MAX_AGE = 7 * 864e5

export const pdfId = link => String(link || '').split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop().toLowerCase()

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const result = req => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})

export async function savePdf(url, blob, name) {
  try {
    const db = await openDb()
    const store = db.transaction(STORE, 'readwrite').objectStore(STORE)
    await result(store.put({ id: pdfId(url), blob, name, at: Date.now() }))
    const all = await result(db.transaction(STORE).objectStore(STORE).getAll())
    const old = all.sort((a, b) => b.at - a.at).slice(KEEP)
    if (old.length) { const tx = db.transaction(STORE, 'readwrite'); old.forEach(f => tx.objectStore(STORE).delete(f.id)) }
    db.close()
  } catch { /* the file was still handed over the normal way */ }
}

export async function loadPdf(id) {
  try {
    const db = await openDb()
    const file = await result(db.transaction(STORE).objectStore(STORE).get(id))
    db.close()
    return file && Date.now() - file.at < MAX_AGE ? file : null
  } catch { return null }
}
