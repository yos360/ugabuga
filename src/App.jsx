import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import HubPage from './pages/HubPage'
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
const ActivityWorksheet = lazy(() => import('./pages/printables/ActivityWorksheet'))
const BirthdayChecklist = lazy(() => import('./pages/printables/BirthdayChecklist'))
const RootsProject = lazy(() => import('./pages/printables/RootsProject'))
const BirthdayNewspaper = lazy(() => import('./pages/printables/BirthdayNewspaper'))
const PhotoProps = lazy(() => import('./pages/printables/PhotoProps'))
const ColoringPages = lazy(() => import('./pages/printables/ColoringPages'))
const ToolsIndex = lazy(() => import('./pages/tools/ToolsIndex'))
const Riddles = lazy(() => import('./pages/tools/Riddles'))
const TriviaQuiz = lazy(() => import('./pages/tools/TriviaQuiz'))
const BugaTown = lazy(() => import('./pages/tools/BugaTown'))
const EscapeRooms = lazy(() => import('./pages/tools/EscapeRooms'))
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
const EretzIr = lazy(() => import('./pages/tools/EretzIr'))
const WordSearchMaker = lazy(() => import('./pages/tools/WordSearchMaker'))
const CrosswordMaker = lazy(() => import('./pages/tools/CrosswordMaker'))
const BringList = lazy(() => import('./pages/tools/BringList'))
const BirthdayFamous = lazy(() => import('./pages/tools/BirthdayFamous'))
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
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-16" role="status" aria-live="polite">
      <div className="w-full max-w-md rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_8px_0_var(--border)]">
        <div className="text-6xl buga-bounce">🎂</div>
        <div className="mx-auto mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--accent)]" />
        </div>
        <p className="mt-5 font-hand text-2xl font-bold text-[var(--ink)]">BUGA מכין את המשחק...</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">טוענים את השאלות והאפשרויות. זה אמור לקחת רגע.</p>
      </div>
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
              <Route path="/birthday" element={<HubPage type="birthday" />} />
              <Route path="/classroom" element={<HubPage type="classroom" />} />
              <Route path="/create" element={<HubPage type="create" />} />
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
              <Route path="/games/age/:age" element={<GamesIndex />} />
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
              <Route path="/calculator/birthday-cost" element={<Calculator />} />
              <Route path="/calculator/how-many-drinks" element={<Calculator />} />
              <Route path="/calculator/how-many-pizzas" element={<Calculator />} />
              <Route path="/party-calculator" element={<Calculator />} />
              <Route path="/birthday-cost" element={<Calculator />} />
              <Route path="/how-many-pizzas" element={<Calculator />} />
              <Route path="/how-many-drinks" element={<Calculator />} />
              <Route path="/tools/birthday-calculator" element={<Calculator />} />
              <Route path="/tools/party-calculator" element={<Calculator />} />
              <Route path="/tools/how-many-pizzas" element={<Calculator />} />
              <Route path="/tools/how-many-drinks" element={<Calculator />} />
              <Route path="/greeting" element={<Greeting />} />
              <Route path="/greetings" element={<Greeting />} />
              <Route path="/birthday-greeting" element={<Greeting />} />
              <Route path="/tools/greeting-generator" element={<Greeting />} />
              <Route path="/tools/greetings" element={<Greeting />} />
              <Route path="/invitation" element={<Invitation />} />
              <Route path="/invitations" element={<Invitation />} />
              <Route path="/birthday-invitation" element={<Invitation />} />
              <Route path="/tools/invitation-generator" element={<Invitation />} />
              <Route path="/tools/invitations" element={<Invitation />} />
              <Route path="/printables" element={<PrintablesIndex />} />
              <Route path="/printables/activity/:type" element={<ActivityWorksheet />} />
              <Route path="/printables/birthday-checklist" element={<BirthdayChecklist />} />
              <Route path="/printables/roots-project" element={<RootsProject />} />
              <Route path="/printables/birthday-newspaper" element={<BirthdayNewspaper />} />
              <Route path="/printables/photo-props" element={<PhotoProps />} />
              <Route path="/printables/coloring" element={<ColoringPages />} />
              <Route path="/printables/:slug" element={<PrintableCategory />} />
              <Route path="/tools" element={<ToolsIndex />} />
              <Route path="/tools/birthday-famous" element={<BirthdayFamous />} />
              <Route path="/tools/riddles" element={<Riddles />} />
              <Route path="/riddles" element={<Riddles />} />
              <Route path="/games/riddles" element={<Riddles />} />
              <Route path="/tools/trivia-quiz" element={<TriviaQuiz />} />
              <Route path="/trivia" element={<TriviaQuiz />} />
              <Route path="/quiz" element={<TriviaQuiz />} />
              <Route path="/tools/quiz" element={<TriviaQuiz />} />
              <Route path="/tools/trivia" element={<TriviaQuiz />} />
              <Route path="/games/buga-trivia" element={<TriviaQuiz />} />
              <Route path="/tools/buga-town" element={<BugaTown />} />
              <Route path="/buga-town" element={<BugaTown />} />
              <Route path="/bugatown" element={<BugaTown />} />
              <Route path="/buga-town-game" element={<BugaTown />} />
              <Route path="/games/buga-town" element={<BugaTown />} />
              <Route path="/tools/escape-rooms" element={<EscapeRooms />} />
              <Route path="/escape-rooms" element={<EscapeRooms />} />
              <Route path="/escape-room" element={<EscapeRooms />} />
              <Route path="/tools/escape-room" element={<EscapeRooms />} />
              <Route path="/games/escape-room" element={<EscapeRooms />} />
              <Route path="/games/escape-rooms" element={<EscapeRooms />} />
              <Route path="/tools/dice" element={<Dice />} />
              <Route path="/dice" element={<Dice />} />
              <Route path="/tools/coin-flip" element={<CoinFlip />} />
              <Route path="/coin-flip" element={<CoinFlip />} />
              <Route path="/tools/countdown-timer" element={<CountdownTimer />} />
              <Route path="/tools/timer" element={<CountdownTimer />} />
              <Route path="/timer" element={<CountdownTimer />} />
              <Route path="/countdown" element={<CountdownTimer />} />
              <Route path="/tools/scoreboard" element={<Scoreboard />} />
              <Route path="/scoreboard" element={<Scoreboard />} />
              <Route path="/tools/team-generator" element={<TeamGenerator />} />
              <Route path="/team-generator" element={<TeamGenerator />} />
              <Route path="/tools/random-picker" element={<RandomPicker />} />
              <Route path="/tools/wheel" element={<RandomPicker />} />
              <Route path="/random-picker" element={<RandomPicker />} />
              <Route path="/wheel" element={<RandomPicker />} />
              <Route path="/tools/truth-or-dare" element={<TruthOrDare />} />
              <Route path="/truth-or-dare" element={<TruthOrDare />} />
              <Route path="/tools/truth-or-buga" element={<TruthOrDare />} />
              <Route path="/truth-or-buga" element={<TruthOrDare />} />
              <Route path="/emet-o-buga" element={<TruthOrDare />} />
              <Route path="/emet-or-buga" element={<TruthOrDare />} />
              <Route path="/games/emet-o-buga" element={<TruthOrDare />} />
              <Route path="/games/truth-or-buga" element={<TruthOrDare />} />
              <Route path="/tools/spin-the-bottle" element={<SpinBottle />} />
              <Route path="/spin-the-bottle" element={<SpinBottle />} />
              <Route path="/tools/drawing-prompt" element={<DrawingPrompt />} />
              <Route path="/drawing-prompt" element={<DrawingPrompt />} />
              <Route path="/tools/joke" element={<Joke />} />
              <Route path="/jokes" element={<Joke />} />
              <Route path="/joke" element={<Joke />} />
              <Route path="/tools/bingo-maker" element={<BingoMaker />} />
              <Route path="/tools/eretz-ir" element={<EretzIr />} />
              <Route path="/eretz-ir" element={<EretzIr />} />
              <Route path="/games/eretz-ir-buga" element={<EretzIr />} />
              <Route path="/tools/bingo" element={<BingoMaker />} />
              <Route path="/bingo" element={<BingoMaker />} />
              <Route path="/bingo-maker" element={<BingoMaker />} />
              <Route path="/games/buga-bingo" element={<BingoMaker />} />
              <Route path="/games/bingo" element={<BingoMaker />} />
              <Route path="/tools/word-search-maker" element={<WordSearchMaker />} />
              <Route path="/tools/crossword-maker" element={<CrosswordMaker />} />
              <Route path="/tools/bring-list" element={<BringList />} />
              <Route path="/bring-list" element={<BringList />} />
              <Route path="/crossword" element={<CrosswordMaker />} />
              <Route path="/tools/word-search" element={<WordSearchMaker />} />
              <Route path="/word-search" element={<WordSearchMaker />} />
              <Route path="/word-search-maker" element={<WordSearchMaker />} />
              <Route path="/tools/scavenger-hunt-maker" element={<ScavengerHuntMaker />} />
              <Route path="/tools/scavenger-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/scavenger-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/treasure-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/gifts" element={<GiftsIndex />} />
              <Route path="/gifts/boy" element={<GiftsIndex />} />
              <Route path="/gifts/girl" element={<GiftsIndex />} />
              <Route path="/gifts/under-50" element={<GiftsIndex />} />
              <Route path="/gifts/under-100" element={<GiftsIndex />} />
              <Route path="/gifts/age-:age" element={<AgeGiftPage />} />
              <Route path="/guides" element={<GuidesIndex />} />
              <Route path="/guides/:slug" element={<GuidePage />} />
              <Route path="/compare/home-vs-venue" element={<IdeasHub />} />
              <Route path="/compare/entertainer-vs-diy" element={<IdeasHub />} />
              <Route path="/songs/birthday-songs" element={<IdeasHub />} />
              <Route path="/birthday-songs" element={<IdeasHub />} />
              <Route path="/blog" element={<IdeasHub />} />
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
