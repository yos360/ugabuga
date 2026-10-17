// Homework data. Teachers sign in (Google or an email link) with their own Supabase session,
// kept apart from the owner's; students only call the public hw_* functions with the site key.
import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

// The publishable key is not a JWT: send it as apikey only, so a signed-in teacher's token is the bearer.
const keyOnly = (input, init) => {
  const headers = new Headers(init?.headers)
  if (headers.get('Authorization') === `Bearer ${KEY}`) headers.delete('Authorization')
  headers.set('apikey', KEY)
  return fetch(input, { ...init, headers })
}

export const teacherDb = createClient(URL, KEY, {
  global: { fetch: keyOnly },
  auth: { storageKey: 'ugabuga-teacher-auth', flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
const studentDb = createClient(URL, KEY, {
  global: { fetch: keyOnly },
  auth: { storageKey: 'ugabuga-homework-student', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const ERRORS = {
  not_found: 'לא מצאנו את שיעורי הבית — בדקו את הקישור או את הקוד.',
  closed: 'המורה סגרה את שיעורי הבית האלה, ואי אפשר להגיש אותם יותר.',
  unknown_name: 'השם לא מופיע ברשימת הכיתה. בחרו את השם שלכם מהרשימה.',
  name_required: 'כתבו את השם שלכם.',
  not_signed_in: 'צריך להתחבר מחדש.',
  title_required: 'תנו שם לשיעורי הבית.',
  bad_tasks: 'יש משימה לא תקינה. בדקו את המשימות ונסו שוב.',
  too_many: 'הגעתם למספר המרבי. מחקו שיעורי בית ישנים ונסו שוב.',
  network: 'אין חיבור לאינטרנט — נסו שוב בעוד רגע.',
}
export const homeworkError = error => ERRORS[error?.code] || ERRORS.network

const known = /^(not_found|closed|unknown_name|name_required|not_signed_in|title_required|bad_tasks|too_many|bad_input)$/
const call = (client, fn, args) => client.rpc(fn, args).then(({ data, error }) => {
  if (error) {
    const code = (error.message || '').match(known)?.[0] || 'network'
    throw Object.assign(new Error(code), { code })
  }
  return data
})

export const homeworkTeacher = {
  session: () => teacherDb.auth.getSession().then(({ data }) => data.session),
  onAuth: callback => teacherDb.auth.onAuthStateChange((_event, session) => callback(session)).data.subscription,
  signInGoogle: redirectTo => teacherDb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }),
  signInEmail: (email, redirectTo) => teacherDb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } }),
  signOut: () => teacherDb.auth.signOut(),
  list: () => teacherDb.from('hw_assignments').select('id,code,title,class_name,due_date,status,created_at,updated_at,tasks,names').order('created_at', { ascending: false }).then(({ data, error }) => { if (error) throw error; return data }),
  get: code => teacherDb.from('hw_assignments').select('id,code,title,class_name,due_date,status,tasks,names,created_at').eq('code', code).maybeSingle().then(({ data, error }) => { if (error) throw error; return data }),
  results: id => teacherDb.from('hw_results').select('student_name,task_index,score,total,seconds,attempts,details,updated_at').eq('assignment_id', id).then(({ data, error }) => { if (error) throw error; return data }),
  resultCounts: () => teacherDb.from('hw_results').select('assignment_id,student_name').then(({ data, error }) => { if (error) throw error; return data }),
  save: ({ code = null, title, className, dueDate, tasks, names }) => call(teacherDb, 'hw_save', { p_code: code, p_title: title, p_class: className || null, p_due: dueDate || null, p_tasks: tasks, p_names: names }),
  setStatus: (code, status) => call(teacherDb, 'hw_set_status', { p_code: code, p_status: status }),
  remove: code => teacherDb.from('hw_assignments').delete().eq('code', code).then(({ error }) => { if (error) throw error }),
  removeResult: (id, name, task) => teacherDb.from('hw_results').delete().eq('assignment_id', id).eq('student_name', name).eq('task_index', task).then(({ error }) => { if (error) throw error }),
}

const DEVICE_KEY = 'buga-homework-device'
export function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id) }
    return id
  } catch { return 'no-storage' }
}

export const homeworkStudent = {
  open: code => call(studentDb, 'hw_open', { p_code: code }),
  progress: (code, name) => call(studentDb, 'hw_progress', { p_code: code, p_name: name }),
  submit: (code, name, task, result) => call(studentDb, 'hw_submit', {
    p_code: code, p_device: deviceId(), p_name: name, p_task: task,
    p_score: result.score, p_total: result.total, p_seconds: Math.round(result.seconds || 0), p_details: result.details || [],
  }),
}

export const homeworkLink = code => `https://ugabuga.co.il/hw/${code}`
