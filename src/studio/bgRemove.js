// Background removal for photos of people, in the browser: Google's MediaPipe Selfie Segmenter
// (Apache-2.0, ~250 KB model). The runtime and the model are downloaded once; the photo itself never
// leaves the device. Returns a PNG blob with a transparent background.
import { decodeImage, newCanvas, canvasToBlob, freeImage } from '../office/image/imageIO'

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm'
const MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite'
let segp = null
async function segmenter() {
  if (!segp) segp = (async () => {
    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision')
    const files = await FilesetResolver.forVisionTasks(WASM)
    return ImageSegmenter.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL }, runningMode: 'IMAGE', outputConfidenceMasks: true, outputCategoryMask: false })
  })()
  try { return await segp } catch (e) { segp = null; throw e }
}

export async function removeBackground(blob) {
  const seg = await segmenter()
  const img = await decodeImage(blob, 2400)
  const W = img.width, H = img.height
  const src = newCanvas(W, H)
  src.getContext('2d').drawImage(img, 0, 0)
  const res = seg.segment(src)
  const conf = res.confidenceMasks[0]
  const mw = conf.width, mh = conf.height, m = conf.getAsFloat32Array()
  // the mask is small (256²): paint it, then scale it up smoothly to the photo size as an alpha channel
  const mc = newCanvas(mw, mh), mctx = mc.getContext('2d')
  const md = mctx.createImageData(mw, mh)
  for (let i = 0; i < mw * mh; i++) {
    const a = Math.max(0, Math.min(1, (m[i] - 0.35) / 0.3)) // soft threshold → clean but feathered edge
    md.data[i * 4 + 3] = Math.round(a * 255)
  }
  mctx.putImageData(md, 0, 0)
  res.close?.()
  const out = newCanvas(W, H), ctx = out.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(mc, 0, 0, W, H)
  ctx.globalCompositeOperation = 'source-in'
  ctx.drawImage(src, 0, 0)
  const png = await canvasToBlob(out, 'image/png')
  freeImage(src); freeImage(out); freeImage(mc); freeImage(img)
  return png
}
