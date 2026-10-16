import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const client = createClient(URL, KEY, { auth: { storageKey: 'ugabuga-live', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
const KNOWN = 'game_not_found|game_finished|game_started|game_full|name_required|name_taken|player_not_found|question_closed|question_open|already_answered|bad_option|bad_phase|bad_action|not_owner|bad_questions|empty_question|bad_options|empty_option|bad_correct'
const call = (fn, args) => client.rpc(fn, args).then(({ data, error }) => {
  if (error) {
    const code = new RegExp(KNOWN).exec(error.message || '')?.[0] || (/PGRST202|Could not find the function/i.test(`${error.code} ${error.message}`) ? 'not_installed' : 'network')
    throw Object.assign(new Error(code), { code })
  }
  return Array.isArray(data) ? data[0] ?? null : data
})

export const liveQuizDb = {
  create: (token, title, questions, seconds) => call('live_quiz_create', { p_owner_token: token, p_title: title, p_questions: questions, p_seconds: seconds }).then(r => r?.code),
  join: (code, token, nickname) => call('live_quiz_join', { p_code: cleanCode(code), p_player_token: token, p_nickname: nickname }),
  host: (code, token) => call('live_quiz_host_state', { p_code: cleanCode(code), p_owner_token: token }),
  player: (code, token) => call('live_quiz_player_state', { p_code: cleanCode(code), p_player_token: token }),
  answer: (code, token, index, option) => call('live_quiz_answer', { p_code: cleanCode(code), p_player_token: token, p_question_index: index, p_option_index: option }),
  action: (code, token, action) => call('live_quiz_host_action', { p_code: cleanCode(code), p_owner_token: token, p_action: action }),
  state: code => client.from('live_quiz_public_states').select('code,phase,question_index,ends_at,payload,revision').eq('code', cleanCode(code)).maybeSingle().then(({ data, error }) => {
    if (error) throw Object.assign(new Error('network'), { code: 'network' })
    if (!data) throw Object.assign(new Error('game_not_found'), { code: 'game_not_found' })
    return data
  }),
  watch(code, onState, onStatus) {
    const channel = client.channel(`buga-live-${cleanCode(code)}`).on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'live_quiz_public_states', filter: `code=eq.${cleanCode(code)}`,
    }, event => onState(event.new)).subscribe(status => onStatus?.(status))
    return () => client.removeChannel(channel)
  },
}

export const cleanCode = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
export const liveSecondsRemaining = (end, now = Date.now()) => {
  const target = Date.parse(end)
  return Number.isFinite(target) ? Math.max(0, Math.ceil((target - now) / 1000)) : null
}
export const newLiveToken = () => (crypto.randomUUID?.() || `${Date.now()}${Math.random()}`).replace(/-/g, '') + Math.random().toString(36).slice(2)
export const livePlayLink = code => `${location.origin}/play/${cleanCode(code)}`
export const liveHostLink = (code, token) => `${location.origin}/live/${cleanCode(code)}/host#k=${token}`

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ } }
export const liveMemory = {
  owned: () => read('buga-live-owned', []),
  hostToken: code => read('buga-live-owned', []).find(g => g.code === cleanCode(code))?.token || null,
  rememberHost(code, token, title) { const list = read('buga-live-owned', []).filter(g => g.code !== cleanCode(code)); write('buga-live-owned', [{ code: cleanCode(code), token, title, at: Date.now() }, ...list].slice(0, 20)) },
  player(code) { return read('buga-live-player', {})[cleanCode(code)] || null },
  rememberPlayer(code, token, name) { const all = read('buga-live-player', {}); write('buga-live-player', { ...all, [cleanCode(code)]: { token, name } }) },
}

export const liveErrorText = code => ({
  game_not_found: '�� ����� ���� �� ���� ���. ���� �� ���� ���� ���.',
  game_finished: '����� ��� ��� ������.', game_started: '����� ��� ����� ��� ���� ������ �����.',
  game_full: '����� ��� - ��� ������ 100 ������.', name_required: '���� ����� �����.',
  name_taken: '������ ��� ��� ����. ��� ����� ���.', player_not_found: '���� ������ ���� �����.',
  question_closed: '���� ����� ���� ����.', question_open: '����� ����� �����.', already_answered: '��� ����� �� ����� ����.',
  not_owner: '����� ������ ���� ���� ������ ���.', bad_questions: '���� ��� ���� ��� �?50 �����.',
  empty_question: '�� ���� ����.', empty_option: '�� ����� ����.', bad_options: '��� ���� ���� 2-4 ������.',
  bad_correct: '���� ���� ����� ����� ��� ����.', not_installed: '���� ���� ����� �� ����� ���� �������.',
}[code] || '������ ����. ���� �� �������� ���� ���.')

export const liveQuestionProblem = questions => {
  if (!questions.length || questions.length > 50) return '���� ��� ���� ��� �?50 �����.'
  for (const [i, q] of questions.entries()) {
    if (!q.q.trim()) return `���� ${i + 1}: ��� ���� �����.`
    if (q.options.length < 2 || q.options.length > 4 || q.options.some(o => !o.trim())) return `���� ${i + 1}: ���� ���� 2-4 ������.`
    if (q.correct == null || !q.options[q.correct]?.trim()) return `���� ${i + 1}: ���� �� ������ ������.`
  }
  return ''
}

