// /en/tools/pdf/<action>: one page per PDF job (merge, split, compress…), each opening the shared PDF studio
// on the right tab. The studio reads the job from the route's :action, so it is rendered inside a nested route.
import { Link, Route, Routes } from 'react-router-dom'
import PdfStudio from '../../office/pdf/PdfStudio'
import ToolFrame from './ToolFrame'
import { tPdf } from './pdfStrings'

const PDF_ACTIONS = {
  merge: { emoji: '📄', label: 'Merge PDF', h1: '📄 Merge PDF files into one', intro: 'Combine several PDFs (and photos) into a single file. Drag the pages into order and download.', faq: [
    { q: 'How do I merge PDF files?', a: 'Choose all the files together, or add more later. Every page appears on the screen; drag them into the order you want and press "Download as one PDF".' },
    { q: 'Can I add photos to the PDF?', a: 'Yes. Images and phone photos become pages in the same file, between the PDF pages.' },
  ] },
  split: { emoji: '✂️', label: 'Split PDF', h1: '✂️ Split a PDF', intro: 'Save every page as its own file, or pick page ranges such as 1-3, 5, 8- and download them separately.', faq: [
    { q: 'How do I take a few pages out of a PDF?', a: 'Choose the file, pick "By pages I choose" and type the pages you want, for example 1-3, 7. Each range becomes its own PDF.' },
    { q: 'Can I split every page into a separate file?', a: 'Yes. Choose "Each page as a separate file" and you get a ZIP with one PDF per page.' },
  ] },
  compress: { emoji: '🗜️', label: 'Compress PDF', h1: '🗜️ Compress a PDF', intro: 'Make a heavy PDF smaller for email or messaging. See the size before and after straight away.', faq: [
    { q: 'How much smaller will my PDF get?', a: 'Scans and photo-heavy files usually shrink the most. Choose light, normal or strong compression and you see the new size before you download.' },
    { q: 'Is there a catch?', a: 'In the compressed file each page becomes an image, so the text can no longer be selected or searched.' },
  ] },
  'images-to-pdf': { emoji: '🖼️', label: 'Images to PDF', h1: '🖼️ Convert images to PDF', intro: 'Turn photos, scans and screenshots into one PDF, on A4 pages or at their own size.', faq: [
    { q: 'How do I turn phone photos into a PDF?', a: 'Choose the photos from your gallery. Each one becomes a page; rotate any that are sideways and download.' },
    { q: 'Which image types work?', a: 'JPG, PNG, WebP and most phone photos. iPhone HEIC photos open in Safari; elsewhere, convert them with our HEIC to JPG tool first.' },
  ] },
  'pdf-to-images': { emoji: '🏞️', label: 'PDF to images', h1: '🏞️ Convert PDF to JPG or PNG', intro: 'Save every page of a PDF as an image, ready to send or post.', faq: [
    { q: 'How do I convert a PDF page to a JPG?', a: 'Choose the PDF, pick JPG or PNG and download. Several pages come as a ZIP file.' },
    { q: 'Can I convert only some pages?', a: 'Yes. Tap the pages you want to mark them, and only those are converted.' },
    { q: 'What resolution are the images?', a: 'High enough to read and print comfortably. PNG keeps the sharpest edges; JPG makes smaller files.' },
  ] },
  sign: { emoji: '✍️', label: 'Sign PDF', h1: '✍️ Sign a PDF online', intro: 'Draw your signature with a finger or mouse, or type your name and the date, then place it on the page. No printer needed.', faq: [
    { q: 'How do I sign a PDF without printing it?', a: 'Draw your signature or type your name, drag it to the right place, resize it and pin it. You can pin it on several pages.' },
    { q: 'Is my signature saved anywhere?', a: 'No. It stays in your browser only while the page is open.' },
  ] },
  edit: { emoji: '🔧', label: 'Edit PDF pages', h1: '🔧 Rotate, delete and reorder PDF pages', intro: 'Rotate upside-down pages, delete the ones you do not need and drag pages into a new order.', faq: [
    { q: 'How do I rotate one page in a PDF?', a: 'Press ⟳ under that page. Rotate as many pages as you like, then download.' },
    { q: 'How do I delete pages from a PDF?', a: 'Press 🗑 under each page you want to remove, or mark several pages and delete them together.' },
  ] },
  'to-word': { emoji: '📝', label: 'PDF to Word', h1: '📝 Convert PDF to Word', intro: 'Turn a PDF into an editable Word document, or keep its exact look with each page as an image.', faq: [
    { q: 'Will the Word file be editable?', a: '"Editable text" rebuilds the paragraphs, headings and lists so you can change the content. "Keep the layout" looks exactly like the PDF but cannot be edited.' },
    { q: 'Does it work with Hebrew?', a: 'Yes. Right-to-left text such as Hebrew is kept in the right direction.' },
  ] },
  'from-word': { emoji: '📃', label: 'Word to PDF', h1: '📃 Convert Word to PDF', intro: 'Turn a Word document (docx) into PDF pages that you can rearrange, combine with other files and download.', faq: [
    { q: 'How do I convert Word to PDF?', a: 'Choose the docx file and its pages appear on the screen. Rearrange them, add other files if you like, and download.' },
    { q: 'Can I select the text in the PDF?', a: 'In the downloaded PDF each page is an image. For sharp, selectable text, press Print and choose "Save as PDF" instead.' },
  ] },
}

export default function EnglishPdfAction({ action }) {
  const page = PDF_ACTIONS[action]
  return <ToolFrame path={`/en/tools/pdf/${action}`} h1={page.h1} intro={page.intro} faq={page.faq} bodyTitle="Questions and answers"
    paragraphs={['Your files are not uploaded to any server: all the work happens inside your browser, on your own device. That matters most for payslips, contracts, certificates and medical documents.']}
    related={[{ href: '/en/tools/pdf', label: 'all PDF tools' }, { href: '/en/tools/image', label: 'photo tools' }, { href: '/en/tools', label: 'all free tools' }]}>
    <Routes><Route path="tools/pdf/:action" element={<PdfStudio t={tPdf} embedded />} /></Routes>
    <nav aria-label="More PDF tools" className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
      {Object.entries(PDF_ACTIONS).filter(([k]) => k !== action).map(([k, a]) => <Link key={k} to={`/en/tools/pdf/${k}`} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">{a.emoji} {a.label}</Link>)}
      <Link to="/en/tools/pdf" className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">📄 All PDF tools</Link>
    </nav>
  </ToolFrame>
}
