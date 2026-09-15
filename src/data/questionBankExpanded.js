import {
  AUDIENCES,
  DIFFICULTIES,
  QUESTION_BANK,
  QUESTION_TOPICS,
} from './questionBank'
import { EXTRA_QUESTIONS, EXTRA_QUESTION_TOPICS } from './questionBankExtra'
import { MORE_QUESTIONS, MORE_QUESTION_TOPICS } from './questionBankMore'

const topicIds = new Set()

export { AUDIENCES, DIFFICULTIES }

export const QUESTION_TOPICS_EXPANDED = [
  ...QUESTION_TOPICS,
  ...EXTRA_QUESTION_TOPICS,
  ...MORE_QUESTION_TOPICS,
].filter((topic) => {
  if (topicIds.has(topic.id)) return false
  topicIds.add(topic.id)
  return true
})

export const QUESTION_BANK_EXPANDED = [...QUESTION_BANK, ...EXTRA_QUESTIONS, ...MORE_QUESTIONS]

export function getQuestions({ topic = 'all', audience = 'kids', difficulty = 'easy', type = 'riddle' } = {}) {
  return QUESTION_BANK_EXPANDED.filter((item) => {
    const topicMatch = topic === 'all' || item.topic === topic
    const audienceMatch = item.audience === audience
    const difficultyMatch = item.difficulty === difficulty
    const typeMatch = type === 'all' || item.type === type || (type === 'riddle' && item.hint)
    return topicMatch && audienceMatch && difficultyMatch && typeMatch
  })
}

export function pickNextQuestion(questions, previousIds = []) {
  if (!questions.length) return null

  const fresh = questions.filter((item) => !previousIds.includes(item.id))
  const pool = fresh.length ? fresh : questions
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

export { QUESTION_TOPICS_EXPANDED as QUESTION_TOPICS }
