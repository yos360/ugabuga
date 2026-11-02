// /tools/document: templates, HTML sanitiser, text and Word (.doc) export
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/office/docs/docLogic.js')
const { TEMPLATES, templateBySlug, PAGE_W, PAGE_H } = await import('../src/office/docs/docTemplates.js')

test('at least 20 templates with unique, url-safe slugs and full SEO fields', () => {
  assert.ok(TEMPLATES.length >= 20, `only ${TEMPLATES.length} templates`)
  const slugs = TEMPLATES.map(t => t.slug)
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug')
  const titles = TEMPLATES.map(t => t.seoTitle)
  assert.equal(new Set(titles).size, titles.length, 'duplicate SEO title')
  for (const t of TEMPLATES) {
    assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, t.slug)
    assert.equal(L.slugify(t.slug), t.slug)
    for (const k of ['name', 'emoji', 'seoTitle', 'seoDesc', 'about', 'html', 'cat']) assert.ok(t[k], `${t.slug}: missing ${k}`)
    assert.ok(t.seoTitle.length <= 60, `${t.slug}: title too long (${t.seoTitle.length})`)
    assert.ok(t.seoDesc.length <= 165, `${t.slug}: description too long (${t.seoDesc.length})`)
    assert.equal(templateBySlug(t.slug), t)
  }
  assert.equal(templateBySlug('nope'), null)
})

test('every template is already clean: the sanitiser returns it unchanged', () => {
  for (const t of TEMPLATES) {
    assert.equal(L.sanitizeHtml(t.html), t.html, t.slug)
    for (const it of t.items || []) {
      if (it.type === 'text') assert.equal(L.sanitizeHtml(it.html), it.html, t.slug)
      assert.ok(it.x >= 0 && it.y >= 0, `${t.slug}: item off page`)
      if (it.type === 'line') assert.ok((it.o === 'v' ? it.y : it.x) + it.len <= (it.o === 'v' ? PAGE_H : PAGE_W), `${t.slug}: line too long`)
    }
  }
})

test('templates hold no h1: the page heading must stay the only h1 (prerender rejects two)', () => {
  for (const t of TEMPLATES) {
    assert.doesNotMatch(t.html, /<h1[\s>]/i, t.slug)
    for (const it of t.items || []) if (it.html) assert.doesNotMatch(it.html, /<h1[\s>]/i, t.slug)
  }
})

test('no legal or tax documents among the templates', () => {
  for (const t of TEMPLATES) assert.doesNotMatch(t.name + t.html, /חשבונית מס|ייפוי כוח|הסכם שכירות|חוזה/, t.slug)
})

test('sanitiser strips scripts, styles, handlers and bad URLs', () => {
  const dirty = '<p onclick="alert(1)" style="color:red;position:fixed;background:url(x.png)">hi</p><script>alert(1)</script><style>p{}</style>' +
    '<img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)" target="_blank">x</a><iframe src="https://x"></iframe>' +
    '<img/src=x/onerror=alert(1)><!-- note --><o:p></o:p><font color="red">f</font><span class="MsoNormal dc-line">s</span>'
  const out = L.sanitizeHtml(dirty)
  // the slash-separated <img/src=x/onerror=…> is not a tag the browser would build from escaped text
  assert.match(out, /&lt;img\/src=x\/onerror=alert\(1\)>/)
  const tagsOnly = out.replace(/&lt;img\/src=x\/onerror=alert\(1\)>/, '')
  assert.doesNotMatch(tagsOnly, /script|onerror|onclick|javascript|iframe|position|url\(|<style|<o:p|<font|MsoNormal|note|target/i)
  assert.match(out, /<p style="color:red">hi<\/p>/)
  assert.match(out, /<a>x<\/a>/)
  assert.match(out, /<span class="dc-line">s<\/span>/)
  assert.match(out, /&lt;img\/src=x/)
  assert.equal(L.sanitizeHtml(out), out, 'idempotent')
})

test('sanitiser keeps the formatting the editor produces', () => {
  const ok = '<h2 dir="ltr">Title</h2><p style="text-align:center"><b>b</b> <i>i</i> <u>u</u> <span style="font-size:18pt;color:rgb(200, 0, 0);background-color:rgb(255, 240, 0)">x</span></p>' +
    '<ul><li>a</li></ul><ol><li>b</li></ol><table><tbody><tr><td colspan="2">c</td></tr></tbody></table><img src="data:image/png;base64,iVBORw0KGgo=" style="width:50%"><br><hr>'
  assert.equal(L.sanitizeHtml(ok), ok)
  assert.equal(L.sanitizeHtml('a < b & c'), 'a &lt; b & c')
  assert.equal(L.sanitizeHtml("<p style='color:red'>x</p>"), '<p style="color:red">x</p>')
})

test('plain text: blocks, lists, tables and entities', () => {
  const t = L.htmlToText('<h1>כותרת</h1><p>שורה&nbsp;אחת<br>שתיים</p><ul><li>א</li><li>ב</li></ul><table><tbody><tr><td>1</td><td>2</td></tr></tbody></table><p>&lt;תג&gt; &amp;</p>')
  assert.equal(t, 'כותרת\n\nשורה אחת\nשתיים\n\n• א\n• ב\n\n1\t2\n\n<תג> &')
  const doc = { pages: [{ html: '<p>עמוד 1</p>', items: [{ type: 'text', html: '<p>תיבה</p>', x: 0, y: 0 }, { type: 'line', o: 'h', x: 0, y: 0, len: 10 }] }, { html: '<p>עמוד 2</p>', items: [] }] }
  assert.equal(L.docToText(doc), 'עמוד 1\n\nתיבה\n\nעמוד 2')
  assert.equal(L.textToHtml('a<b\nc\n\nd'), '<p>a&lt;b<br>c</p><p>d</p>')
})

test('.doc export is a right-to-left Word HTML file', () => {
  const doc = { title: 'מכתב <בדיקה>', pages: [{ html: TEMPLATES[0].html + '<script>x</script>', items: [{ type: 'text', html: '<p>תיבה</p>', frame: true, x: 10, y: 500 }, { type: 'line', o: 'h', x: 0, y: 20, len: 100, t: 3, color: '#ff0000', dash: 'dashed' }] }, { html: '<p>שני</p>', items: [] }] }
  const s = L.buildDocFile(doc)
  assert.equal(L.DOC_MIME, 'application/msword')
  assert.ok(s.startsWith('﻿<html'))
  assert.match(s, /urn:schemas-microsoft-com:office:word/)
  assert.match(s, /<body dir="rtl"/)
  assert.match(s, /dir="rtl"/)
  assert.match(s, /<meta charset="utf-8">/)
  assert.match(s, /<title>מכתב &lt;בדיקה&gt;<\/title>/)
  assert.match(s, /page-break-before:always/)
  assert.match(s, /border-top:3px dashed #ff0000/)
  assert.match(s, /<p>תיבה<\/p>/)
  assert.doesNotMatch(s, /<script/)
  // the line (y 20) comes before the text box (y 500)
  assert.ok(s.indexOf('dashed #ff0000') < s.indexOf('<p>תיבה</p>'))
})

test('file names and slugs', () => {
  assert.equal(L.fileName('מכתב: "רשמי"/2', 'doc'), 'מכתב רשמי 2.doc')
  assert.equal(L.fileName('   ', 'txt'), 'מסמך.txt')
  assert.equal(L.slugify('Hello World!'), 'hello-world')
  assert.notEqual(L.newId(), L.newId())
  const now = new Date(2026, 10, 2, 12, 0).getTime()
  assert.equal(L.shortWhen(now - 30000, now), 'עכשיו')
  assert.equal(L.shortWhen(now - 5 * 60000, now), 'לפני 5 דק׳')
  assert.equal(L.shortWhen(new Date(2026, 9, 1, 9, 5).getTime(), now), '1.10.2026 09:05')
})
