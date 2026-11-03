// English for the PDF studio (src/office/pdf). The studio keeps its Hebrew strings and calls t(hebrew)
// wherever it shows text; on /en/tools/pdf `t` is tPdf. Exact strings first, then patterns for sentences with numbers.
const DICT = {
  // tabs
  'PDF אחד': 'Merge and edit', 'פיצול': 'Split', 'דחיסה': 'Compress', 'לתמונות': 'To images', 'חתימה וטקסט': 'Sign and text', 'PDF לוורד': 'PDF to Word', 'וורד ל-PDF': 'Word to PDF',
  // errors
  'הקובץ נעול בסיסמה, ובלי הסיסמה אי אפשר לפתוח אותו.': 'The file is password-protected, and it cannot be opened without the password.',
  'הסיסמה לא נכונה.': 'The password is not correct.',
  'הקובץ פגום או שהוא לא באמת PDF. נסו לשמור אותו שוב כ-PDF ולהוסיף מחדש.': 'The file is damaged or is not really a PDF. Try saving it as a PDF again and adding it once more.',
  'לא הצלחנו לפתוח את התמונה. תמונות HEIC מאייפון: שלחו לעצמכם כ-JPG או צלמו מסך, ונסו שוב.': 'We could not open the image. For HEIC photos from an iPhone, send them to yourself as JPG or take a screenshot, then try again.',
  'הקובץ גדול מדי לזיכרון של המכשיר. נסו פחות עמודים בכל פעם, או במחשב.': 'The file is too large for this device’s memory. Try fewer pages at a time, or use a computer.',
  'הכלי לא נטען (אולי האינטרנט התנתק). רעננו את הדף ונסו שוב.': 'The tool did not load (maybe the internet disconnected). Refresh the page and try again.',
  'לא הצלחנו לקרוא את קובץ הוורד. פתחו אותו בוורד, שמרו שוב כ-docx (או ישר כ-PDF) ונסו שוב.': 'We could not read the Word file. Open it in Word, save it again as docx (or straight to PDF) and try again.',
  'משהו השתבש. נסו שוב, ואם זה חוזר, נסו קובץ אחר.': 'Something went wrong. Try again, and if it keeps happening, try another file.',
  // page cards
  'גררו כדי לשנות את הסדר': 'Drag to change the order',
  'יש חתימה או טקסט בעמוד': 'This page has a signature or text',
  'מקום אחד קדימה': 'One place earlier', 'סיבוב': 'Rotate', 'מחיקה': 'Delete', 'מקום אחד אחורה': 'One place later',
  // progress and results
  'פותחים את הקבצים…': 'Opening the files…',
  'להתחיל מחדש? כל העמודים יוסרו מהמסך.': 'Start over? All pages will be removed from the screen.',
  'תמונות': 'Images', 'מסמך מאוחד': 'Merged document',
  'מכינים את ה-PDF…': 'Preparing the PDF…', 'מפצלים…': 'Splitting…', 'דוחסים…': 'Compressing…', 'הופכים לתמונות…': 'Converting to images…', 'מוציאים טקסט…': 'Extracting text…', 'מכינים קובץ Word…': 'Preparing the Word file…',
  'ערוך': 'edited', 'חתום': 'signed', 'דחוס': 'compressed', 'טקסט': 'text',
  'הדפדפן חסם חלון חדש. אשרו חלונות קופצים לאתר ונסו שוב.': 'The browser blocked a new window. Allow pop-ups for this site and try again.',
  '✅ הטקסט הועתק. עכשיו מדביקים בוורד (Ctrl+V).': '✅ The text was copied. Now paste it into Word (Ctrl+V).',
  'סמנו את הטקסט בתיבה והעתיקו (Ctrl+C).': 'Select the text in the box and copy it (Ctrl+C).',
  // page range errors
  'כתבו אילו עמודים, למשל 1-3, 5': 'Write which pages, for example 1-3, 5',
  'מספרי העמודים מתחילים מ-1': 'Page numbers start at 1',
  // studio
  'רק העמוד שסימנתם': 'Only the page you selected', 'לכל העמודים': 'All pages',
  'חינם, בלי הרשמה, והקבצים לא יוצאים מהמחשב: הכל קורה כאן בדפדפן.': 'Free, no sign-up, and your files never leave your computer: everything happens here in the browser.',
  'בחירת קבצים': 'Choose files',
  'או גוררים לכאן קובץ Word (docx). אפשר גם כמה, ולצרף PDF ותמונות.': 'Or drag a Word file (docx) here. You can add several, and combine PDFs and images.',
  'או גוררים לכאן. PDF, תמונות וקובצי Word, כמה שרוצים, גם מגלריית הטלפון.': 'Or drag them here. PDFs, images and Word files, as many as you like, including from your phone gallery.',
  'מה עושים עם הקבצים?': 'What do you want to do with the files?',
  'הפעולה': 'Action',
  'גודל עמוד לתמונות': 'Page size for images', 'תמונות על דף:': 'Images on a page:', 'בגודל התמונה': 'Image size',
  '⬇️ הורדה כ-PDF אחד': '⬇️ Download as one PDF',
  '🖨️ הדפסה או שמירה כ-PDF עם טקסט חד': '🖨️ Print or save as a PDF with sharp text',
  'ב-PDF שיורד מוורד כל עמוד הוא תמונה. רוצים טקסט שאפשר לסמן? לחצו הדפסה ובחרו "שמירה כ-PDF". תיבות טקסט צפות, עמודות ועימוד מורכב עלולים לצאת קצת אחרת מבוורד.': 'In a PDF made from Word, every page is an image. Want text you can select? Press Print and choose "Save as PDF". Floating text boxes, columns and complex layouts may look slightly different from Word.',
  'כל עמוד לקובץ נפרד': 'Each page as a separate file', 'לפי עמודים שאבחר': 'By pages I choose',
  'אילו עמודים בכל קובץ': 'Which pages go in each file',
  'כל פסיק = קובץ נפרד. המספרים הם המספרים שעל העמודים כאן.': 'Each comma = a separate file. The numbers are the page numbers shown here.',
  '✂️ פיצול והורדה': '✂️ Split and download',
  'רמת דחיסה': 'Compression level', 'קלה': 'Light', 'רגילה': 'Normal', 'חזקה': 'Strong',
  'איכות כמעט כמו המקור': 'almost original quality', 'מומלץ: קטן וקריא': 'recommended: small and readable', 'הכי קטן, פחות חד': 'smallest, less sharp',
  '🗜️ דחיסה': '🗜️ Compress', '⬇️ הורדת הקובץ הדחוס': '⬇️ Download the compressed file', '⬇️ הורדה בלי דחיסה': '⬇️ Download without compression',
  'בקובץ הדחוס כל עמוד נשמר כתמונה: נראה אותו דבר, אבל אי אפשר לסמן בו טקסט.': 'In the compressed file every page is saved as an image: it looks the same, but you cannot select text in it.',
  'סוג:': 'Type:', '(קטן, לשליחה)': '(small, good for sending)', '(חד, לטקסט)': '(sharp, good for text)', 'הורדת התמונה': 'Download the image',
  'איזה קובץ Word': 'Which Word file', 'טקסט לעריכה': 'Editable text', '(מומלץ)': '(recommended)', 'שמירת העיצוב': 'Keep the layout', '(כתמונה)': '(as an image)',
  'בונים מחדש פסקאות, כותרות ורשימות, עברית מימין לשמאל. העיצוב המדויק, טבלאות ותמונות לא עוברים.': 'Paragraphs, headings and lists are rebuilt, with Hebrew kept right to left. Exact formatting, tables and images do not carry over.',
  'כל עמוד נכנס לקובץ Word כתמונה: נראה בדיוק כמו המקור, אבל אי אפשר לערוך את הטקסט.': 'Each page goes into the Word file as an image: it looks exactly like the original, but you cannot edit the text.',
  '⬇️ הורדה כקובץ Word': '⬇️ Download as a Word file',
  'לא נמצא טקסט ב-PDF: כנראה הוא סרוק או מצולם, והמילים הן חלק מהתמונה (לזה צריך זיהוי טקסט, OCR). אפשר לשמור את העיצוב.': 'No text was found in this PDF: it is probably scanned or photographed, and the words are part of the picture (that needs text recognition, OCR). You can keep the layout instead.',
  '⬇️ Word עם העמודים כתמונה': '⬇️ Word with the pages as images',
  'או רק להעתיק את הטקסט': 'Or just copy the text', 'הטקסט מה-PDF': 'Text from the PDF', '📋 העתקה': '📋 Copy', '⬇️ קובץ טקסט': '⬇️ Text file',
  'לא נמצא טקסט. כנראה זה מסמך סרוק או צילום, ובו המילים הן חלק מהתמונה. לזה צריך תוכנת זיהוי טקסט (OCR).': 'No text was found. It is probably a scanned document or a photo, where the words are part of the picture. That needs text recognition software (OCR).',
  'בתמונות אין טקסט לעריכה. הוסיפו קובץ PDF, או בחרו "שמירת העיצוב".': 'Images have no text to edit. Add a PDF file, or choose "Keep the layout".',
  'קובץ Word (docx) שמוסיפים הופך לעמודי PDF כאן על המסך. משם מורידים, מצרפים ל-PDF אחר או חותמים.': 'A Word file (docx) that you add becomes PDF pages here on screen. From there you can download it, combine it with another PDF or sign it.',
  '📃 בחירת קובץ Word': '📃 Choose a Word file',
  '＋ עוד קבצים': '＋ More files', 'ביטול סימון': 'Clear selection', 'סימון הכל': 'Select all', '✍️ לחתום על העמוד הזה': '✍️ Sign this page', '🧹 מההתחלה': '🧹 Start over',
  'שחררו כאן ⬇️': 'Drop here ⬇️',
  // signing
  '1. מה מוסיפים?': '1. What do you want to add?', '✍️ ציור חתימה': '✍️ Draw a signature', '🔤 הקלדת טקסט': '🔤 Type text', 'צבע:': 'Color:',
  'שחור': 'Black', 'כחול': 'Blue', 'אדום': 'Red',
  'משטח חתימה: ציירו כאן באצבע או בעכבר': 'Signature pad: draw here with your finger or mouse',
  '🧽 ניקוי': '🧽 Clear', 'המשך: מיקום על הדף ←': 'Next: place it on the page →',
  'שם מלא, ת״ז, הערה…': 'Full name, note…',
  'כתב יד': 'Handwriting', 'רגיל': 'Regular', 'מודגש': 'Bold', '📅 תאריך היום': '📅 Today’s date',
  '2. גוררים למקום הנכון ומצמידים': '2. Drag it into place and pin it',
  'עמוד:': 'Page:', 'גודל:': 'Size:', 'גודל החתימה': 'Signature size', 'טוען את העמוד…': 'Loading the page…', 'החתימה': 'The signature',
  '↩ חתימה אחרת': '↩ A different signature',
  '✅ הוצמד. אפשר להצמיד שוב (בעמוד אחר או במקום אחר), או להוריד.': '✅ Pinned. You can pin again (on another page or in another place), or download.',
  '⬇️ הורדת ה-PDF החתום': '⬇️ Download the signed PDF',
}

const WORD_OK = /^✅ "(.*)" הפך ל-(?:עמוד אחד|(\d+) עמודים)\. בדקו שהכל נראה טוב ולחצו "הורדה כ-PDF אחד"\.$/

const RULES = [
  [/^גרירת עמוד (\d+) למקום אחר$/, 'Drag page $1 to another place'],
  [/^סימון עמוד (\d+)$/, 'Select page $1'],
  [/^עמוד (\d+)(, מסומן)?$/, (m, n, s) => `Page ${n}${s ? ', selected' : ''}`],
  [/^העברת עמוד (\d+) לפני הקודם$/, 'Move page $1 before the previous one'],
  [/^סיבוב עמוד (\d+)$/, 'Rotate page $1'],
  [/^מחיקת עמוד (\d+)$/, 'Delete page $1'],
  [/^העברת עמוד (\d+) אחרי הבא$/, 'Move page $1 after the next one'],
  [/^פותחים את "(.*)"…$/, 'Opening "$1"…'],
  [/^ממירים את "(.*)" ל-PDF…$/, 'Converting "$1" to PDF…'],
  [WORD_OK, (m, name, pages) => `✅ "${name}" became ${pages ? `${pages} pages` : 'one page'}. Check that everything looks right and press "Download as one PDF".`],
  [/^(הסיסמה לא נכונה\. )?הקובץ "(.*)" נעול\. מה הסיסמה\?$/, (m, bad, name) => `${bad ? 'The password was not correct. ' : ''}The file "${name}" is locked. What is the password?`],
  [/^"(.*)" הוא קובץ וורד ישן\. פתחו אותו בוורד ושמרו כ-docx \(קובץ ← שמירה בשם\), ואז הוסיפו כאן\.$/, '"$1" is an old Word file. Open it in Word, save it as docx (File > Save As), then add it here.'],
  [/^"(.*)" הוא לא PDF, תמונה או Word, אז דילגנו עליו\.$/, '"$1" is not a PDF, an image or a Word file, so we skipped it.'],
  [/^עמודים (.*)$/, 'Pages $1'],
  [/^(\d+) חלקים$/, '$1 parts'],
  [/^✅ ירד: (.*) \((.*)\)\. פותחים בוורד, ב-Google Docs או ב-LibreOffice\.$/, '✅ Downloaded: $1 ($2). Open it in Word, Google Docs or LibreOffice.'],
  [/^✅ ירד: (.*)$/, '✅ Downloaded: $1'],
  [/^✅ ירד קובץ ZIP עם (\d+) קבצי PDF \((.*)\)\. פותחים אותו בלחיצה כפולה\.$/, '✅ Downloaded a ZIP file with $1 PDF files ($2). Double-click to open it.'],
  [/^✅ ירדה תמונה: (.*)$/, '✅ Downloaded an image: $1'],
  [/^✅ ירד קובץ ZIP עם (\d+) תמונות \((.*)\)\.$/, '✅ Downloaded a ZIP file with $1 images ($2).'],
  [/^רק (\d+) העמודים שסימנתם$/, 'Only the $1 pages you selected'],
  [/^כל (\d+) העמודים, לפי הסדר שעל המסך\. רוצים רק חלק\? סמנו אותם\.$/, 'All $1 pages, in the order shown on screen. Want only some? Select them.'],
  [/^ (\d+) מתוך (\d+)$/, ' $1 of $2'],
  [/^לא הבנו את "(.*)"\. כותבים מספרים, למשל 1-3, 5$/, 'We did not understand "$1". Write numbers, for example 1-3, 5'],
  [/^יש רק (\d+) עמודים בקובץ$/, 'The file has only $1 pages'],
  [/^יווצרו (\d+) קבצים(, בתוך קובץ ZIP אחד)?:$/, (m, n, zip) => `${n} file${n === '1' ? '' : 's'} will be created${zip ? ', inside one ZIP file' : ''}:`],
  [/^קטן ב-(\d+)%$/, 'Smaller by $1%'],
  [/^הקובץ כבר קטן \((.*)\), ודחיסה (.*) לא מקטינה אותו\.( נסו דחיסה חזקה\.)?$/, (m, size, level, tip) => `The file is already small (${size}), and ${tPdf(level).toLowerCase()} compression does not shrink it.${tip ? ' Try strong compression.' : ''}`],
  [/^הורדת (\d+) תמונות \(ZIP\)$/, 'Download $1 images (ZIP)'],
  [/^⟳ סיבוב \((\d+)\)$/, '⟳ Rotate ($1)'],
  [/^🗑 מחיקה \((\d+)\)$/, '🗑 Delete ($1)'],
  [/^(\d+) עמודים · גוררים ב-⠿ כדי לשנות סדר · לוחצים על עמוד כדי לסמן אותו$/, '$1 pages · drag ⠿ to change the order · click a page to select it'],
  [/^📌 הצמדה לעמוד (\d+)$/, '📌 Pin to page $1'],
  [/^🗑 ניקוי עמוד (\d+)$/, '🗑 Clear page $1'],
]

export function tPdf(he) {
  if (typeof he !== 'string') return he
  const s = he.replace(/[‎‏]/g, '')
  const hit = DICT[s]
  if (hit !== undefined) return hit
  for (const [re, to] of RULES) if (re.test(s)) return s.replace(re, to)
  return he
}
