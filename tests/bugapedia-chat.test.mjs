import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { CLASSROOM_SUBJECTS, bugaPediaUrl } from '../src/data/classroomSubjects.js'

test('BugaPedia covers a broad, unique classroom subject catalog', () => {
  assert.ok(CLASSROOM_SUBJECTS.length >= 20)
  assert.equal(new Set(CLASSROOM_SUBJECTS.map(item => item.id)).size, CLASSROOM_SUBJECTS.length)
  assert.ok(CLASSROOM_SUBJECTS.some(item => item.id === 'bible' && item.name.includes('תנ')))
  assert.ok(CLASSROOM_SUBJECTS.some(item => item.id === 'geography'))
  for (const subject of CLASSROOM_SUBJECTS) {
    assert.ok(subject.name && subject.icon && subject.examples.length >= 3)
    assert.ok(subject.examples.every(question => question.endsWith('?')))
  }
  assert.match(bugaPediaUrl('מהי כבידה?', 'physics'), /^\/bugapedia\?q=.+&subject=physics$/)
})

test('BugaPedia keeps one canonical searchable URL and a working legacy alias', async () => {
  const [app, search, staticSitemap] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8'),
  ])
  assert.ok(app.includes('path="/bugapedia"'))
  assert.ok(app.includes('path="/classroom/subjects"'))
  assert.ok(search.includes("to: '/bugapedia'"))
  assert.ok(!search.includes("to: '/classroom/subjects'"))
  assert.ok(staticSitemap.includes('https://ugabuga.co.il/bugapedia</loc>'))
  assert.ok(!staticSitemap.includes('https://ugabuga.co.il/classroom/subjects</loc>'))
})

test('site chat migration keeps tables private and owner RPCs authenticated', async () => {
  const sql = await readFile(new URL('../supabase/migrations/202610160003_site_chat.sql', import.meta.url), 'utf8')
  const permissions = await readFile(new URL('../supabase/migrations/202610160004_site_chat_owner_permissions.sql', import.meta.url), 'utf8')
  assert.match(sql, /alter table public\.site_chat_threads enable row level security/i)
  assert.match(sql, /revoke all on public\.site_chat_threads from anon, authenticated/i)
  assert.match(sql, /public_token uuid not null unique/i)
  assert.match(sql, /lower\(coalesce\(auth\.jwt\(\) ->> 'email'/i)
  assert.match(permissions, /revoke execute on function public\.site_chat_owner_list\(int\) from public, anon/i)
  assert.match(permissions, /grant execute on function public\.site_chat_owner_list\(int\) to authenticated/i)
})


test('site chat invitation stays opposite the WhatsApp share button', async () => {
  const [widget, chatCss, whatsappCss] = await Promise.all([
    readFile(new URL('../src/components/chat/SiteChatWidget.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/chat/site-chat.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/layout/whatsapp-share.css', import.meta.url), 'utf8'),
  ])
  assert.ok(widget.includes('יש לכם רעיון? דברו עם בוגה'))
  assert.match(chatCss, /\.site-chat\{[^}]*right:18px;left:auto/)
  assert.match(chatCss, /\.site-chat-panel\{[^}]*right:0;left:auto/)
  assert.match(whatsappCss, /\.wa-fab\{[^}]*left:16px/)
})
