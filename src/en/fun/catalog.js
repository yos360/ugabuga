// English trivia, riddles and jokes: pure data (path, title, counterpart, emoji, description).
// Read by englishRoutes.js, the sitemap scripts, the pages themselves and tests. No JSX or React imports here.
import { EN_TRIVIA_1 } from './data/trivia1.js'
import { EN_TRIVIA_2 } from './data/trivia2.js'
import { EN_RIDDLES } from './data/riddles.js'
import { EN_JOKES } from './data/jokes.js'

export const EN_TRIVIA = [...EN_TRIVIA_1, ...EN_TRIVIA_2]
export { EN_RIDDLES, EN_JOKES }

export const FUN_HUBS = {
  trivia: {
    path: '/en/trivia', counterpart: '/trivia/topics', emoji: '🧠',
    title: 'Trivia for kids - free quizzes with answers on 41 topics',
    description: 'Free trivia quizzes for kids and families: animals, space, sports, geography, science and more. Multiple choice, instant answers and a short fact for each.',
    intro: 'Pick a topic, answer twelve questions and see your score. Every answer comes with a short fact, so even a wrong guess teaches something new.',
  },
  riddles: {
    path: '/en/riddles', counterpart: '/tools/riddles', emoji: '🧩',
    title: 'Riddles for kids with answers - easy, logic and funny',
    description: 'Riddles for kids, teens and grown-ups with hints and answers: easy riddles, what am I, math, logic, lateral thinking and detective mysteries.',
    intro: 'Read a riddle out loud, give everyone a moment to think, then reveal a hint before the answer. Great for car rides, dinner and the classroom.',
  },
  jokes: {
    path: '/en/jokes', counterpart: '/tools/joke', emoji: '😂',
    title: 'Jokes for kids - funny, short and clean',
    description: 'Clean, funny jokes for kids: school, animals, food, space, doctor doctor jokes, puns and silly questions. Tap a joke to reveal the punchline.',
    intro: 'Short jokes with a clear punchline that kids love to retell. The comedian\'s secret: say it slowly, pause, then deliver the punchline.',
  },
}

const page = (base, x) => ({ path: `/en/${base}/${x.slug}`, title: x.title, emoji: x.emoji, counterpart: x.counterpart, description: x.description })
const hub = h => ({ path: h.path, title: h.title, emoji: h.emoji, counterpart: h.counterpart, description: h.description })

export const FUN_PAGES = [
  hub(FUN_HUBS.trivia), ...EN_TRIVIA.map(t => page('trivia', t)),
  hub(FUN_HUBS.riddles), ...EN_RIDDLES.map(r => page('riddles', r)),
  hub(FUN_HUBS.jokes), ...EN_JOKES.map(j => page('jokes', j)),
]
