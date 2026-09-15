import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { lazy, Suspense } from 'react'

const GamesIndex = lazy(() => import('./pages/games/GamesIndex'))
const GamePage = lazy(() => import('./pages/games/GamePage'))
const IdeasHub = lazy(() => import('./pages/ideas/IdeasHub'))
const AgePage = lazy(() => import('./pages/ideas/AgePage'))
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
              <Route path="/games/:filter" element={<GamesIndex />} />
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/ideas" element={<IdeasHub />} />
              <Route path="/ideas/age/:age" element={<AgePage />} />
              <Route path="/ideas/themes/:slug" element={<ThemePage />} />
              <Route path="/ideas/themes" element={<IdeasHub />} />
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
              <Route path="/gifts" element={<IdeasHub />} />
              <Route path="/gifts/*" element={<IdeasHub />} />
              <Route path="/guides" element={<About />} />
              <Route path="/guides/*" element={<About />} />
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
