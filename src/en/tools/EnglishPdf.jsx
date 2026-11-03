// /en/tools/pdf: the PDF studio of the Hebrew site (merge, split, compress, images, sign, Word) with an English
// interface. The studio itself is shared (embedded mode, English strings from pdfStrings.js); this page adds the
// English heading, explanations and FAQ.
import PdfStudio from '../../office/pdf/PdfStudio'
import ToolFrame from './ToolFrame'
import { tPdf } from './pdfStrings'

const PATH = '/en/tools/pdf'
const FAQ = [
  { q: 'Are my files uploaded to the site?', a: 'No. Everything happens inside your browser, on a computer and on a phone. Your files are not sent to any server, and nothing is left after you close the page. You can even disconnect from the internet once the page has loaded.' },
  { q: 'How do I merge several PDF files into one?', a: 'Choose all the files together (or add more later), arrange the pages by dragging, and press "Download as one PDF". You can mix images and phone photos into the same file.' },
  { q: 'How do I turn a photo or an image into a PDF?', a: 'Choose images from your computer or phone gallery and they become pages. Choose whether each image goes on an A4 page or keeps its own size, then download. Rotate photos that came out sideways with the ⟳ button.' },
  { q: 'How do I make a PDF smaller to send by email or WhatsApp?', a: 'In the "Compress" tab choose a level and press the button. You see the size before and after right away. Strong compression suits scans and heavy photos. Note that in the compressed file the text becomes an image, so it cannot be selected.' },
  { q: 'How do I sign a PDF without printing it?', a: 'In the "Sign and text" tab draw a signature with your finger or mouse (or type a name and a date), drag it into place and pin it. You can pin it several times, on several pages.' },
  { q: 'How do I convert a PDF to Word?', a: 'The "PDF to Word" tab has two ways. "Editable text" rebuilds paragraphs, headings and lists, including Hebrew written right to left, and suits cases where you want to change the content. "Keep the layout" puts every page into the Word file as an image: it looks exactly like the original, but cannot be edited. Tables and complex layouts do not always carry over one to one.' },
  { q: 'How do I convert Word to PDF?', a: 'Choose a Word file (docx) and it becomes PDF pages here on screen. You can rearrange them, combine them with other files and download. In the PDF that downloads every page is an image; for sharp text you can select, press "Print" and choose "Save as PDF". Floating text boxes and complex layouts may come out slightly different from Word. Old doc files need to be saved as docx first.' },
  { q: 'My file is locked with a password. What do I do?', a: 'Type the password when the page asks for it. The file that comes out is saved without a password, and its pages are saved as images. Without the password it cannot be opened, and that is on purpose.' },
]

export default function EnglishPdf() {
  return <ToolFrame path={PATH} h1="Free PDF tools: merge, split, compress, sign and convert"
    intro="Merge files, split a PDF, shrink it, turn images into a PDF, sign a form and convert to and from Word. Everything happens in your browser, so your files never leave your device."
    bodyTitle="One PDF tool for everyday jobs" faq={FAQ}
    paragraphs={[
      'One PDF tool that does what you need day to day: combine several files into one, turn phone photos into a PDF, split a long file, shrink a heavy file to send by email, sign a form without a printer, rotate a page that is upside down and delete pages you do not need. No sign-up, no watermark and no limit on the number of files.',
      'Unlike most sites, your files are not uploaded to any server here: all the work is done inside the browser on your own device. That matters most for payslips, contracts, certificates and medical documents.',
    ]}
    related={[{ href: '/en/tools/qr-code', label: 'the QR code maker' }, { href: '/en/tools', label: 'all free tools' }]}>
    <PdfStudio t={tPdf} embedded />
  </ToolFrame>
}
