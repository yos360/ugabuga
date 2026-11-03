import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import PrintPreview from '../../components/ui/PrintPreview'
import { contrastOnWhite, qrPayload } from '../../utils/qrPayload'
import ToolFrame from './ToolFrame'

const PATH = '/en/tools/qr-code'
const FAQ = [
  { q: 'Is the QR code maker free?', a: 'Yes. You can create, download and print codes without signing up. The code itself never expires, but any link inside it needs to stay online.' },
  { q: 'Is my content sent to a server?', a: 'No. The text, phone number and Wi-Fi password stay in your browser and are not sent to a server or to usage analytics. Anyone who scans the code can read what is inside, so share a Wi-Fi code only with people who should have access.' },
  { q: 'Why will my code not scan?', a: 'Try a darker color and a bigger print, keep the white margin around the code, and test it with your phone camera. A code that holds a lot of text needs to be printed larger.' },
  { q: 'How do I make a WhatsApp QR code?', a: 'Choose WhatsApp and enter the number with the country code and without a leading zero, for example 14155550123. You can add a ready-made message. Scanning the code does not send it automatically.' },
]
const TYPES = [['link', 'Link'], ['text', 'Text'], ['whatsapp', 'WhatsApp'], ['wifi', 'Wi-Fi'], ['phone', 'Phone'], ['email', 'Email']]
const inputClass = 'mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white text-[#182139] px-3 py-2 min-h-[44px]'
const buttonClass = 'min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-2 font-bold disabled:opacity-40'

// The shared builder (utils/qrPayload) reports its problems in Hebrew; check the input here first so the
// visitor reads English, then let the shared builder produce the actual payload.
function problem(type, f) {
  const has = v => String(v ?? '').trim() !== ''
  if (type === 'link') {
    if (!has(f.link)) return 'Enter a link.'
    return null
  }
  if (type === 'text') return has(f.text) ? null : 'Enter some text.'
  if (type === 'whatsapp' || type === 'phone') {
    if (!has(f.phone)) return 'Enter a phone number.'
    const s = String(f.phone).replace(/[\s().-]/g, '')
    if (type === 'whatsapp' && !/^\+?[1-9]\d{6,14}$/.test(s)) return 'Enter the number with the country code and no leading zero, for example 14155550123.'
    if (type === 'phone' && !/^\+?\d{3,15}$/.test(s)) return 'Enter a valid phone number.'
    return null
  }
  if (type === 'wifi') {
    if (!has(f.ssid)) return 'Enter the network name.'
    if (f.encryption !== 'nopass' && !f.password) return 'Enter the network password.'
    return null
  }
  if (type === 'email') {
    if (!has(f.email)) return 'Enter an email address.'
    if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(String(f.email).trim())) return 'Enter a valid email address.'
    return null
  }
  return 'Choose a code type.'
}

export default function EnglishQr() {
  const [type, setType] = useState('link')
  const [fields, setFields] = useState({ link: 'https://ugabuga.co.il', text: '', phone: '', message: '', ssid: '', password: '', encryption: 'WPA', email: '', subject: '' })
  const [size, setSize] = useState(512), [color, setColor] = useState('#182139')
  const [generated, setGenerated] = useState(null), [generationError, setGenerationError] = useState(null)
  const [labels, setLabels] = useState(1), [caption, setCaption] = useState(''), [printing, setPrinting] = useState(false)
  let payload = '', validationError = problem(type, fields) || ''
  if (!validationError) {
    try { payload = qrPayload(type, fields) } catch { validationError = type === 'link' ? 'Enter a valid http or https link.' : 'Check the details and try again.' }
  }
  const key = JSON.stringify([payload, size, color])
  const ready = generated?.key === key && !validationError
  useEffect(() => {
    let cancelled = false
    if (!payload) return undefined
    const timeout = setTimeout(async () => {
      try {
        const options = { width: size, margin: 4, errorCorrectionLevel: 'M', color: { dark: color, light: '#ffffff' } }
        const [png, svg] = await Promise.all([QRCode.toDataURL(payload, options), QRCode.toString(payload, { ...options, type: 'svg' })])
        if (!cancelled) setGenerated({ key, png, svg })
      } catch { if (!cancelled) { setGenerated(null); setGenerationError({ key, message: 'That is too much content for a QR code. Shorten the text and try again.' }) } }
    }, 150)
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [payload, size, color, key])
  function field(name, label, { multiline = false, ...props } = {}) {
    const common = { value: fields[name], onChange: e => setFields(old => ({ ...old, [name]: e.target.value })), className: inputClass, maxLength: 3000, ...props }
    return <label className="block font-bold">{label}{multiline ? <textarea {...common} rows={3} /> : <input {...common} />}</label>
  }
  function download(format) {
    if (!ready) return
    const url = format === 'svg' ? URL.createObjectURL(new Blob([generated.svg], { type: 'image/svg+xml' })) : generated.png
    const a = document.createElement('a'); a.href = url; a.download = `qr-code.${format}`; a.click()
    if (format === 'svg') setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <ToolFrame path={PATH} width="max-w-4xl" h1="Free QR code maker for links, text and WhatsApp"
    intro="🔒 The code is made in your browser. Nothing you type is sent to a server or to usage analytics."
    bodyTitle="Ideas for teachers and parents" faq={FAQ}
    paragraphs={[
      'A QR code maker turns a link or a piece of text into a code that a phone camera can scan. Add a code to a worksheet that leads to an answers page, so students can check their own work when they finish.',
      'On a party invitation you can print a QR code with a link to the location, and on the classroom door a link to a Google Forms sign-up. Choose a caption that says where the code leads, such as "Sign up for the activity here", and check ahead of time that the link is open to the right audience.',
      'A PNG download suits slides and documents, while SVG stays sharp at any size. You can print one big code for a sign, or a page of 6 or 12 labels. Keep the white frame around the code so it scans easily.',
    ]}
    related={[{ href: '/en/tools', label: 'all free tools' }, { href: '/en/tools/pdf', label: 'the PDF studio' }]}>
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      <section className="space-y-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-label="Code content">
        <label className="block font-bold">Code type<select aria-label="Code type" value={type} onChange={e => setType(e.target.value)} className={inputClass}>{TYPES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
        {type === 'link' && field('link', 'Link address', { dir: 'ltr', inputMode: 'url' })}
        {type === 'text' && field('text', 'Your text', { multiline: true })}
        {['whatsapp', 'phone'].includes(type) && field('phone', type === 'whatsapp' ? 'Phone number with country code (for example 14155550123)' : 'Phone number', { type: 'tel', dir: 'ltr' })}
        {['whatsapp', 'email'].includes(type) && field('message', 'Message (optional)', { multiline: true })}
        {type === 'wifi' && <>{field('ssid', 'Network name (SSID)', { autoComplete: 'off' })}<label className="block font-bold">Security<select aria-label="Security" value={fields.encryption} onChange={e => setFields(old => ({ ...old, encryption: e.target.value }))} className={inputClass}><option value="WPA">WPA / WPA2 / WPA3 (compatible mode)</option><option value="WEP">WEP</option><option value="nopass">Open network, no password</option></select></label>{fields.encryption !== 'nopass' && field('password', 'Network password', { type: 'password', autoComplete: 'new-password' })}<p className="text-sm">The code contains the access details. Share it only with approved guests, and test a scan on the device you will use.</p></>}
        {type === 'email' && <>{field('email', 'Email address', { type: 'email', dir: 'ltr' })}{field('subject', 'Subject (optional)')}</>}
        <div className="grid grid-cols-2 gap-3"><label className="font-bold">PNG size<select aria-label="PNG size" value={size} onChange={e => setSize(Number(e.target.value))} className={inputClass}>{[256, 512, 1024].map(n => <option key={n} value={n}>{n} pixels</option>)}</select></label><label className="font-bold">Code color<input type="color" value={color} onChange={e => setColor(e.target.value)} className={inputClass} /></label></div>
        {contrastOnWhite(color) < 4.5 && <p role="alert" className="rounded-xl bg-amber-100 text-amber-950 p-3">That color is too light and may be hard to scan. Choose a darker one.</p>}
      </section>
      <section className="flex flex-col items-center gap-4 min-w-0" aria-label="Preview and download">
        <div className="w-full max-w-[320px] aspect-square rounded-2xl border-2 border-[var(--border)] bg-white flex items-center justify-center p-2">
          {ready ? <img src={generated.png} alt="Preview of the QR code" className="w-full h-full object-contain" /> : <p role="status" className="p-4 text-center text-[#182139]">{validationError || (generationError?.key === key && generationError.message) || 'Making your code…'}</p>}
        </div>
        <p className="text-sm text-center">Scan it with your camera and check that it works before you print.</p>
        <div className="flex flex-wrap gap-2 justify-center"><button className={buttonClass} disabled={!ready} onClick={() => download('png')}>Download PNG</button><button className={buttonClass} disabled={!ready} onClick={() => download('svg')}>Download SVG</button></div>
        <label className="w-full font-bold">Print layout<select aria-label="Print layout" value={labels} onChange={e => setLabels(Number(e.target.value))} className={inputClass}><option value={1}>One big code</option><option value={6}>6 labels per page</option><option value={12}>12 labels per page</option></select></label>
        <label className="w-full font-bold">Label caption (optional)<input className={inputClass} value={caption} maxLength={80} onChange={e => setCaption(e.target.value)} /></label>
        <button className={`${buttonClass} w-full`} disabled={!ready} onClick={() => setPrinting(true)}>Preview before printing</button>
      </section>
    </div>
    {printing && ready && <PrintPreview lang="en" title="QR code to print" onClose={() => setPrinting(false)} copies={false}><article className="buga-a4" dir="ltr"><div style={{ display: 'grid', gridTemplateColumns: `repeat(${labels === 1 ? 1 : labels === 6 ? 2 : 3}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${labels === 1 ? 1 : labels === 6 ? 3 : 4}, minmax(0, 1fr))`, gap: '3mm', width: '100%', flex: 1, minHeight: 0 }}>{Array.from({ length: labels }, (_, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: '2mm', border: labels > 1 ? '1px dashed #ccc' : undefined }}><div style={{ flex: 1, minHeight: 0, width: '100%' }}><img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(generated.svg)}`} alt="QR code" /></div>{caption && <p style={{ fontSize: labels === 1 ? '20px' : '12px', lineHeight: 1.3, textAlign: 'center', overflowWrap: 'anywhere', marginTop: '2mm' }}>{caption}</p>}</div>)}</div></article></PrintPreview>}
  </ToolFrame>
}
