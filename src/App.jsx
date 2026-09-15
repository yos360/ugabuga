import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { lazy, Suspense } from 'react'

const GamesIndex = lazy(() => import('./pages/games/GamesIndex'))
const GamePage = lazy(() => import('./pages/games/GamePage'))
const IdeasHub = lazy(() => import('./pages/ideas/IdeasHub'))
const IdeaArticlePage = lazy(() => import('./pages/ideas/IdeaArticlePage'))
const AgePage = lazy(() => import('./pages/ideas/AgePage'))
const CategoryPage = lazy(() => import('./pages/games/CategoryPage'))
const ThemePage = lazy(() => import('./pages/ideas/ThemePage'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Greeting = lazy(() => import('./pages/Greeting'))
const Invitation = lazy(() => import('./pages/Invitation'))
const PrintablesIndex = lazy(() => import('./pages/printables/PrintablesIndex'))
const PrintableCategory = lazy(() => import('./pages/printables/PrintableCategory'))
const Riddles = lazy(() => import('./pages/tools/Riddles'))
const Dice = lazy(() => import('./pages/tools/Dice'))
const CoinFlip = lazy(() => import('./pages/tools/CoinFlip'))
const CountdownTimer = lazy(() => import('./pages/tools/CountdownTimer'))
const Scoreboard = lazy(() => import('./pages/tools/Scoreboard'))
const TeamGenerator = lazy(() => import('./pages/tools/TeamGenerator'))
const RandomPicker = lazy(() => import('./pages/tools/RandomPicker'))
const TruthOrDare = lazy(() => import('./pages/tools/TruthOrDare'))
const SpinBottle = lazy(() => import('./pages/tools/SpinBottle'))
const DrawingPrompt = lazy(() => import('./pages/tools/DrawingPrompt'))
const Joke = lazy(() => import('./pages/tools/Joke'))
const BingoMaker = lazy(() => import('./pages/tools/BingoMaker'))
const WordSearchMaker = lazy(() => import('./pages/tools/WordSearchMaker'))
const ScavengerHuntMaker = lazy(() => import('./pages/tools/ScavengerHuntMaker'))
const GiftsIndex = lazy(() => import('./pages/gifts/GiftsIndex'))
const AgeGiftPage = lazy(() => import('./pages/gifts/AgeGiftPage'))
const GuidesIndex = lazy(() => import('./pages/guides/GuidesIndex'))
const GuidePage = lazy(() => import('./pages/guides/GuidePage'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="text-5xl buga-bounce">🎂</div>
      <p className="mt-4 font-hand text-lg text-[var(--muted-foreground)]">BUGA מכין את הכל...</p>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<GamesIndex />} />
              <Route path="/games/all" element={<GamesIndex />} />
              <Route path="/games/5-minutes" element={<CategoryPage />} />
              <Route path="/games/10-minutes" element={<CategoryPage />} />
              <Route path="/games/15-minutes" element={<CategoryPage />} />
              <Route path="/games/afterschool" element={<CategoryPage />} />
              <Route path="/games/birthday" element={<CategoryPage />} />
              <Route path="/games/calm" element={<CategoryPage />} />
              <Route path="/games/classroom" element={<CategoryPage />} />
              <Route path="/games/cooperation" element={<CategoryPage />} />
              <Route path="/games/creative" element={<CategoryPage />} />
              <Route path="/games/drawing" element={<CategoryPage />} />
              <Route path="/games/energy" element={<CategoryPage />} />
              <Route path="/games/family" element={<CategoryPage />} />
              <Route path="/games/friends-evening" element={<CategoryPage />} />
              <Route path="/games/icebreaker" element={<CategoryPage />} />
              <Route path="/games/improvisation" element={<CategoryPage />} />
              <Route path="/games/kindergarten" element={<CategoryPage />} />
              <Route path="/games/large-group" element={<CategoryPage />} />
              <Route path="/games/movement" element={<CategoryPage />} />
              <Route path="/games/no-equipment" element={<CategoryPage />} />
              <Route path="/games/no-prep" element={<CategoryPage />} />
              <Route path="/games/quiet" element={<CategoryPage />} />
              <Route path="/games/trivia" element={<CategoryPage />} />
              <Route path="/games/words" element={<CategoryPage />} />
              <Route path="/games/kita-a" element={<CategoryPage />} />
              <Route path="/games/kita-b" element={<CategoryPage />} />
              <Route path="/games/kita-g" element={<CategoryPage />} />
              <Route path="/games/kita-d" element={<CategoryPage />} />
              <Route path="/games/kita-h" element={<CategoryPage />} />
              <Route path="/games/kita-v" element={<CategoryPage />} />
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/ideas" element={<IdeasHub />} />
              <Route path="/ideas/age/:age" element={<AgePage />} />
              <Route path="/ideas/themes/:slug" element={<ThemePage />} />
              <Route path="/ideas/themes" element={<IdeasHub />} />
              <Route path="/ideas/:slug" element={<IdeaArticlePage />} />
              <Route path="/ideas/*" element={<IdeasHub />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/greeting" element={<Greeting />} />
              <Route path="/invitation" element={<Invitation />} />
              <Route path="/printables" element={<PrintablesIndex />} />
              <Route path="/printables/:slug" element={<PrintableCategory />} />
              <Route path="/tools/riddles" element={<Riddles />} />
              <Route path="/tools/dice" element={<Dice />} />
              <Route path="/tools/coin-flip" element={<CoinFlip />} />
              <Route path="/tools/countdown-timer" element={<CountdownTimer />} />
              <Route path="/tools/scoreboard" element={<Scoreboard />} />
              <Route path="/tools/team-generator" element={<TeamGenerator />} />
              <Route path="/tools/random-picker" element={<RandomPicker />} />
              <Route path="/tools/truth-or-dare" element={<TruthOrDare />} />
              <Route path="/tools/spin-the-bottle" element={<SpinBottle />} />
              <Route path="/tools/drawing-prompt" element={<DrawingPrompt />} />
              <Route path="/tools/joke" element={<Joke />} />
              <Route path="/tools/bingo-maker" element={<BingoMaker />} />
              <Route path="/tools/word-search-maker" element={<WordSearchMaker />} />
              <Route path="/tools/scavenger-hunt-maker" element={<ScavengerHuntMaker />} />
              <Route path="/gifts" element={<GiftsIndex />} />
              <Route path="/gifts/age-:age" element={<AgeGiftPage />} />
              <Route path="/guides" element={<GuidesIndex />} />
              <Route path="/guides/:slug" element={<GuidePage />} />
              <Route path="/blog" element={<About />} />
              <Route path="/game-of-the-day" element={<GamesIndex />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  )
}
