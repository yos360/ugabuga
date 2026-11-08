// English section: reading comprehension passages (the Hebrew site's English "unseen" tests).
// Pure data, read by the catalog (build time) and the pages. The levels mirror src/data/unseen/levels.js.
export const RC_ROOT = '/en/reading-comprehension'

export const RC_SKILLS = {
  detail: 'Finding details',
  inference: 'Making inferences',
  vocab: 'Word meaning',
  reference: 'Reference words',
  'main-idea': 'Main idea',
  purpose: 'Purpose and structure',
  opinion: 'Fact, opinion and stance',
  compare: 'Comparing texts',
  table: 'Reading tables',
}

// cefr is approximate: these texts were written for learners of English as a foreign language.
export const RC_LEVELS = [
  { id: 'g3', path: 'grade-3', name: 'Grade 3', cefr: 'Starter', words: [25, 60], questions: [4, 6], minutes: 15,
    about: 'First reading in English: a few short sentences about a familiar topic such as family, pets or colors, with simple matching, multiple-choice and copy-a-word questions.' },
  { id: 'g4', path: 'grade-4', name: 'Grade 4', cefr: 'Pre-A1', words: [45, 85], questions: [5, 7], minutes: 15,
    about: 'A short text in the present tense, such as an introduction card, an invitation or a description, with a word list, multiple-choice questions and a short copying question.' },
  { id: 'g5', path: 'grade-5', name: 'Grade 5', cefr: 'A1', words: [70, 120], questions: [6, 8], minutes: 20,
    about: 'A very short text in simple present-tense sentences, with a word list, multiple-choice questions and one copying question.' },
  { id: 'g6', path: 'grade-6', name: 'Grade 6', cefr: 'A1', words: [100, 150], questions: [6, 8], minutes: 20,
    about: 'A short story, letter, notice or fact text with multiple-choice questions, finding information and one short open question.' },
  { id: 'g7', path: 'grade-7', name: 'Grade 7', cefr: 'A1–A2', words: [120, 190], questions: [7, 9], minutes: 25,
    about: 'A short text in simple language, a personal story or a fact text, with multiple-choice and short copying questions.' },
  { id: 'g8', path: 'grade-8', name: 'Grade 8', cefr: 'A2', words: [180, 250], questions: [8, 10], minutes: 30,
    about: 'A medium-length text with multiple-choice questions, sentence completion and "what does the word refer to" questions.' },
  { id: 'g9', path: 'grade-9', name: 'Grade 9', cefr: 'A2–B1', words: [220, 310], questions: [9, 11], minutes: 35,
    about: 'End-of-middle-school level: about half closed and half open questions, finding information, inference and word meaning in context.' },
  { id: 'mod-a', path: 'module-a', name: 'Module A', cefr: 'B1', words: [170, 215], texts: 2, questions: [13, 16], minutes: 75,
    about: 'Two short texts, in the style of the Israeli Bagrut exam at 3 units, with direct questions on each one.' },
  { id: 'mod-c', path: 'module-c', name: 'Module C', cefr: 'B1', words: [250, 320], questions: [8, 10], minutes: 60,
    about: 'One text of up to about 300 words, a personal story, an article or a fact text, with 8–10 questions and a short writing task, in the style of the 4-unit Bagrut exam.' },
  { id: 'mod-e', path: 'module-e', name: 'Module E', cefr: 'B1–B2', words: [330, 420], questions: [9, 11], minutes: 70,
    about: 'A text of up to about 400 words with a glossary, comprehension questions and vocabulary-in-context questions, in the style of the 4–5 unit Bagrut exam.' },
  { id: 'mod-g', path: 'module-g', name: 'Module G', cefr: 'B2', words: [420, 530], questions: [8, 10], minutes: 75,
    about: 'The longest and most complex texts: articles, essays and opinion pieces, with inference, writer\'s stance and paragraph-purpose questions, and an essay task, in the style of the 5-unit Bagrut exam.' },
]
export const rcLevel = id => RC_LEVELS.find(l => l.id === id)
export const rcLevelHref = L => `${RC_ROOT}/${L.path}`
export const rcHref = t => `${RC_ROOT}/${t.slug}`
