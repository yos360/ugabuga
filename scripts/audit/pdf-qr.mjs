// Requires Poppler pdftoppm in PATH and: npm install --prefix out/audit/deps --no-save --package-lock=false jsqr pdf-lib pngjs
// Run after pdf.mjs: node scripts/audit/pdf-qr.mjs
// Independently rasterizes each first page and checks that its printed return QR is readable.
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {readFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
const require=createRequire(import.meta.url),jsQR=require(resolve('out/audit/deps/node_modules/jsqr')),{PNG}=require(resolve('out/audit/deps/node_modules/pngjs'))
const rows=JSON.parse(readFileSync('out/audit/pdf.json','utf8')),results=[]
for(const row of rows){if(!row.pass)continue;const prefix=row.file.replace(/\.pdf$/,'-qr');execFileSync('pdftoppm',['-f','1','-singlefile','-scale-to','1200','-png',row.file,prefix]);const png=PNG.sync.read(readFileSync(prefix+'.png'));const qr=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);results.push({path:row.path,decoded:qr?.data||null})}
writeFileSync('out/audit/pdf-qr.json',JSON.stringify(results,null,2));console.log(results.filter(r=>!r.decoded))
