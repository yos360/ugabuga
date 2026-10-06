import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import PageErrorBoundary from './components/layout/PageErrorBoundary'
import Home from './pages/Home'
const HubPage = lazy(() => import('./pages/HubPage'))
import { lazy, Suspense } from 'react'

const GamesIndex = lazy(() => import('./pages/games/GamesIndex'))
const GamePage = lazy(() => import('./pages/games/GamePage'))
const MaHayom = lazy(() => import('./pages/MaHayom'))
const Search = lazy(() => import('./pages/Search'))
const IdeasHub = lazy(() => import('./pages/ideas/IdeasHub'))
const BlogIndex = lazy(() => import('./pages/blog/BlogIndex'))
const BlogPost = lazy(() => import('./pages/blog/BlogPost'))
const FaqTopic = lazy(() => import('./pages/FaqTopic'))
const TriviaTopic = lazy(() => import('./pages/content/TriviaTopic'))
const TriviaTopicsHub = lazy(() => import('./pages/content/TriviaTopic').then(m => ({ default: m.TriviaTopicsHub })))
const GreetingPage = lazy(() => import('./pages/content/GreetingPage'))
const GreetingsHub = lazy(() => import('./pages/content/GreetingPage').then(m => ({ default: m.GreetingsHub })))
const QuestionsPage = lazy(() => import('./pages/content/QuestionsPage'))
const QuestionsHub = lazy(() => import('./pages/content/QuestionsPage').then(m => ({ default: m.QuestionsHub })))
const AnimalsHub = lazy(() => import('./pages/content/AnimalPages').then(m => ({ default: m.AnimalsHub })))
const AnimalPage = lazy(() => import('./pages/content/AnimalPages').then(m => ({ default: m.AnimalPage })))
const RiddlesHub = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.RiddlesHub })))
const RiddlePage = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.RiddlePage })))
const JokesHub = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.JokesHub })))
const JokePage = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.JokePage })))
const HuntsHub = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.HuntsHub })))
const HuntPage = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.HuntPage })))
const EnglishHub = lazy(() => import('./pages/english/EnglishPages').then(m => ({ default: m.EnglishHub })))
const EnglishTopic = lazy(() => import('./pages/english/EnglishPages').then(m => ({ default: m.EnglishTopic })))
const LanguagesHub = lazy(() => import('./pages/languages/LanguagePages').then(m => ({ default: m.LanguagesHub })))
const LanguageHome = lazy(() => import('./pages/languages/LanguagePages').then(m => ({ default: m.LanguageHome })))
const LanguageTopic = lazy(() => import('./pages/languages/LanguagePages').then(m => ({ default: m.LanguageTopic })))
const LanguageQuiz = lazy(() => import('./pages/languages/LanguagePages').then(m => ({ default: m.LanguageQuiz })))
const AbcHub = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.AbcHub })))
const AbcLetterPage = lazy(() => import('./pages/content/MoreContent').then(m => ({ default: m.AbcLetterPage })))
const DndDice = lazy(() => import('./pages/tools/dice/DndDice'))
const DicePresetPage = lazy(() => import('./pages/tools/dice/DicePresetPage'))
const RandomNumber = lazy(() => import('./pages/tools/RandomNumber'))
const DiceTemplate = lazy(() => import('./pages/printables/DiceTemplate'))
const DiceGamesIndex = lazy(() => import('./pages/tools/dice/DiceGames').then(m => ({ default: m.DiceGamesIndex })))
const DiceGamePage = lazy(() => import('./pages/tools/dice/DiceGames').then(m => ({ default: m.DiceGamePage })))
const EscapeCollection = lazy(() => import('./pages/tools/EscapeCollection'))
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
const ClassNewspaper = lazy(() => import('./pages/printables/BirthdayNewspaper').then(m => ({ default: m.ClassNewspaper })))
const PhotoProps = lazy(() => import('./pages/printables/PhotoProps'))
const ColoringPages = lazy(() => import('./pages/printables/ColoringPages'))
const MandalaStudio = lazy(() => import('./pages/printables/MandalaStudio'))
const FineMotorStudio = lazy(() => import('./pages/printables/FineMotorStudio'))
const LetterFlashcards = lazy(() => import('./pages/printables/LetterFlashcards'))
const MathWorksheets = lazy(() => import('./pages/printables/MathWorksheets'))
const CalendarPrint = lazy(() => import('./pages/printables/CalendarPrint'))
const PurimMasks = lazy(() => import('./pages/printables/MasksAndCrowns').then(m => ({ default: m.PurimMasks })))
const BirthdayCrown = lazy(() => import('./pages/printables/MasksAndCrowns').then(m => ({ default: m.BirthdayCrown })))
const ClockWorksheets = lazy(() => import('./pages/printables/MathVisualSheets').then(m => ({ default: m.ClockWorksheets })))
const FractionWorksheets = lazy(() => import('./pages/printables/MathVisualSheets').then(m => ({ default: m.FractionWorksheets })))
const WritingPaper = lazy(() => import('./pages/printables/WritingPaper'))
const MemoryGame = lazy(() => import('./pages/printables/PaperGames').then(m => ({ default: m.MemoryGame })))
const Dominoes = lazy(() => import('./pages/printables/PaperGames').then(m => ({ default: m.Dominoes })))
const FortuneTeller = lazy(() => import('./pages/printables/PaperGames').then(m => ({ default: m.FortuneTeller })))
const GiftBox = lazy(() => import('./pages/printables/PaperGames').then(m => ({ default: m.GiftBox })))
const MusicHub = lazy(() => import('./music/MusicPages').then(m => ({ default: m.MusicHub })))
const PianoPage = lazy(() => import('./music/MusicPages').then(m => ({ default: m.PianoPage })))
const SongsIndex = lazy(() => import('./music/MusicPages').then(m => ({ default: m.SongsIndex })))
const SongPage = lazy(() => import('./music/MusicPages').then(m => ({ default: m.SongPage })))
const ReadNotes = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.ReadNotes })))
const GuitarChords = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.GuitarChords })))
const GuitarChord = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.GuitarChord })))
const Concepts = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.Concepts })))
const Styles = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.Styles })))
const LearnHub = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.LearnHub })))
const Dictation = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.Dictation })))
const ReadingIndex = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.ReadingIndex })))
const ReadingPage = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.ReadingPage })))
const TimesTables = lazy(() => import('./learn/LearnDrills').then(m => ({ default: m.TimesTables })))
const Flashcards = lazy(() => import('./learn/LearnDrills').then(m => ({ default: m.Flashcards })))
const FamilyHub = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.FamilyHub })))
const WhatToDo = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.WhatToDo })))
const MorningRoutine = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.MorningRoutine })))
const BedtimeStory = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.BedtimeStory })))
const CarGames = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.CarGames })))
const MoveChallenge = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.MoveChallenge })))
const PocketMoney = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.PocketMoney })))
const DiscoverHub = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.DiscoverHub })))
const IsraelMapPage = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.IsraelMapPage })))
const CapitalsPage = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.CapitalsPage })))
const SolarSystem = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.SolarSystem })))
const HumanBody = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.HumanBody })))
const FoodHub = lazy(() => import('./family/FoodPages').then(m => ({ default: m.FoodHub })))
const SchoolLunch = lazy(() => import('./family/FoodPages').then(m => ({ default: m.SchoolLunch })))
const LunchPlanner = lazy(() => import('./family/FoodPages').then(m => ({ default: m.LunchPlanner })))
const KidsRecipes = lazy(() => import('./family/FoodPages').then(m => ({ default: m.KidsRecipes })))
const KidsRecipe = lazy(() => import('./family/FoodPages').then(m => ({ default: m.KidsRecipe })))
const KitchenScience = lazy(() => import('./family/FoodPages').then(m => ({ default: m.KitchenScience })))
const Experiment = lazy(() => import('./family/FoodPages').then(m => ({ default: m.Experiment })))
const LunchboxNotes = lazy(() => import('./family/FoodPages').then(m => ({ default: m.LunchboxNotes })))
const AllergySigns = lazy(() => import('./family/AllergySigns'))
const HomeChart = lazy(() => import('./pages/printables/HomeCharts'))
const HomeChartsHub = lazy(() => import('./pages/printables/HomeCharts').then(m => ({ default: m.HomeChartsHub })))
const LettersHub = lazy(() => import('./pages/letters/LettersHub'))
const LetterPage = lazy(() => import('./pages/letters/LetterPage'))
const LettersGamePage = lazy(() => import('./pages/letters/LettersGamePage'))
const WordPairsPage = lazy(() => import('./pages/words/WordPairsPage'))
const BoardGamesHub = lazy(() => import('./pages/boardgames/BoardGamesHub'))
const BoardGamePage = lazy(() => import('./pages/boardgames/BoardGamePage'))
const OnlineGamesHub = lazy(() => import('./pages/arcade/OnlineGamesHub'))
const DailyChallenge = lazy(() => import('./pages/arcade/DailyChallenge'))
const MarathonPage = lazy(() => import('./pages/arcade/MarathonPage'))
const OnlineGamePage = lazy(() => import('./pages/arcade/OnlineGamePage'))
const ToolsIndex = lazy(() => import('./pages/tools/ToolsIndex'))
const Riddles = lazy(() => import('./pages/tools/Riddles'))
const TriviaQuiz = lazy(() => import('./pages/tools/TriviaQuiz'))
const BugaTown = lazy(() => import('./pages/tools/BugaTown'))
const EscapeRooms = lazy(() => import('./pages/tools/EscapeRooms'))
const Dice = lazy(() => import('./pages/tools/Dice'))
const RubiksCube = lazy(() => import('./pages/tools/RubiksCube'))
const HolidaysHub = lazy(() => import('./pages/holidays/HolidaysHub'))
const HanukkahHub = lazy(() => import('./pages/holidays/HanukkahHub'))
const Sevivon = lazy(() => import('./pages/holidays/Sevivon'))
const HolidayRoute = lazy(() => import('./pages/holidays/HolidayRoute'))
const TuBishvatHub = lazy(() => import('./pages/holidays/TuBishvatHub'))
const SevenSpecies = lazy(() => import('./pages/holidays/SevenSpecies'))
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
const CrosswordMaker = lazy(() => import('./pages/tools/PuzzleStudio'))
const BringList = lazy(() => import('./pages/tools/BringList'))
const QuizHome = lazy(() => import('./pages/quiz/QuizHome'))
const QuizManage = lazy(() => import('./pages/quiz/QuizManage'))
const QuizTake = lazy(() => import('./pages/quiz/QuizTake'))
const EmojiStudio = lazy(() => import('./pages/tools/EmojiStudio'))
const BirthdayFamous = lazy(() => import('./pages/tools/BirthdayFamous'))
const ExperimentMaker = lazy(() => import('./pages/tools/ExperimentMaker'))
const ClassOnePrep = lazy(() => import('./pages/ClassOnePrep'))
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
const OwnerActivityReport = lazy(() => import('./pages/OwnerActivityReport'))
const SuppliersIndex = lazy(() => import('./pages/suppliers/SuppliersIndex'))
const SupplierPage = lazy(() => import('./pages/suppliers/SupplierPage'))
const SupplierAccount = lazy(() => import('./pages/suppliers/SupplierAccount'))
const AdminSuppliers = lazy(() => import('./pages/suppliers/AdminSuppliers'))
const OwnerLogin = lazy(() => import('./pages/OwnerLogin'))

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
          <PageErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/birthday" element={<HubPage type="birthday" />} />
              <Route path="/classroom" element={<HubPage type="classroom" />} />
              <Route path="/classroom/first-grade" element={<ClassOnePrep />} />
              <Route path="/classroom/quiz" element={<QuizHome />} />
              <Route path="/classroom/quiz/:code" element={<QuizManage />} />
              <Route path="/q/:code" element={<QuizTake />} />
              <Route path="/create" element={<HubPage type="create" />} />
              <Route path="/games" element={<GamesIndex />} />
              <Route path="/games/all" element={<Navigate to="/games" replace />} />
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
              <Route path="/search" element={<Search />} />
              <Route path="/time-tunnel" element={<MaHayom />} />
              <Route path="/time-tunnel/:day" element={<MaHayom />} />
              <Route path="/ma-hayom" element={<MaHayom />} />
              <Route path="/ma-hayom/:day" element={<MaHayom />} />
              <Route path="/ideas" element={<IdeasHub />} />
              <Route path="/ideas/age/:age" element={<AgePage />} />
              <Route path="/ideas/themes/:slug" element={<ThemePage />} />
              <Route path="/ideas/themes" element={<Navigate to="/ideas" replace />} />
              <Route path="/ideas/:slug" element={<IdeaArticlePage />} />
              <Route path="/ideas/*" element={<NotFound />} />
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
              <Route path="/printables/activity/:type/:theme" element={<ActivityWorksheet key="themed" />} />
              <Route path="/printables/birthday-checklist" element={<BirthdayChecklist />} />
              <Route path="/printables/mandalas" element={<MandalaStudio />} />
              <Route path="/printables/fine-motor" element={<FineMotorStudio />} />
              <Route path="/printables/letter-flashcards" element={<LetterFlashcards />} />
              <Route path="/printables/math-worksheets" element={<MathWorksheets key="hub" preset="hub" />} />
              <Route path="/printables/math-worksheets/up-to-10" element={<MathWorksheets key="10" preset="10" />} />
              <Route path="/printables/math-worksheets/up-to-20" element={<MathWorksheets key="20" preset="20" />} />
              <Route path="/printables/math-worksheets/:slug" element={<MathWorksheets key="slug" />} />
              <Route path="/printables/math-paths" element={<MathWorksheets key="paths" preset="paths" />} />
              <Route path="/letters" element={<LettersHub />} />
              <Route path="/letters/game" element={<LettersGamePage key="he" lang="he" />} />
              <Route path="/letters/:slug" element={<LetterPage />} />
              <Route path="/animals" element={<AnimalsHub />} />
              <Route path="/animals/:slug" element={<AnimalPage />} />
              <Route path="/riddles/topics" element={<RiddlesHub />} />
              <Route path="/riddles/:slug" element={<RiddlePage />} />
              <Route path="/jokes/topics" element={<JokesHub />} />
              <Route path="/jokes/:slug" element={<JokePage />} />
              <Route path="/treasure-hunt/ready" element={<HuntsHub />} />
              <Route path="/treasure-hunt/:slug" element={<HuntPage />} />
              <Route path="/english" element={<EnglishHub />} />
              <Route path="/english/:topic" element={<EnglishTopic />} />
              <Route path="/languages" element={<LanguagesHub />} />
              <Route path="/languages/:lang" element={<LanguageHome />} />
              <Route path="/languages/:lang/quiz" element={<LanguageQuiz />} />
              <Route path="/languages/:lang/:topic" element={<LanguageTopic />} />
              <Route path="/abc" element={<AbcHub />} />
              <Route path="/abc/:letter" element={<AbcLetterPage />} />
              <Route path="/abc/game" element={<LettersGamePage key="en" lang="en" />} />
              <Route path="/words/opposites" element={<WordPairsPage key="o" setId="opposites" />} />
              <Route path="/words/synonyms" element={<WordPairsPage key="s" setId="synonyms" />} />
              <Route path="/words" element={<Navigate to="/words/opposites" replace />} />
              <Route path="/board-games" element={<BoardGamesHub />} />
              <Route path="/board-games/:slug" element={<BoardGamePage />} />
              <Route path="/online-games" element={<OnlineGamesHub />} />
              <Route path="/online-games/today" element={<DailyChallenge />} />
              <Route path="/online-games/marathon" element={<MarathonPage />} />
              <Route path="/online-games/:slug" element={<OnlineGamePage />} />
              <Route path="/printables/roots-project" element={<RootsProject />} />
              <Route path="/printables/birthday-newspaper" element={<BirthdayNewspaper />} />
              <Route path="/printables/class-newspaper" element={<ClassNewspaper />} />
              <Route path="/printables/photo-props" element={<PhotoProps />} />
              <Route path="/printables/coloring" element={<ColoringPages />} />
              <Route path="/printables/dice-template" element={<DiceTemplate />} />
              <Route path="/printables/calendar-2027" element={<CalendarPrint key="2027" preset="calendar-2027" />} />
              <Route path="/printables/calendar-5787" element={<CalendarPrint key="5787" preset="school-year-5787" />} />
              <Route path="/printables/home-charts" element={<HomeChartsHub />} />
              <Route path="/printables/chore-chart" element={<HomeChart key="chore-chart" preset="chore-chart" />} />
              <Route path="/printables/reward-chart" element={<HomeChart key="reward-chart" preset="reward-chart" />} />
              <Route path="/printables/toothbrushing-chart" element={<HomeChart key="toothbrushing-chart" preset="toothbrushing-chart" />} />
              <Route path="/printables/potty-chart" element={<HomeChart key="potty-chart" preset="potty-chart" />} />
              <Route path="/printables/class-schedule" element={<HomeChart key="class-schedule" preset="class-schedule" />} />
              <Route path="/printables/purim-masks" element={<PurimMasks />} />
              <Route path="/printables/birthday-crown" element={<BirthdayCrown />} />
              <Route path="/printables/clock-worksheets" element={<ClockWorksheets />} />
              <Route path="/printables/fractions-worksheets" element={<FractionWorksheets />} />
              <Route path="/printables/lined-paper" element={<WritingPaper key="lined-paper" kind="lined-paper" />} />
              <Route path="/printables/grid-paper" element={<WritingPaper key="grid-paper" kind="grid-paper" />} />
              <Route path="/printables/graph-paper" element={<WritingPaper key="graph-paper" kind="graph-paper" />} />
              <Route path="/printables/dot-paper" element={<WritingPaper key="dot-paper" kind="dot-paper" />} />
              <Route path="/printables/english-lines" element={<WritingPaper key="english-lines" kind="english-lines" />} />
              <Route path="/printables/music-paper" element={<WritingPaper key="music-paper" kind="music-paper" />} />
              <Route path="/printables/memory-game" element={<MemoryGame />} />
              <Route path="/printables/dominoes" element={<Dominoes />} />
              <Route path="/printables/fortune-teller" element={<FortuneTeller />} />
              <Route path="/printables/gift-box" element={<GiftBox />} />
              <Route path="/music" element={<MusicHub />} />
              <Route path="/music/piano" element={<PianoPage />} />
              <Route path="/music/songs" element={<SongsIndex />} />
              <Route path="/music/songs/:slug" element={<SongPage />} />
              <Route path="/music/read-notes" element={<ReadNotes />} />
              <Route path="/music/guitar-chords" element={<GuitarChords />} />
              <Route path="/music/guitar-chords/:chord" element={<GuitarChord />} />
              <Route path="/music/concepts" element={<Concepts />} />
              <Route path="/music/styles" element={<Styles />} />
              <Route path="/learn" element={<LearnHub />} />
              <Route path="/learn/dictation" element={<Dictation />} />
              <Route path="/learn/reading" element={<ReadingIndex />} />
              <Route path="/learn/reading/:slug" element={<ReadingPage />} />
              <Route path="/learn/times-tables" element={<TimesTables />} />
              <Route path="/learn/flashcards" element={<Flashcards />} />
              <Route path="/family" element={<FamilyHub />} />
              <Route path="/family/what-to-do" element={<WhatToDo />} />
              <Route path="/family/morning-routine" element={<MorningRoutine />} />
              <Route path="/family/bedtime-story" element={<BedtimeStory />} />
              <Route path="/family/car-games" element={<CarGames />} />
              <Route path="/family/move" element={<MoveChallenge />} />
              <Route path="/family/pocket-money" element={<PocketMoney />} />
              <Route path="/discover" element={<DiscoverHub />} />
              <Route path="/discover/israel-map" element={<IsraelMapPage />} />
              <Route path="/discover/capitals" element={<CapitalsPage />} />
              <Route path="/discover/solar-system" element={<SolarSystem />} />
              <Route path="/discover/human-body" element={<HumanBody />} />
              <Route path="/food" element={<FoodHub />} />
              <Route path="/food/school-lunch" element={<SchoolLunch />} />
              <Route path="/food/lunch-planner" element={<LunchPlanner />} />
              <Route path="/food/kids-recipes" element={<KidsRecipes />} />
              <Route path="/food/kids-recipes/:slug" element={<KidsRecipe />} />
              <Route path="/food/kitchen-science" element={<KitchenScience />} />
              <Route path="/food/kitchen-science/:slug" element={<Experiment />} />
              <Route path="/printables/lunchbox-notes" element={<LunchboxNotes />} />
              <Route path="/printables/allergy-signs" element={<AllergySigns />} />
              <Route path="/printables/:slug" element={<PrintableCategory />} />
              <Route path="/tools" element={<ToolsIndex />} />
              <Route path="/tools/birthday-famous" element={<BirthdayFamous />} />
              <Route path="/tools/experiment-maker" element={<ExperimentMaker />} />
              <Route path="/tools/riddles" element={<Riddles />} />
              <Route path="/riddles" element={<Riddles />} />
              <Route path="/games/riddles" element={<Riddles />} />
              <Route path="/tools/trivia-quiz" element={<TriviaQuiz />} />
              <Route path="/trivia" element={<TriviaQuiz />} />
              <Route path="/trivia/topics" element={<TriviaTopicsHub />} />
              <Route path="/trivia/:slug" element={<TriviaTopic />} />
              <Route path="/birthday-greetings" element={<GreetingsHub />} />
              <Route path="/greetings/:slug" element={<GreetingPage />} />
              <Route path="/questions" element={<QuestionsHub />} />
              <Route path="/questions/:slug" element={<QuestionsPage />} />
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
              <Route path="/tools/escape-rooms/topic/:slug" element={<EscapeCollection />} />
              <Route path="/tools/escape-rooms/:roomId" element={<EscapeRooms />} />
              <Route path="/escape-rooms" element={<EscapeRooms />} />
              <Route path="/escape-room" element={<EscapeRooms />} />
              <Route path="/tools/escape-room" element={<EscapeRooms />} />
              <Route path="/games/escape-room" element={<EscapeRooms />} />
              <Route path="/games/escape-rooms" element={<EscapeRooms />} />
              <Route path="/tools/dice" element={<Dice />} />
              <Route path="/tools/dice/dnd" element={<DndDice />} />
              <Route path="/tools/dice/:preset" element={<DicePresetPage />} />
              <Route path="/tools/random-number" element={<RandomNumber />} />
              <Route path="/dice-games" element={<DiceGamesIndex />} />
              <Route path="/dice-games/:slug" element={<DiceGamePage />} />
              <Route path="/rubiks-cube" element={<RubiksCube />} />
              <Route path="/holidays" element={<HolidaysHub />} />
              <Route path="/holidays/hanukkah" element={<HanukkahHub />} />
              <Route path="/holidays/hanukkah/sevivon" element={<Sevivon />} />
              <Route path="/holidays/hanukkah/quiz" element={<HolidayRoute key="hanukkah-quiz" slug="hanukkah" kind="quiz" />} />
              <Route path="/holidays/hanukkah/coloring" element={<HolidayRoute key="hanukkah-coloring" slug="hanukkah" kind="coloring" />} />
              <Route path="/holidays/hanukkah/worksheets" element={<HolidayRoute key="hanukkah-worksheets" slug="hanukkah" kind="worksheets" />} />
              <Route path="/holidays/hanukkah/what-to-do" element={<HolidayRoute key="hanukkah-what-to-do" slug="hanukkah" kind="what-to-do" />} />
              <Route path="/holidays/tu-bishvat" element={<TuBishvatHub />} />
              <Route path="/holidays/tu-bishvat/seven-species" element={<SevenSpecies />} />
              <Route path="/holidays/tu-bishvat/quiz" element={<HolidayRoute key="tu-bishvat-quiz" slug="tu-bishvat" kind="quiz" />} />
              <Route path="/holidays/tu-bishvat/coloring" element={<HolidayRoute key="tu-bishvat-coloring" slug="tu-bishvat" kind="coloring" />} />
              <Route path="/holidays/tu-bishvat/worksheets" element={<HolidayRoute key="tu-bishvat-worksheets" slug="tu-bishvat" kind="worksheets" />} />
              <Route path="/holidays/tu-bishvat/what-to-do" element={<HolidayRoute key="tu-bishvat-what-to-do" slug="tu-bishvat" kind="what-to-do" />} />
              <Route path="/tu-bishvat" element={<Navigate to="/holidays/tu-bishvat" replace />} />
              <Route path="/holidays/:slug" element={<HolidayRoute />} />
              <Route path="/holidays/:slug/:kind" element={<HolidayRoute />} />
              <Route path="/purim" element={<Navigate to="/holidays/purim" replace />} />
              <Route path="/sevivon" element={<Navigate to="/holidays/hanukkah/sevivon" replace />} />
              <Route path="/hanukkah" element={<Navigate to="/holidays/hanukkah" replace />} />
              <Route path="/tools/rubiks-cube" element={<RubiksCube />} />
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
              <Route path="/tools/emoji-studio" element={<EmojiStudio />} />
              <Route path="/bring-list" element={<BringList />} />
              <Route path="/l/:code" element={<BringList />} />
              <Route path="/crossword" element={<CrosswordMaker />} />
              <Route path="/tools/word-search" element={<WordSearchMaker />} />
              <Route path="/word-search" element={<WordSearchMaker />} />
              <Route path="/word-search-maker" element={<WordSearchMaker />} />
              <Route path="/tools/scavenger-hunt-maker" element={<ScavengerHuntMaker />} />
              <Route path="/tools/scavenger-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/scavenger-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/treasure-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/gifts" element={<GiftsIndex />} />
              <Route path="/gifts/boy" element={<Navigate to="/gifts" replace />} />
              <Route path="/gifts/girl" element={<Navigate to="/gifts" replace />} />
              <Route path="/gifts/under-50" element={<GiftsIndex />} />
              <Route path="/gifts/under-100" element={<GiftsIndex />} />
              <Route path="/gifts/:age" element={<AgeGiftPage />} />
              <Route path="/guides" element={<GuidesIndex />} />
              <Route path="/guides/:slug" element={<GuidePage />} />
              <Route path="/compare/home-vs-venue" element={<IdeasHub />} />
              <Route path="/compare/entertainer-vs-diy" element={<IdeasHub />} />
              <Route path="/songs/birthday-songs" element={<IdeasHub />} />
              <Route path="/birthday-songs" element={<IdeasHub />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/game-of-the-day" element={<GamesIndex />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/faq/:topic" element={<FaqTopic />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin/login" element={<OwnerLogin><OwnerActivityReport /></OwnerLogin>} />
              <Route path="/admin/activity" element={<OwnerLogin><OwnerActivityReport /></OwnerLogin>} />
              <Route path="/admin/suppliers" element={<OwnerLogin><AdminSuppliers /></OwnerLogin>} />
              {import.meta.env.VITE_TEST_OWNER_CLAIMS && <Route path="/__test/admin-suppliers" element={<AdminSuppliers />} />}
              <Route path="/suppliers" element={<SuppliersIndex />} />
              <Route path="/suppliers/me" element={<SupplierAccount />} />
              <Route path="/suppliers/:slug" element={<SupplierPage />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </PageErrorBoundary>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  )
}
