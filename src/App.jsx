const EnglishHolidays = lazy(() => import('./en/EnglishHolidays'))
const EnglishHanukkah = lazy(() => import('./en/EnglishHanukkah'))
const EnglishHolidayColoring = lazy(() => import('./en/EnglishHolidays').then(m => ({default: m.EnglishHolidayColoring})))
const EnglishAlphabet = lazy(() => import('./en/EnglishAlphabet'))
import { BrowserRouter, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { NavigationHistoryProvider } from './components/layout/NavigationHistory'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import PageErrorBoundary from './components/layout/PageErrorBoundary'
const Home = lazy(() => import('./pages/Home'))
const HubPage = lazy(() => import('./pages/HubPage'))
const BugaPedia = lazy(() => import('./pages/classroom/BugaPedia'))
const ClassRoster = lazy(() => import('./pages/classroom/ClassRoster'))
const ClassElections = lazy(() => import('./pages/tools/ClassElections'))
import { lazy, Suspense } from 'react'

const IsraeliIcons = lazy(() => import('./emoji/IsraeliIcons'))
const EmojiLibrary = lazy(() => import('./emoji/EmojiPages'))
const EmojiSituation = lazy(() => import('./emoji/EmojiPages').then(m => ({ default: m.EmojiSituation })))
const BmiCalculator = lazy(() => import('./pages/tools/LearningCalculators').then(m => ({ default: m.BmiCalculator })))
const FractionCalculator = lazy(() => import('./pages/tools/LearningCalculators').then(m => ({ default: m.FractionCalculator })))
const GradeAverage = lazy(() => import('./pages/tools/LearningCalculators').then(m => ({ default: m.GradeAverage })))
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
const ThemesHub = lazy(() => import('./pages/ideas/ThemesHub'))
const HoursCalculator = lazy(() => import('./pages/tools/TimeTextTools').then(m => ({ default: m.HoursCalculator })))
const DateCalculator = lazy(() => import('./pages/tools/TimeTextTools').then(m => ({ default: m.DateCalculator })))
const WorldClock = lazy(() => import('./pages/tools/TimeTextTools').then(m => ({ default: m.WorldClock })))
const WordCount = lazy(() => import('./pages/tools/TimeTextTools').then(m => ({ default: m.WordCount })))
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
const SensoryCommunicationCards = lazy(() => import('./pages/printables/SensoryCommunicationCards'))
const MathWorksheets = lazy(() => import('./pages/printables/MathWorksheets'))
const ReadingWorksheetPacks = lazy(() => import('./pages/printables/ReadingWorksheetPacks'))
const BookmarkMaker = lazy(() => import('./pages/printables/BookmarkMaker'))
const KindergartenMemoryBook = lazy(() => import('./pages/printables/KindergartenMemoryBook'))
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
const TicTacToeBoards = lazy(() => import('./pages/printables/TicTacToeBoards'))
const NameColoring = lazy(() => import('./pages/printables/NameColoring'))
const WinterPrintables = lazy(() => import('./pages/printables/WinterPrintables'))
const MusicHub = lazy(() => import('./music/MusicPages').then(m => ({ default: m.MusicHub })))
const Metronome = lazy(() => import('./music/PracticeTools').then(m => ({ default: m.Metronome })))
const Tuner = lazy(() => import('./music/PracticeTools').then(m => ({ default: m.Tuner })))
const NameLabels = lazy(() => import('./pages/printables/NameLabels').then(m => ({ default: m.NameLabels })))
const PianoPage = lazy(() => import('./music/MusicPages').then(m => ({ default: m.PianoPage })))
const SongsIndex = lazy(() => import('./music/MusicPages').then(m => ({ default: m.SongsIndex })))
const SongPage = lazy(() => import('./music/MusicPages').then(m => ({ default: m.SongPage })))
const ReadNotes = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.ReadNotes })))
const GuitarChords = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.GuitarChords })))
const GuitarChord = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.GuitarChord })))
const Concepts = lazy(() => import('./music/MusicLearn').then(m => ({ default: m.Concepts })))
const Styles = lazy(() => import('./music/styles/StylesPage'))
const TypingCourse = lazy(() => import('./typing/TypingPages').then(m => ({ default: m.TypingCourse })))
const TypingTest = lazy(() => import('./typing/TypingPages').then(m => ({ default: m.TypingTest })))
const TypingEnglish = lazy(() => import('./typing/TypingPages').then(m => ({ default: m.TypingEnglish })))
const TypingGame = lazy(() => import('./typing/TypingPages').then(m => ({ default: m.TypingGame })))
const LearnHub = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.LearnHub })))
const Dictation = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.Dictation })))
const DictionaryHub = lazy(() => import('./pages/dictionary/Dictionary').then(m => ({ default: m.DictionaryHub })))
const DictionaryLetter = lazy(() => import('./pages/dictionary/Dictionary').then(m => ({ default: m.DictionaryLetter })))
const ClockChange = lazy(() => import('./pages/learn/ClockChange'))
const UnseenHub = lazy(() => import('./pages/unseen/Unseen').then(m => ({ default: m.UnseenHub })))
const UnseenRoute = lazy(() => import('./pages/unseen/Unseen').then(m => ({ default: m.UnseenRoute })))
const ReadingIndex = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.ReadingIndex })))
const ReadingPage = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.ReadingPage })))
const ReadingGrade = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.ReadingGrade })))
const TimesTables = lazy(() => import('./learn/LearnDrills').then(m => ({ default: m.TimesTables })))
const Flashcards = lazy(() => import('./learn/LearnDrills').then(m => ({ default: m.Flashcards })))
const GiftedHub = lazy(() => import('./learn/gifted/GiftedPages').then(m => ({ default: m.GiftedHub })))
const GiftedType = lazy(() => import('./learn/gifted/GiftedPages').then(m => ({ default: m.GiftedType })))
const GiftedGrade = lazy(() => import('./learn/gifted/GiftedPages').then(m => ({ default: m.GiftedGrade })))
const GiftedPractice = lazy(() => import('./learn/gifted/ThinkingPages').then(m => ({ default: m.GiftedPractice })))
const GiftedSimulation = lazy(() => import('./learn/gifted/ThinkingPages').then(m => ({ default: m.GiftedSimulation })))
const PsychometricKids = lazy(() => import('./learn/gifted/ThinkingPages').then(m => ({ default: m.PsychometricKids })))
const CardGamesHub = lazy(() => import('./pages/content/SearchGapPages').then(m => ({ default: m.CardGamesHub })))
const CardGamePage = lazy(() => import('./pages/content/SearchGapPages').then(m => ({ default: m.CardGamePage })))
const NameThemePage = lazy(() => import('./pages/content/SearchGapPages').then(m => ({ default: m.NameThemePage })))
const MitzvahInvitation = lazy(() => import('./pages/content/SearchGapPages').then(m => ({ default: m.MitzvahInvitation })))
const DictationEnglish = lazy(() => import('./learn/LearnPages').then(m => ({ default: m.DictationEnglish })))
const NikudKeyboard = lazy(() => import('./pages/tools/NikudKeyboard'))
const Nakdan = lazy(() => import('./pages/tools/Nakdan'))
const HebrewCalendarPage = lazy(() => import('./pages/tools/HebrewCalendar'))
const OmerCount = lazy(() => import('./pages/tools/OmerCount'))
const LandingGuide = lazy(() => import('./pages/content/LandingGuide'))
const StarOfTheWeek = lazy(() => import('./pages/printables/StarOfTheWeek'))
const QuadraticSolver = lazy(() => import('./pages/tools/QuadraticSolver'))
const MemoryLetters = lazy(() => import('./pages/games/MemoryThemed').then(m => ({ default: m.MemoryLetters })))
const MemorySeniors = lazy(() => import('./pages/games/MemoryThemed').then(m => ({ default: m.MemorySeniors })))
const AdultsHub = lazy(() => import('./adults/AdultPages').then(m => ({ default: m.AdultsHub })))
const CrosswordList = lazy(() => import('./adults/AdultPages').then(m => ({ default: m.CrosswordList })))
const CrosswordPage = lazy(() => import('./adults/AdultPages').then(m => ({ default: m.CrosswordPage })))
const MandalaMaker = lazy(() => import('./adults/AdultPages').then(m => ({ default: m.MandalaMaker })))
const Grandparents = lazy(() => import('./adults/AdultPages').then(m => ({ default: m.Grandparents })))
const GrandparentsInterview = lazy(() => import('./adults/AdultPages').then(m => ({ default: m.GrandparentsInterview })))
const TeachTheRobot = lazy(() => import('./learn/ai/AiTools').then(m => ({ default: m.TeachTheRobot })))
const PromptLab = lazy(() => import('./learn/ai/AiTools').then(m => ({ default: m.PromptLab })))
const SpotTheMistake = lazy(() => import('./learn/ai/AiTools').then(m => ({ default: m.SpotTheMistake })))
const SubjectHub = lazy(() => import('./learn/subjects/SubjectPages').then(m => ({ default: m.SubjectHub })))
const SubjectTopic = lazy(() => import('./learn/subjects/SubjectPages').then(m => ({ default: m.SubjectTopic })))
const SubjectExam = lazy(() => import('./learn/subjects/SubjectPages').then(m => ({ default: m.SubjectExam })))
const ConceptIndex = lazy(() => import('./learn/subjects/SubjectPages').then(m => ({ default: m.ConceptIndex })))
const ConceptPage = lazy(() => import('./learn/subjects/SubjectPages').then(m => ({ default: m.ConceptPage })))
const FamilyHub = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.FamilyHub })))
const KidsZone = lazy(() => import('./pages/kids/KidsZone'))
const WhatsNew = lazy(() => import('./pages/WhatsNew'))
const DaysUntilHub = lazy(() => import('./pages/calc/DaysUntil'))
const DaysUntilPage = lazy(() => import('./pages/calc/DaysUntil').then(m => ({ default: m.DaysUntilPage })))
const AgeCalculator = lazy(() => import('./pages/calc/AgeCalculator'))
const Gematria = lazy(() => import('./pages/calc/Gematria'))
const TimeTunnelMonth = lazy(() => import('./pages/TimeTunnelMonth'))
const EmbedsHub = lazy(() => import('./pages/embed/Embeds'))
const EmbedWidget = lazy(() => import('./pages/embed/Embeds').then(m => ({ default: m.EmbedWidget })))
const WhatToDo = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.WhatToDo })))
const MorningRoutine = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.MorningRoutine })))
const BedtimeStory = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.BedtimeStory })))
const SchoolHolidaysHub = lazy(() => import('./pages/schoolHolidays/SchoolHolidays').then(m => ({ default: m.SchoolHolidaysHub })))
const SchoolHolidayPage = lazy(() => import('./pages/schoolHolidays/SchoolHolidays').then(m => ({ default: m.SchoolHolidayPage })))
const TriviaWithAnswers = lazy(() => import('./pages/content/TriviaWithAnswers').then(m => ({ default: m.TriviaWithAnswers })))
const KereshJokes = lazy(() => import('./pages/content/KereshJokes').then(m => ({ default: m.KereshJokes })))
const MultiplicationTable = lazy(() => import('./learn/MultiplicationTable.jsx').then(m => ({ default: m.MultiplicationTable })))
const MultiplicationTable100 = lazy(() => import('./learn/MultiplicationTable.jsx').then(m => ({ default: m.MultiplicationTable100 })))
const MultiplicationTable1000 = lazy(() => import('./learn/MultiplicationTable.jsx').then(m => ({ default: m.MultiplicationTable1000 })))
const MultiplicationNumber = lazy(() => import('./learn/MultiplicationTable.jsx').then(m => ({ default: m.MultiplicationNumber })))
const ShabbatRecipes = lazy(() => import('./pages/recipes/Recipes').then(m => ({ default: m.ShabbatRecipes })))
const ShabbatRecipe = lazy(() => import('./pages/recipes/Recipes').then(m => ({ default: m.ShabbatRecipe })))
const PancakesHub = lazy(() => import('./pages/recipes/Recipes').then(m => ({ default: m.PancakesHub })))
const BraidingGuide = lazy(() => import('./pages/recipes/Recipes').then(m => ({ default: m.BraidingGuide })))
const CakesHub = lazy(() => import('./pages/cakes/Cakes').then(m => ({ default: m.CakesHub })))
const CakePage = lazy(() => import('./pages/cakes/Cakes').then(m => ({ default: m.CakePage })))
const BabyNamesHub = lazy(() => import('./pages/babyNames/BabyNames').then(m => ({ default: m.BabyNamesHub })))
const BabyNamesList = lazy(() => import('./pages/babyNames/BabyNames').then(m => ({ default: m.BabyNamesList })))
const BabyNamesLetter = lazy(() => import('./pages/babyNames/BabyNames').then(m => ({ default: m.BabyNamesLetter })))
const BabyNamePage = lazy(() => import('./pages/babyNames/BabyNames').then(m => ({ default: m.BabyNamePage })))
const MathHub = lazy(() => import('./math/MathPages').then(m => ({ default: m.MathHub })))
const MathGrade = lazy(() => import('./math/MathPages').then(m => ({ default: m.MathGrade })))
const MathTopic = lazy(() => import('./math/MathPages').then(m => ({ default: m.MathTopic })))
const MathTest = lazy(() => import('./math/MathPages').then(m => ({ default: m.MathTest })))
const SupplierCategory = lazy(() => import('./pages/suppliers/SupplierCategory'))
const HebrewBirthday = lazy(() => import('./pages/tools/HebrewBirthday'))
const BatMitzvahIdeas = lazy(() => import('./pages/ideas/BatMitzvahIdeas'))
const BarMitzvahHub = lazy(() => import('./pages/barMitzvah/BarMitzvahHub'))
const MitzvahDate = lazy(() => import('./pages/barMitzvah/MitzvahDate'))
const MitzvahChecklist = lazy(() => import('./pages/barMitzvah/MitzvahChecklist'))
const MitzvahSpeech = lazy(() => import('./pages/barMitzvah/MitzvahSpeech'))
const MitzvahQuiz = lazy(() => import('./pages/barMitzvah/MitzvahQuiz'))
const MitzvahSouvenir = lazy(() => import('./pages/barMitzvah/MitzvahSouvenir'))
const ToddlersHub = lazy(() => import('./pages/toddlers/Toddlers').then(m => ({ default: m.ToddlersHub })))
const ToddlerPage = lazy(() => import('./pages/toddlers/Toddlers').then(m => ({ default: m.ToddlerPage })))
const ShabbatGames = lazy(() => import('./pages/games/ShabbatGames'))
const TeacherGiftPage = lazy(() => import('./pages/school/SchoolSeason').then(m => ({ default: m.TeacherGiftPage })))
const GananetGiftPage = lazy(() => import('./pages/school/SchoolSeason').then(m => ({ default: m.GananetGiftPage })))
const KindergartenGraduation = lazy(() => import('./pages/school/SchoolSeason').then(m => ({ default: m.KindergartenGraduation })))
const SixthGradeGraduation = lazy(() => import('./pages/school/SchoolSeason').then(m => ({ default: m.SixthGradeGraduation })))
const SchoolSuppliesList = lazy(() => import('./pages/school/SchoolSeason').then(m => ({ default: m.SchoolSuppliesList })))
const GanBirthdayGuide = lazy(() => import('./pages/school/SchoolSeason').then(m => ({ default: m.GanBirthdayGuide })))
const HanukkahSongs = lazy(() => import('./pages/holidays/HanukkahSongs'))
const StoriesHub = lazy(() => import('./pages/stories/Stories').then(m => ({ default: m.StoriesHub })))
const StoryPage = lazy(() => import('./pages/stories/Stories').then(m => ({ default: m.StoryPage })))
const CarGames = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.CarGames })))
const MoveChallenge = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.MoveChallenge })))
const PocketMoney = lazy(() => import('./family/FamilyTools').then(m => ({ default: m.PocketMoney })))
const DiscoverHub = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.DiscoverHub })))
const IsraelMapPage = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.IsraelMapPage })))
const CapitalsPage = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.CapitalsPage })))
const SolarSystem = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.SolarSystem })))
const HumanBody = lazy(() => import('./discover/DiscoverPages').then(m => ({ default: m.HumanBody })))
const SignsHub = lazy(() => import('./signs/SignsPages').then(m => ({ default: m.SignsHub })))
const SignsGame = lazy(() => import('./signs/SignsPages').then(m => ({ default: m.SignsGame })))
const SignsTheory = lazy(() => import('./signs/SignsPages').then(m => ({ default: m.SignsTheory })))
const SignPage = lazy(() => import('./signs/SignsPages').then(m => ({ default: m.SignPage })))
const FlagsHub = lazy(() => import('./flags/FlagsPages').then(m => ({ default: m.FlagsHub })))
const FlagsQuiz = lazy(() => import('./flags/FlagsPages').then(m => ({ default: m.FlagsQuiz })))
const FlagsContinent = lazy(() => import('./flags/FlagsPages').then(m => ({ default: m.FlagsContinent })))
const FlagsPrint = lazy(() => import('./flags/FlagsPages').then(m => ({ default: m.FlagsPrint })))
const CountryFlagPage = lazy(() => import('./flags/CountryFlagPage'))
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
const HebrewLetterSong = lazy(() => import('./pages/letters/LetterSongs').then(m => ({ default: m.HebrewLetterSong })))
const AbcSong = lazy(() => import('./pages/letters/LetterSongs').then(m => ({ default: m.AbcSong })))
const CursiveLetters = lazy(() => import('./pages/letters/CursiveLetters'))
const OpeningSounds = lazy(() => import('./pages/letters/LetterPractice').then(m => ({ default: m.OpeningSounds })))
const NikudKamatzPatach = lazy(() => import('./pages/letters/LetterPractice').then(m => ({ default: m.NikudKamatzPatach })))
const FinalLetters = lazy(() => import('./pages/letters/LetterPractice').then(m => ({ default: m.FinalLetters })))
const LetterStrip = lazy(() => import('./pages/printables/LetterStrip'))
const WordPairsPage = lazy(() => import('./pages/words/WordPairsPage'))
const BoardGamesHub = lazy(() => import('./pages/boardgames/BoardGamesHub'))
const BoardGamePage = lazy(() => import('./pages/boardgames/BoardGamePage'))
const ChessPage = lazy(() => import('./pages/chess/ChessPage'))
const OrigamiHub = lazy(() => import('./pages/origami/OrigamiPages').then(m => ({ default: m.OrigamiHub })))
const OrigamiModelPage = lazy(() => import('./pages/origami/OrigamiPages').then(m => ({ default: m.OrigamiModelPage })))
const ChessPuzzlesPage = lazy(() => import('./pages/chess/ChessPuzzlesPage'))
const ChessHowToPage = lazy(() => import('./pages/chess/ChessHowToPage'))
const ChessPrintablePage = lazy(() => import('./pages/chess/ChessPrintablePage'))
const OnlineGamesHub = lazy(() => import('./pages/arcade/OnlineGamesHub'))
const BrainGamesPage = lazy(() => import('./pages/arcade/BrainGamesPage'))
const DailyChallenge = lazy(() => import('./pages/arcade/DailyChallenge'))
const MarathonPage = lazy(() => import('./pages/arcade/MarathonPage'))
const OnlineGamePage = lazy(() => import('./pages/arcade/OnlineGamePage'))
const SudokuHub = lazy(() => import('./pages/sudoku/SudokuPages').then(m => ({ default: m.SudokuHub })))
const SudokuLevelPage = lazy(() => import('./pages/sudoku/SudokuPages').then(m => ({ default: m.SudokuLevelPage })))
const SudokuKids = lazy(() => import('./pages/sudoku/SudokuPages').then(m => ({ default: m.SudokuKids })))
const SudokuDaily = lazy(() => import('./pages/sudoku/SudokuPages').then(m => ({ default: m.SudokuDaily })))
const SudokuPrint = lazy(() => import('./pages/sudoku/SudokuPages').then(m => ({ default: m.SudokuPrint })))
const SudokuSolver = lazy(() => import('./pages/sudoku/SudokuPages').then(m => ({ default: m.SudokuSolver })))
const ToolsIndex = lazy(() => import('./pages/tools/ToolsIndex'))
const Riddles = lazy(() => import('./pages/tools/Riddles'))
const TriviaQuiz = lazy(() => import('./pages/tools/TriviaQuiz'))
const TrickQuestions = lazy(() => import('./pages/games/TrickQuestions'))
const BugaTown = lazy(() => import('./pages/tools/BugaTown'))
const EscapeRooms = lazy(() => import('./pages/tools/EscapeRooms'))
const Dice = lazy(() => import('./pages/tools/Dice'))
const RubiksCube = lazy(() => import('./pages/tools/RubiksCube'))
const ShabbatParents = lazy(() => import('./pages/holidays/ShabbatParents'))
const HolidaysHub = lazy(() => import('./pages/holidays/HolidaysHub'))
const HanukkahHub = lazy(() => import('./pages/holidays/HanukkahHub'))
const Sevivon = lazy(() => import('./pages/holidays/Sevivon'))
const HolidayRoute = lazy(() => import('./pages/holidays/HolidayRoute'))
const TuBishvatHub = lazy(() => import('./pages/holidays/TuBishvatHub'))
const SevenSpecies = lazy(() => import('./pages/holidays/SevenSpecies'))
const HolidayBlessings = lazy(() => import('./pages/holidays/HolidayBlessings'))
const CoinFlip = lazy(() => import('./pages/tools/CoinFlip'))
const CountdownTimer = lazy(() => import('./pages/tools/CountdownTimer'))
const Stopwatch = lazy(() => import('./pages/tools/Stopwatch'))
const QrCodeMaker = lazy(() => import('./pages/tools/QrCodeMaker'))
const PercentCalculator = lazy(() => import('./pages/tools/PercentCalculator'))
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
const Rsvp = lazy(() => import('./pages/tools/group/Rsvp'))
const RsvpTypePage = lazy(() => import('./pages/tools/group/Rsvp').then(m => ({ default: m.RsvpTypePage })))
const VaadHub = lazy(() => import('./pages/tools/group/VaadHub'))
const SharedSpaces = lazy(() => import('./pages/tools/group/SharedSpaces'))
const SecretFriend = lazy(() => import('./pages/tools/group/SecretFriend'))
const ThankYouWall = lazy(() => import('./pages/tools/group/ThankYouWall'))
const TeacherHome = lazy(() => import('./pages/homework/TeacherHomework').then(m => ({ default: m.TeacherHome })))
const HomeworkBuilderPage = lazy(() => import('./pages/homework/TeacherHomework').then(m => ({ default: m.HomeworkBuilderPage })))
const HomeworkResultsPage = lazy(() => import('./pages/homework/TeacherHomework').then(m => ({ default: m.HomeworkResultsPage })))
const StudentHomework = lazy(() => import('./pages/homework/StudentHomework'))
const QuizHome = lazy(() => import('./pages/quiz/QuizHome'))
const QuizManage = lazy(() => import('./pages/quiz/QuizManage'))
const QuizTake = lazy(() => import('./pages/quiz/QuizTake'))
const LiveQuizHome = lazy(() => import('./pages/live/LiveQuizHome'))
const LiveQuizHost = lazy(() => import('./pages/live/LiveQuizHost'))
const LiveQuizPlay = lazy(() => import('./pages/live/LiveQuizPlay'))
const EmojiStudio = lazy(() => import('./pages/tools/EmojiStudio'))
const BirthdayFamous = lazy(() => import('./pages/tools/BirthdayFamous'))
const ExperimentMaker = lazy(() => import('./pages/tools/ExperimentMaker'))
const ClassOnePrep = lazy(() => import('./pages/ClassOnePrep'))
const ScavengerHuntMaker = lazy(() => import('./pages/tools/ScavengerHuntMaker'))
const QrTreasureHunt = lazy(() => import('./pages/tools/QrTreasureHunt'))
const GiftsIndex = lazy(() => import('./pages/gifts/GiftsIndex'))
const AgeGiftPage = lazy(() => import('./pages/gifts/AgeGiftPage'))
const GuidesIndex = lazy(() => import('./pages/guides/GuidesIndex'))
const GuidePage = lazy(() => import('./pages/guides/GuidePage'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ParashaHub = lazy(() => import('./pages/parasha/ParashaPages').then(m => ({ default: m.ParashaHub })))
const ShabbatActivitiesHub = lazy(() => import('./pages/holidays/ShabbatActivities').then(m => ({ default: m.ShabbatActivitiesHub })))
const ShabbatActivityPage = lazy(() => import('./pages/holidays/ShabbatActivities').then(m => ({ default: m.ShabbatActivityPage })))
const ShabbatPackPage = lazy(() => import('./pages/holidays/ShabbatActivities').then(m => ({ default: m.ShabbatPackPage })))
const ShabbatTimesHub = lazy(() => import('./pages/holidays/ShabbatTimes').then(m => ({ default: m.ShabbatTimesHub })))
const ShabbatCityPage = lazy(() => import('./pages/holidays/ShabbatTimes').then(m => ({ default: m.ShabbatCityPage })))
const ParashaPage = lazy(() => import('./pages/parasha/ParashaPages').then(m => ({ default: m.ParashaPage })))
const MazesPage = lazy(() => import('./pages/printables/MazesPage'))
const LogicHub = lazy(() => import('./pages/logicPuzzles/LogicPuzzlePages').then(m => ({ default: m.LogicHub })))
const LogicLevelPage = lazy(() => import('./pages/logicPuzzles/LogicPuzzlePages').then(m => ({ default: m.LogicLevelPage })))
const LogicPrintPage = lazy(() => import('./pages/logicPuzzles/LogicPuzzlePages').then(m => ({ default: m.LogicPrintPage })))
const LogicSolutionsPage = lazy(() => import('./pages/logicPuzzles/LogicPuzzlePages').then(m => ({ default: m.LogicSolutionsPage })))
const ColoringSubject = lazy(() => import('./pages/printables/ColoringSubject'))
const ColoringDrawing = lazy(() => import('./pages/printables/ColoringDrawing'))
const ColorByNumberHub = lazy(() => import('./pages/printables/ColorByNumber'))
const ColorByNumberPicture = lazy(() => import('./pages/printables/ColorByNumber').then(m => ({ default: m.ColorByNumberPicture })))
const ColorByAnswerHub = lazy(() => import('./pages/printables/ColorByCode').then(m => ({ default: m.ColorByAnswerHub })))
const ColorByAnswerKind = lazy(() => import('./pages/printables/ColorByCode').then(m => ({ default: m.ColorByAnswerKind })))
const ColorByLetter = lazy(() => import('./pages/printables/ColorByCode').then(m => ({ default: m.ColorByLetter })))
const ColorByLetterEnglish = lazy(() => import('./pages/printables/ColorByCode').then(m => ({ default: m.ColorByLetterEnglish })))
const OwnerActivityReport = lazy(() => import('./pages/OwnerActivityReport'))
const MailPreferences = lazy(() => import('./pages/MailPreferences'))
const OwnerMini = lazy(() => import('./pages/OwnerActivityReport').then(m => ({ default: m.OwnerMini })))
const SuppliersIndex = lazy(() => import('./pages/suppliers/SuppliersIndex'))
const SupplierPage = lazy(() => import('./pages/suppliers/SupplierPage'))
const SupplierAccount = lazy(() => import('./pages/suppliers/SupplierAccount'))
const AdminSuppliers = lazy(() => import('./pages/suppliers/AdminSuppliers'))
const OwnerLogin = lazy(() => import('./pages/OwnerLogin'))

const EnglishColoring = lazy(() => import('./en/EnglishActivities').then(m => ({ default: m.EnglishColoring })))
const EnglishPrintables = lazy(() => import('./en/EnglishActivities').then(m => ({ default: m.EnglishPrintables })))
const EnglishGames = lazy(() => import('./en/EnglishActivities').then(m => ({ default: m.EnglishGames })))
const EnglishBirthday = lazy(() => import('./en/EnglishActivities').then(m => ({ default: m.EnglishBirthday })))
const EnglishHome = lazy(() => import('./en/EnglishHome'))
const EnglishLiveHome = lazy(() => import('./en/EnglishLiveHome'))
const EnglishLiveHost = lazy(() => import('./en/EnglishLiveHost'))
const EnglishLivePlay = lazy(() => import('./en/EnglishLivePlay'))
const EnglishNotFound = lazy(() => import('./en/EnglishLayout').then(m => ({ default: m.EnglishNotFound })))

function Loading() {
  const { pathname } = useLocation()
  if (pathname === '/en' || pathname.startsWith('/en/')) return <p className="en-loading" role="status">Loading your activity…</p>
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
        <NavigationHistoryProvider><Layout>
          <PageErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/en" element={<EnglishHome />} />
              <Route path="/en/coloring-pages" element={<EnglishColoring />} />
              <Route path="/en/coloring-pages/:subject" element={<EnglishColoring />} />
              <Route path="/en/printables" element={<EnglishPrintables />} />
              <Route path="/en/games" element={<EnglishGames />} />
              <Route path="/en/games/memory" element={<EnglishGames memory />} />
              <Route path="/en/birthday" element={<EnglishBirthday />} />
              <Route path="/en/hebrew-alphabet" element={<EnglishAlphabet />} />
              <Route path="/en/hebrew-alphabet/:slug" element={<EnglishAlphabet />} />
              <Route path="/en/jewish-holidays" element={<EnglishHolidays />} />
              <Route path="/en/jewish-holidays/:slug" element={<EnglishHolidays />} />
              <Route path="/en/jewish-holidays/hanukkah/:guide" element={<EnglishHanukkah />} />
              <Route path="/en/coloring/:holiday/:n" element={<EnglishHolidayColoring />} />
              <Route path="/en/live" element={<EnglishLiveHome />} />
              <Route path="/en/live/:code/host" element={<EnglishLiveHost />} />
              <Route path="/en/play/:code" element={<EnglishLivePlay />} />
              <Route path="/en/*" element={<EnglishNotFound />} />
              <Route path="/birthday" element={<HubPage type="birthday" />} />
              <Route path="/classroom" element={<HubPage type="classroom" />} />
              <Route path="/classroom/subjects" element={<BugaPedia />} />
              <Route path="/bugapedia" element={<BugaPedia />} />
              <Route path="/classroom/roster" element={<ClassRoster />} />
              <Route path="/tools/class-elections" element={<ClassElections />} />
              <Route path="/classroom/first-grade" element={<ClassOnePrep />} />
              <Route path="/teachers" element={<TeacherHome />} />
              <Route path="/teachers/homework/new" element={<HomeworkBuilderPage />} />
              <Route path="/teachers/homework/:code/edit" element={<HomeworkBuilderPage />} />
              <Route path="/teachers/homework/:code" element={<HomeworkResultsPage />} />
              <Route path="/hw/:code" element={<StudentHomework />} />
              <Route path="/classroom/quiz" element={<QuizHome />} />
              <Route path="/classroom/quiz/:code" element={<QuizManage />} />
              <Route path="/q/:code" element={<QuizTake />} />
              <Route path="/live" element={<LiveQuizHome />} />
              <Route path="/live/:code/host" element={<LiveQuizHost />} />
              <Route path="/play/:code" element={<LiveQuizPlay />} />
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
              <Route path="/games/shabbat" element={<ShabbatGames />} />
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/time-tunnel" element={<MaHayom />} />
              <Route path="/time-tunnel/:day" element={<MaHayom />} />
              <Route path="/time-tunnel/month/:month" element={<TimeTunnelMonth />} />
              <Route path="/ma-hayom" element={<MaHayom />} />
              <Route path="/ma-hayom/:day" element={<MaHayom />} />
              <Route path="/ideas" element={<IdeasHub />} />
              <Route path="/ideas/age/:age" element={<AgePage />} />
              <Route path="/ideas/themes/:slug" element={<ThemePage />} />
              <Route path="/ideas/themes" element={<ThemesHub />} />
              <Route path="/ideas/bat-mitzvah-ideas" element={<BatMitzvahIdeas />} />
              <Route path="/bar-mitzvah" element={<BarMitzvahHub />} />
              <Route path="/bat-mitzvah" element={<Navigate to="/bar-mitzvah" replace />} />
              <Route path="/bar-mitzvah/date" element={<MitzvahDate />} />
              <Route path="/bar-mitzvah/checklist" element={<MitzvahChecklist />} />
              <Route path="/bar-mitzvah/speech" element={<MitzvahSpeech />} />
              <Route path="/bar-mitzvah/quiz" element={<MitzvahQuiz />} />
              <Route path="/bar-mitzvah/souvenir" element={<MitzvahSouvenir />} />
              <Route path="/ideas/kindergarten-graduation" element={<KindergartenGraduation />} />
              <Route path="/ideas/6th-grade-graduation" element={<SixthGradeGraduation />} />
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
              <Route path="/invitation/bat-mitzvah" element={<MitzvahInvitation key="bat" occasion="bat-mitzvah" />} />
              <Route path="/invitation/bar-mitzvah" element={<MitzvahInvitation key="bar" occasion="bar-mitzvah" />} />
              <Route path="/invitations" element={<Invitation />} />
              <Route path="/birthday-invitation" element={<Invitation />} />
              <Route path="/tools/invitation-generator" element={<Invitation />} />
              <Route path="/tools/invitations" element={<Invitation />} />
              <Route path="/printables" element={<PrintablesIndex />} />
              <Route path="/printables/activity/:type" element={<ActivityWorksheet />} />
              <Route path="/printables/activity/:type/:theme" element={<ActivityWorksheet key="themed" />} />
              <Route path="/printables/birthday-checklist" element={<BirthdayChecklist />} />
              <Route path="/printables/mandalas" element={<MandalaStudio />} />
              <Route path="/printables/bookmarks" element={<BookmarkMaker />} />
              <Route path="/printables/kindergarten-memory-book" element={<KindergartenMemoryBook />} />
              <Route path="/printables/fine-motor" element={<FineMotorStudio />} />
              <Route path="/printables/letter-flashcards" element={<LetterFlashcards />} />
              <Route path="/printables/sensory-communication-cards" element={<SensoryCommunicationCards />} />
              <Route path="/printables/letter-strip" element={<LetterStrip />} />
              <Route path="/printables/kindergarten-worksheets" element={<ReadingWorksheetPacks packId="kindergarten" />} />
              <Route path="/printables/hebrew-worksheets-grade-1" element={<ReadingWorksheetPacks packId="grade1" />} />
              <Route path="/printables/opening-ending-sounds" element={<ReadingWorksheetPacks packId="sounds" />} />
              <Route path="/printables/rhymes-syllables" element={<ReadingWorksheetPacks packId="rhymes" />} />
              <Route path="/printables/reading-writing-words" element={<ReadingWorksheetPacks packId="reading" />} />
              <Route path="/printables/hebrew-worksheets-grades-2-3" element={<ReadingWorksheetPacks packId="grades23" />} />
              <Route path="/printables/math-worksheets" element={<MathWorksheets key="hub" preset="hub" />} />
              <Route path="/printables/math-worksheets/up-to-10" element={<MathWorksheets key="10" preset="10" />} />
              <Route path="/printables/math-worksheets/up-to-20" element={<MathWorksheets key="20" preset="20" />} />
              <Route path="/printables/math-worksheets/:slug" element={<MathWorksheets key="slug" />} />
              <Route path="/printables/math-paths" element={<MathWorksheets key="paths" preset="paths" />} />
              <Route path="/letters" element={<LettersHub />} />
              <Route path="/letters/game" element={<LettersGamePage key="he" lang="he" />} />
              <Route path="/letters/song" element={<HebrewLetterSong />} />
              <Route path="/letters/cursive" element={<CursiveLetters />} />
              <Route path="/letters/sounds" element={<OpeningSounds />} />
              <Route path="/letters/nikud" element={<NikudKamatzPatach />} />
              <Route path="/letters/final" element={<FinalLetters />} />
              <Route path="/letters/:slug" element={<LetterPage />} />
              <Route path="/animals" element={<AnimalsHub />} />
              <Route path="/animals/:slug" element={<AnimalPage />} />
              <Route path="/riddles/topics" element={<RiddlesHub />} />
              <Route path="/riddles/:slug" element={<RiddlePage />} />
              <Route path="/jokes/topics" element={<JokesHub />} />
              <Route path="/jokes/keresh" element={<KereshJokes />} />
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
              <Route path="/abc/song" element={<AbcSong />} />
              <Route path="/words/opposites" element={<WordPairsPage key="o" setId="opposites" />} />
              <Route path="/words/synonyms" element={<WordPairsPage key="s" setId="synonyms" />} />
              <Route path="/words" element={<Navigate to="/words/opposites" replace />} />
              <Route path="/board-games" element={<BoardGamesHub />} />
              <Route path="/board-games/:slug" element={<BoardGamePage />} />
              <Route path="/sudoku" element={<SudokuHub />} />
              <Route path="/sudoku/easy" element={<SudokuLevelPage key="easy" level="easy" />} />
              <Route path="/sudoku/medium" element={<SudokuLevelPage key="medium" level="medium" />} />
              <Route path="/sudoku/hard" element={<SudokuLevelPage key="hard" level="hard" />} />
              <Route path="/sudoku/very-hard" element={<SudokuLevelPage key="very-hard" level="very-hard" />} />
              <Route path="/sudoku/kids" element={<SudokuKids />} />
              <Route path="/sudoku/daily" element={<SudokuDaily />} />
              <Route path="/sudoku/print" element={<SudokuPrint />} />
              <Route path="/sudoku/solver" element={<SudokuSolver />} />
              <Route path="/origami" element={<OrigamiHub />} />
              <Route path="/origami/:slug" element={<OrigamiModelPage />} />
              <Route path="/chess" element={<ChessPage />} />
              <Route path="/chess/puzzles" element={<ChessPuzzlesPage />} />
              <Route path="/chess/how-to-play" element={<ChessHowToPage />} />
              <Route path="/chess/printable-board" element={<ChessPrintablePage />} />
              <Route path="/online-games" element={<OnlineGamesHub />} />
              <Route path="/brain-games" element={<BrainGamesPage />} />
              <Route path="/brain-games/matchsticks" element={<BrainGamesPage topic="matchsticks" />} />
              <Route path="/brain-games/river-crossing" element={<BrainGamesPage topic="river-crossing" />} />
              <Route path="/brain-games/lights-out" element={<BrainGamesPage topic="lights-out" />} />
              <Route path="/brain-games/logic" element={<BrainGamesPage topic="logic" />} />
              <Route path="/brain-games/kids" element={<BrainGamesPage topic="kids" />} />
              <Route path="/online-games/today" element={<DailyChallenge />} />
              <Route path="/online-games/marathon" element={<MarathonPage />} />
              <Route path="/online-games/:slug" element={<OnlineGamePage />} />
              <Route path="/printables/roots-project" element={<RootsProject />} />
              <Route path="/printables/birthday-newspaper" element={<BirthdayNewspaper />} />
              <Route path="/printables/class-newspaper" element={<ClassNewspaper />} />
              <Route path="/printables/photo-props" element={<PhotoProps />} />
              <Route path="/printables/coloring" element={<ColoringPages />} />
              <Route path="/printables/coloring/:subject" element={<ColoringSubject />} />
              <Route path="/printables/coloring/:subject/:n" element={<ColoringDrawing />} />
              <Route path="/printables/color-by-number" element={<ColorByNumberHub />} />
              <Route path="/printables/color-by-number/:slug" element={<ColorByNumberPicture />} />
              <Route path="/printables/color-by-answer" element={<ColorByAnswerHub />} />
              <Route path="/printables/color-by-answer/:op" element={<ColorByAnswerKind />} />
              <Route path="/printables/color-by-letter" element={<ColorByLetter key="he" />} />
              <Route path="/printables/color-by-letter/english" element={<ColorByLetterEnglish />} />
              <Route path="/printables/dice-template" element={<DiceTemplate />} />
              <Route path="/printables/calendar-2027" element={<CalendarPrint key="2027" preset="calendar-2027" />} />
              <Route path="/printables/calendar-5787" element={<CalendarPrint key="5787" preset="school-year-5787" />} />
              <Route path="/printables/home-charts" element={<HomeChartsHub />} />
              <Route path="/printables/chore-chart" element={<HomeChart key="chore-chart" preset="chore-chart" />} />
              <Route path="/printables/star-of-the-week" element={<StarOfTheWeek />} />
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
              <Route path="/printables/tic-tac-toe" element={<TicTacToeBoards />} />
              <Route path="/printables/name-coloring" element={<NameColoring />} />
              <Route path="/printables/winter" element={<WinterPrintables />} />
              <Route path="/printables/fortune-teller" element={<FortuneTeller />} />
              <Route path="/printables/gift-box" element={<GiftBox />} />
              <Route path="/music" element={<MusicHub />} />
              <Route path="/music/metronome" element={<Metronome />} />
              <Route path="/music/tuner" element={<Tuner />} />
              <Route path="/printables/name-labels" element={<NameLabels />} />
              <Route path="/music/piano" element={<PianoPage />} />
              <Route path="/music/songs" element={<SongsIndex />} />
              <Route path="/music/songs/:slug" element={<SongPage />} />
              <Route path="/music/read-notes" element={<ReadNotes />} />
              <Route path="/music/guitar-chords" element={<GuitarChords />} />
              <Route path="/music/guitar-chords/:chord" element={<GuitarChord />} />
              <Route path="/music/concepts" element={<Concepts />} />
              <Route path="/music/styles" element={<Styles />} />
              <Route path="/typing" element={<TypingCourse />} />
              <Route path="/typing/test" element={<TypingTest />} />
              <Route path="/typing/english" element={<TypingEnglish />} />
              <Route path="/typing/game" element={<TypingGame />} />
              <Route path="/learn" element={<LearnHub />} />
              <Route path="/learn/dictation" element={<Dictation />} />
              <Route path="/learn/dictation/english" element={<DictationEnglish />} />
              <Route path="/dictionary" element={<DictionaryHub />} />
              <Route path="/dictionary/english/:letter" element={<DictionaryLetter />} />
              <Route path="/learn/clock-change" element={<ClockChange />} />
              <Route path="/unseen" element={<UnseenHub />} />
              <Route path="/unseen/:lang" element={<UnseenRoute />} />
              <Route path="/unseen/:lang/:x" element={<UnseenRoute />} />
              <Route path="/learn/reading" element={<ReadingIndex />} />
              <Route path="/learn/reading/grade-2" element={<ReadingGrade key="g2" grade={2} />} />
              <Route path="/learn/reading/grade-3" element={<ReadingGrade key="g3" grade={3} />} />
              <Route path="/learn/reading/grade-4" element={<ReadingGrade key="g4" grade={4} />} />
              <Route path="/learn/reading/grade-5" element={<ReadingGrade key="g5" grade={5} />} />
              <Route path="/learn/reading/grade-1" element={<ReadingGrade key="g1" grade={1} />} />
              <Route path="/learn/reading/grade-6" element={<ReadingGrade key="g6" grade={6} />} />
              <Route path="/learn/reading/grade-7" element={<ReadingGrade key="g7" grade={7} />} />
              <Route path="/learn/reading/grade-8" element={<ReadingGrade key="g8" grade={8} />} />
              <Route path="/learn/reading/:slug" element={<ReadingPage />} />
              <Route path="/learn/times-tables" element={<TimesTables />} />
              <Route path="/learn/multiplication-table" element={<MultiplicationTable />} />
              <Route path="/learn/multiplication-table/100" element={<MultiplicationTable100 />} />
              <Route path="/learn/multiplication-table/1000" element={<MultiplicationTable1000 />} />
              <Route path="/learn/multiplication-table/of/:n" element={<MultiplicationNumber />} />
              <Route path="/learn/flashcards" element={<Flashcards />} />
              <Route path="/learn/gifted-test" element={<GiftedHub />} />
              <Route path="/learn/gifted-test/grade-2" element={<GiftedGrade key="grade-2" slug="grade-2" />} />
              <Route path="/learn/gifted-test/grade-3" element={<GiftedGrade key="grade-3" slug="grade-3" />} />
              <Route path="/learn/gifted-test/grade-6" element={<GiftedGrade key="grade-6" slug="grade-6" />} />
              <Route path="/learn/gifted-test/stage-a" element={<GiftedGrade key="stage-a" slug="stage-a" />} />
              <Route path="/learn/gifted-test/stage-b" element={<GiftedGrade key="stage-b" slug="stage-b" />} />
              <Route path="/learn/gifted-test/practice" element={<GiftedPractice />} />
              <Route path="/learn/gifted-test/simulation" element={<GiftedSimulation />} />
              <Route path="/learn/psychometric-kids" element={<PsychometricKids />} />
              <Route path="/learn/gifted-test/:type" element={<GiftedType />} />
              <Route path="/learn/tanakh" element={<SubjectHub key="tanakh" subjectKey="tanakh" />} />
              <Route path="/learn/tanakh/concepts" element={<ConceptIndex key="tanakh-c" subjectKey="tanakh" />} />
              <Route path="/learn/tanakh/concepts/:term" element={<ConceptPage key="tanakh-ct" subjectKey="tanakh" />} />
              <Route path="/learn/tanakh/:slug/exam" element={<SubjectExam key="tanakh-e" subjectKey="tanakh" />} />
              <Route path="/learn/tanakh/:slug" element={<SubjectTopic key="tanakh" subjectKey="tanakh" />} />
              <Route path="/learn/lashon" element={<SubjectHub key="lashon" subjectKey="lashon" />} />
              <Route path="/learn/lashon/concepts" element={<ConceptIndex key="lashon-c" subjectKey="lashon" />} />
              <Route path="/learn/lashon/concepts/:term" element={<ConceptPage key="lashon-ct" subjectKey="lashon" />} />
              <Route path="/learn/lashon/:slug/exam" element={<SubjectExam key="lashon-e" subjectKey="lashon" />} />
              <Route path="/learn/lashon/:slug" element={<SubjectTopic key="lashon" subjectKey="lashon" />} />
              <Route path="/learn/civics" element={<SubjectHub key="civics" subjectKey="civics" />} />
              <Route path="/learn/civics/concepts" element={<ConceptIndex key="civics-c" subjectKey="civics" />} />
              <Route path="/learn/civics/concepts/:term" element={<ConceptPage key="civics-ct" subjectKey="civics" />} />
              <Route path="/learn/civics/:slug/exam" element={<SubjectExam key="civics-e" subjectKey="civics" />} />
              <Route path="/learn/civics/:slug" element={<SubjectTopic key="civics" subjectKey="civics" />} />
              <Route path="/learn/science" element={<SubjectHub key="science" subjectKey="science" />} />
              <Route path="/learn/science/concepts" element={<ConceptIndex key="science-c" subjectKey="science" />} />
              <Route path="/learn/science/concepts/:term" element={<ConceptPage key="science-ct" subjectKey="science" />} />
              <Route path="/learn/science/:slug/exam" element={<SubjectExam key="science-e" subjectKey="science" />} />
              <Route path="/learn/science/:slug" element={<SubjectTopic key="science" subjectKey="science" />} />
              <Route path="/learn/history" element={<SubjectHub key="history" subjectKey="history" />} />
              <Route path="/learn/history/concepts" element={<ConceptIndex key="history-c" subjectKey="history" />} />
              <Route path="/learn/history/concepts/:term" element={<ConceptPage key="history-ct" subjectKey="history" />} />
              <Route path="/learn/history/:slug/exam" element={<SubjectExam key="history-e" subjectKey="history" />} />
              <Route path="/learn/history/:slug" element={<SubjectTopic key="history" subjectKey="history" />} />
              <Route path="/adults" element={<AdultsHub />} />
              <Route path="/adults/crosswords" element={<CrosswordList />} />
              <Route path="/adults/crosswords/:id" element={<CrosswordPage />} />
              <Route path="/adults/mandalas" element={<MandalaMaker />} />
              <Route path="/adults/memory" element={<MemorySeniors />} />
              <Route path="/online-games/memory-letters" element={<MemoryLetters />} />
              <Route path="/adults/grandparents" element={<Grandparents />} />
              <Route path="/adults/grandparents/interview" element={<GrandparentsInterview />} />
              <Route path="/learn/ai" element={<SubjectHub key="ai" subjectKey="ai" />} />
              <Route path="/learn/ai/teach-the-robot" element={<TeachTheRobot />} />
              <Route path="/learn/ai/prompt-lab" element={<PromptLab />} />
              <Route path="/learn/ai/spot-the-mistake" element={<SpotTheMistake />} />
              <Route path="/learn/ai/concepts" element={<ConceptIndex key="ai-c" subjectKey="ai" />} />
              <Route path="/learn/ai/concepts/:term" element={<ConceptPage key="ai-ct" subjectKey="ai" />} />
              <Route path="/learn/ai/:slug/exam" element={<SubjectExam key="ai-e" subjectKey="ai" />} />
              <Route path="/learn/ai/:slug" element={<SubjectTopic key="ai" subjectKey="ai" />} />
              <Route path="/learn/geography" element={<SubjectHub key="geography" subjectKey="geography" />} />
              <Route path="/learn/geography/concepts" element={<ConceptIndex key="geography-c" subjectKey="geography" />} />
              <Route path="/learn/geography/concepts/:term" element={<ConceptPage key="geography-ct" subjectKey="geography" />} />
              <Route path="/learn/geography/:slug/exam" element={<SubjectExam key="geography-e" subjectKey="geography" />} />
              <Route path="/learn/geography/:slug" element={<SubjectTopic key="geography" subjectKey="geography" />} />
              <Route path="/family" element={<FamilyHub />} />
              <Route path="/kids" element={<KidsZone />} />
              <Route path="/new" element={<WhatsNew />} />
              <Route path="/days-until" element={<DaysUntilHub />} />
              <Route path="/days-until/:slug" element={<DaysUntilPage />} />
              <Route path="/tools/bmi" element={<BmiCalculator />} />
              <Route path="/tools/fraction-calculator" element={<FractionCalculator />} />
              <Route path="/tools/grade-average" element={<GradeAverage />} />
              <Route path="/tools/age-calculator" element={<AgeCalculator />} />
              <Route path="/tools/gematria" element={<Gematria />} />
              <Route path="/embed" element={<EmbedsHub />} />
              <Route path="/embed/:tool" element={<EmbedWidget />} />
              <Route path="/embed/:tool/:slug" element={<EmbedWidget />} />
              <Route path="/family/what-to-do" element={<WhatToDo />} />
              <Route path="/family/morning-routine" element={<MorningRoutine />} />
              <Route path="/family/bedtime-story" element={<BedtimeStory />} />
              <Route path="/math" element={<MathHub />} />
              <Route path="/math/tests/:gradeSlug" element={<MathTest />} />
              <Route path="/math/:gradeSlug" element={<MathGrade />} />
              <Route path="/math/:gradeSlug/:topicSlug" element={<MathTopic />} />
              <Route path="/recipes/shabbat" element={<ShabbatRecipes />} />
              <Route path="/recipes/shabbat/braiding" element={<BraidingGuide />} />
              <Route path="/recipes/shabbat/:slug" element={<ShabbatRecipe />} />
              <Route path="/food/pancakes" element={<PancakesHub />} />
              <Route path="/cakes" element={<CakesHub />} />
              <Route path="/cakes/:slug" element={<CakePage />} />
              <Route path="/baby-names" element={<BabyNamesHub />} />
              <Route path="/baby-names/girls" element={<BabyNamesList key="f" gender="f" />} />
              <Route path="/baby-names/boys" element={<BabyNamesList key="m" gender="m" />} />
              <Route path="/baby-names/unisex" element={<BabyNamesList key="u" gender="u" />} />
              <Route path="/baby-names/girls/letter/:letter" element={<BabyNamesLetter key="f" gender="f" />} />
              <Route path="/baby-names/boys/letter/:letter" element={<BabyNamesLetter key="m" gender="m" />} />
              <Route path="/baby-names/meaning/:theme" element={<NameThemePage />} />
              <Route path="/baby-names/name/:slug" element={<BabyNamePage />} />
              <Route path="/school-holidays" element={<SchoolHolidaysHub />} />
              <Route path="/school-holidays/:slug" element={<SchoolHolidayPage />} />
              <Route path="/tools/hebrew-birthday" element={<HebrewBirthday />} />
              <Route path="/toddlers" element={<ToddlersHub />} />
              <Route path="/toddlers/:slug" element={<ToddlerPage />} />
              <Route path="/stories" element={<StoriesHub />} />
              <Route path="/stories/:slug" element={<StoryPage />} />
              <Route path="/family/car-games" element={<CarGames />} />
              <Route path="/family/move" element={<MoveChallenge />} />
              <Route path="/family/pocket-money" element={<PocketMoney />} />
              <Route path="/discover" element={<DiscoverHub />} />
              <Route path="/discover/israel-map" element={<IsraelMapPage />} />
              <Route path="/discover/capitals" element={<CapitalsPage />} />
              <Route path="/discover/solar-system" element={<SolarSystem />} />
              <Route path="/discover/human-body" element={<HumanBody />} />
              <Route path="/emoji" element={<EmojiLibrary />} />
              <Route path="/emoji/israeli" element={<IsraeliIcons />} />
              <Route path="/emoji/for/:slug" element={<EmojiSituation />} />
              <Route path="/emoji/:category" element={<EmojiLibrary />} />
              <Route path="/signs" element={<SignsHub />} />
              <Route path="/signs/game" element={<SignsGame />} />
              <Route path="/signs/theory" element={<SignsTheory />} />
              <Route path="/signs/:number" element={<SignPage />} />
              <Route path="/flags" element={<FlagsHub />} />
              <Route path="/flags/quiz" element={<FlagsQuiz />} />
              <Route path="/flags/print" element={<FlagsPrint />} />
              <Route path="/flags/continents/:continent" element={<FlagsContinent />} />
              <Route path="/flags/:code" element={<CountryFlagPage />} />
              <Route path="/food" element={<FoodHub />} />
              <Route path="/food/school-lunch" element={<SchoolLunch />} />
              <Route path="/food/lunch-planner" element={<LunchPlanner />} />
              <Route path="/food/kids-recipes" element={<KidsRecipes />} />
              <Route path="/food/kids-recipes/:slug" element={<KidsRecipe />} />
              <Route path="/food/kitchen-science" element={<KitchenScience />} />
              <Route path="/food/kitchen-science/:slug" element={<Experiment />} />
              <Route path="/printables/lunchbox-notes" element={<LunchboxNotes />} />
              <Route path="/printables/allergy-signs" element={<AllergySigns />} />
              <Route path="/printables/mazes" element={<MazesPage />} />
              <Route path="/logic-puzzles" element={<LogicHub />} />
              <Route path="/logic-puzzles/kids" element={<LogicLevelPage key="kids" variant="kids" />} />
              <Route path="/logic-puzzles/easy" element={<LogicLevelPage key="easy" variant="easy" />} />
              <Route path="/logic-puzzles/hard" element={<LogicLevelPage key="hard" variant="hard" />} />
              <Route path="/logic-puzzles/print" element={<LogicPrintPage />} />
              <Route path="/logic-puzzles/solutions" element={<LogicSolutionsPage />} />
              <Route path="/printables/school-supplies-list" element={<SchoolSuppliesList />} />
              <Route path="/printables/:slug" element={<PrintableCategory />} />
              <Route path="/tools" element={<ToolsIndex />} />
              <Route path="/tools/birthday-famous" element={<BirthdayFamous />} />
              <Route path="/tools/experiment-maker" element={<ExperimentMaker />} />
              <Route path="/tools/riddles" element={<Riddles />} />
              <Route path="/riddles" element={<Riddles />} />
              <Route path="/games/riddles" element={<Riddles />} />
              <Route path="/tools/trivia-quiz" element={<TriviaQuiz />} />
              <Route path="/trivia" element={<TriviaQuiz />} />
              <Route path="/trick-questions" element={<TrickQuestions />} />
              <Route path="/trivia/topics" element={<TriviaTopicsHub />} />
              <Route path="/trivia/with-answers" element={<TriviaWithAnswers />} />
              <Route path="/trivia/with-answers/:section" element={<TriviaWithAnswers />} />
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
              <Route path="/holidays/shabbat-parents" element={<ShabbatParents />} />
              <Route path="/holidays/blessings" element={<HolidayBlessings />} />
              <Route path="/holidays/blessings/:slug" element={<HolidayBlessings />} />
              <Route path="/holidays/hanukkah" element={<HanukkahHub />} />
              <Route path="/holidays/hanukkah/sevivon" element={<Sevivon />} />
              <Route path="/holidays/hanukkah/songs" element={<HanukkahSongs />} />
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
              <Route path="/tools/hours-calculator" element={<HoursCalculator />} />
              <Route path="/tools/date-calculator" element={<DateCalculator />} />
              <Route path="/tools/world-clock" element={<WorldClock />} />
              <Route path="/tools/word-count" element={<WordCount />} />
              <Route path="/tools/countdown-timer" element={<CountdownTimer />} />
              <Route path="/tools/stopwatch" element={<Stopwatch />} />
              <Route path="/tools/qr-code" element={<QrCodeMaker />} />
              <Route path="/tools/percent-calculator" element={<PercentCalculator />} />
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
              <Route path="/tools/nikud-keyboard" element={<NikudKeyboard />} />
              <Route path="/tools/nakdan" element={<Nakdan />} />
              <Route path="/hebrew-calendar" element={<HebrewCalendarPage />} />
              <Route path="/omer" element={<OmerCount />} />
              <Route path="/movies-for-kids" element={<LandingGuide />} />
              <Route path="/crafts" element={<LandingGuide />} />
              <Route path="/learn/english/by-grade" element={<LandingGuide />} />
              <Route path="/family/baby-development" element={<LandingGuide />} />
              <Route path="/tools/quadratic-equation" element={<QuadraticSolver />} />
              <Route path="/hebrew-calendar/:year" element={<HebrewCalendarPage />} />
              <Route path="/card-games" element={<CardGamesHub />} />
              <Route path="/card-games/:slug" element={<CardGamePage />} />
              <Route path="/tools/bring-list" element={<BringList />} />
              <Route path="/tools/emoji-studio" element={<EmojiStudio />} />
              <Route path="/bring-list" element={<BringList />} />
              <Route path="/l/:code" element={<BringList />} />
              <Route path="/rsvp" element={<Rsvp />} />
              <Route path="/rsvp/:type" element={<RsvpTypePage />} />
              <Route path="/vaad" element={<VaadHub />} />
              <Route path="/meet" element={<SharedSpaces kind="meet" />} />
              <Route path="/parent-meetings" element={<SharedSpaces kind="parents" />} />
              <Route path="/family-help" element={<SharedSpaces kind="help" />} />
              <Route path="/party-album" element={<SharedSpaces kind="album" />} />
              <Route path="/t/:code" element={<SharedSpaces />} />
              <Route path="/r/:code" element={<Rsvp />} />
              <Route path="/secret-friend" element={<SecretFriend />} />
              <Route path="/g/:code" element={<SecretFriend />} />
              <Route path="/thank-you-wall" element={<ThankYouWall />} />
              <Route path="/w/:code" element={<ThankYouWall />} />
              <Route path="/crossword" element={<CrosswordMaker />} />
              <Route path="/tools/word-search" element={<WordSearchMaker />} />
              <Route path="/word-search" element={<WordSearchMaker />} />
              <Route path="/word-search-maker" element={<WordSearchMaker />} />
              <Route path="/tools/scavenger-hunt-maker" element={<ScavengerHuntMaker />} />
              <Route path="/tools/scavenger-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/scavenger-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/treasure-hunt" element={<ScavengerHuntMaker />} />
              <Route path="/treasure-hunt/qr" element={<QrTreasureHunt />} />
              <Route path="/treasure-hunt/qr/play" element={<QrTreasureHunt />} />
              <Route path="/gifts" element={<GiftsIndex />} />
              <Route path="/gifts/boy" element={<Navigate to="/gifts" replace />} />
              <Route path="/gifts/girl" element={<Navigate to="/gifts" replace />} />
              <Route path="/gifts/under-50" element={<GiftsIndex />} />
              <Route path="/gifts/under-100" element={<GiftsIndex />} />
              <Route path="/gifts/teacher-end-of-year" element={<TeacherGiftPage />} />
              <Route path="/gifts/gananet" element={<GananetGiftPage />} />
              <Route path="/gifts/:age" element={<AgeGiftPage />} />
              <Route path="/guides" element={<GuidesIndex />} />
              <Route path="/guides/birthday-in-kindergarten" element={<GanBirthdayGuide />} />
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
              <Route path="/admin/mini" element={<OwnerLogin><OwnerMini /></OwnerLogin>} />
              <Route path="/admin/suppliers" element={<OwnerLogin><AdminSuppliers /></OwnerLogin>} />
              {import.meta.env.VITE_TEST_OWNER_CLAIMS && <Route path="/__test/admin-suppliers" element={<AdminSuppliers />} />}
              <Route path="/suppliers" element={<SuppliersIndex />} />
              <Route path="/suppliers/me" element={<SupplierAccount />} />
              <Route path="/suppliers/category/:type" element={<SupplierCategory />} />
              <Route path="/suppliers/:slug" element={<SupplierPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/parasha" element={<ParashaHub />} />
              <Route path="/shabbat-activities" element={<ShabbatActivitiesHub />} />
              <Route path="/shabbat-activities/pack" element={<ShabbatPackPage />} />
              <Route path="/shabbat-activities/:slug" element={<ShabbatActivityPage />} />
              <Route path="/shabbat-times" element={<ShabbatTimesHub />} />
              <Route path="/mail-preferences" element={<MailPreferences />} />
              <Route path="/shabbat-times/:city" element={<ShabbatCityPage />} />
              <Route path="/parasha/:slug" element={<ParashaPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </PageErrorBoundary>
        </Layout></NavigationHistoryProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
