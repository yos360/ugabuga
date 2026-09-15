import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { lazy, Suspense } from 'react'

const GamesIndex = lazy(() => import('./pages/games/GamesIndex'))
const GamePage = lazy(() => import('./pages/games/GamePage'))
const IdeasHub = lazy(() => import('./pages/ideas/IdeasHub'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Greeting = lazy(() => import('./pages/Greeting'))
const PrintablesIndex = lazy(() => import('./pages/printables/PrintablesIndex'))
const PrintableCategory = lazy(() => import('./pages/printables/PrintableCategory'))
const Riddles = lazy(() => import('./pages/tools/Riddles'))
const Dice = lazy(() => import('./pages/tools/Dice'))
const CoinFlip = lazy(() => import('./pages/tools/CoinFlip'))
const Scoreboard = lazy(() => import('./pages/tools/Scoreboard'))
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
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/ideas" element={<IdeasHub />} />
              <Route path="/ideas/*" element={<IdeasHub />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/greeting" element={<Greeting />} />
              <Route path="/printables" element={<PrintablesIndex />} />
              <Route path="/printables/:slug" element={<PrintableCategory />} />
              <Route path="/tools/riddles" element={<Riddles />} />
              <Route path="/tools/dice" element={<Dice />} />
              <Route path="/tools/coin-flip" element={<CoinFlip />} />
              <Route path="/tools/scoreboard" element={<Scoreboard />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  )
}
