import { createClient } from '@supabase/supabase-js'

// Online multiple-choice quizzes — same Supabase project as the party lists.
// Grading happens in the database; the student page never receives the answers.
const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const client = createClient(URL, KEY, { auth: { storageKey: 'ugabuga-quizzes', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

const CODES = 'quiz_not_found|quiz_closed|name_required|name_taken|already_submitted|quiz_full|not_owner|has_submissions|bad_questions|empty_question|bad_options|empty_option|bad_correct'
const call = (fn, args) => client.rpc(fn, args).then(({ data, error }) => {
  if (error) {
    const code = new RegExp(CODES).exec(error.message || '')?.[0] || (/PGRST202|Could not find the function/i.test(`${error.code} ${error.message}`) ? 'not_installed' : 'network')
    throw Object.assign(new Error(code), { code })
  }
  return Array.isArray(data) ? data[0] ?? null : data
})
const need = row => { if (!row) throw Object.assign(new Error('quiz_not_found'), { code: 'quiz_not_found' }); return row }

export const quizDb = {
  create: (token, title, questions, settings, names) => call('quiz_create', { p_owner_token: token, p_title: title, p_questions: questions, p_settings: settings, p_names: names }).then(need).then(r => r.code),
  update: (code, token, { title = null, questions = null, settings = null, names = null }) => call('quiz_update', { p_code: code, p_owner_token: token, p_title: title, p_questions: questions, p_settings: settings, p_names: names }),
  setStatus: (code, token, status) => call('quiz_set_status', { p_code: code, p_owner_token: token, p_status: status }),
  get: code => call('quiz_get_public', { p_code: code }).then(need),
  submit: (code, deviceId, name, answers) => call('quiz_submit', { p_code: code, p_device_id: deviceId, p_name: name, p_answers: answers }).then(need),
  results: (code, token) => call('quiz_results', { p_code: code, p_owner_token: token }).then(r => { if (!r) throw Object.assign(new Error('not_owner'), { code: 'not_owner' }); return r }),
  deleteSubmission: (code, token, id) => call('quiz_delete_submission', { p_code: code, p_owner_token: token, p_submission_id: id }),
  remove: (code, token) => call('quiz_delete', { p_code: code, p_owner_token: token }),
}

export const quizErrorText = code => ({
  quiz_not_found: 'לא מצאנו את המבחן. אולי הקישור נחתך או שעברו 30 יום?',
  quiz_closed: 'המורה סגר/ה את המבחן.',
  name_required: 'צריך לכתוב שם.',
  name_taken: 'השם הזה כבר הגיש. אם יש שני ילדים עם אותו שם — הוסיפו אות ממשפחה (למשל: נועה כ.)',
  already_submitted: 'מהמכשיר הזה כבר הוגש מבחן.',
  quiz_full: 'המבחן מלא.',
  not_owner: 'אין הרשאה לנהל את המבחן הזה ממכשיר זה.',
  has_submissions: 'אי אפשר לשנות שאלות אחרי שתלמידים כבר הגישו.',
  empty_question: 'יש שאלה ריקה.',
  empty_option: 'יש תשובה ריקה.',
  bad_options: 'לכל שאלה צריך 2–4 תשובות.',
  bad_correct: 'צריך לסמן תשובה נכונה לכל שאלה.',
  bad_questions: 'צריך בין שאלה אחת ל-50 שאלות.',
  not_installed: 'המבחנים עוד לא הופעלו במסד הנתונים.',
}[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.')

const read = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }
export const newToken = () => (crypto.randomUUID?.() || String(Math.random()) + Date.now()).replace(/-/g, '') + Math.random().toString(36).slice(2, 10)
export const newQid = () => Math.random().toString(36).slice(2, 10)

export const quizMemory = {
  mine: () => read('buga-quizzes-owned', []),
  token: code => read('buga-quizzes-owned', []).find(q => q.code === code)?.token || null,
  remember: (code, token, title) => write('buga-quizzes-owned', [{ code, token, title, at: Date.now() }, ...read('buga-quizzes-owned', []).filter(q => q.code !== code)].slice(0, 40)),
  forget: code => write('buga-quizzes-owned', read('buga-quizzes-owned', []).filter(q => q.code !== code)),
  deviceId: () => { let id = read('buga-device-id', ''); if (!id) { id = newToken().slice(0, 24); write('buga-device-id', id) } return id },
  done: code => read('buga-quiz-done', {})[code] || null,
  setDone: (code, v) => write('buga-quiz-done', { ...read('buga-quiz-done', {}), [code]: v }),
  classLists: () => read('buga-class-lists', []),
}

export const quizLink = code => `${location.origin}/q/${code}`
export const manageLink = (code, token) => `${location.origin}/classroom/quiz/${code}#k=${token}`
