// Subject booklets by grade: the page copy lives in meta/<slug>.js, the pages in content/<slug>.js and the
// layout in subjectKit.jsx, so adding one is two data files and a line in each list below.
import mathGrade1 from './meta/math-grade-1.js'
import mathGrade4 from './meta/math-grade-4.js'
import mathGrade5 from './meta/math-grade-5.js'
import mathGrade6 from './meta/math-grade-6.js'
import mathGrade7 from './meta/math-grade-7.js'
import mathGrade8 from './meta/math-grade-8.js'
import mathGrade9 from './meta/math-grade-9.js'
import mathHighSchool from './meta/math-high-school.js'
import hebrewGrade1 from './meta/hebrew-grade-1.js'
import hebrewGrade2 from './meta/hebrew-grade-2.js'
import hebrewGrade3 from './meta/hebrew-grade-3.js'
import hebrewGrade4 from './meta/hebrew-grade-4.js'
import hebrewGrade5 from './meta/hebrew-grade-5.js'
import hebrewGrade6 from './meta/hebrew-grade-6.js'
import hebrewGrade7 from './meta/hebrew-grade-7.js'
import hebrewGrade8 from './meta/hebrew-grade-8.js'
import hebrewGrade9 from './meta/hebrew-grade-9.js'
import hebrewHighSchool from './meta/hebrew-high-school.js'
import readingGrade3 from './meta/reading-grade-3.js'
import scienceGrade1 from './meta/science-grade-1.js'
import scienceGrade2 from './meta/science-grade-2.js'
import scienceGrade3 from './meta/science-grade-3.js'
import scienceGrade4 from './meta/science-grade-4.js'
import scienceGrade5 from './meta/science-grade-5.js'
import scienceGrade6 from './meta/science-grade-6.js'
import scienceGrade7 from './meta/science-grade-7.js'
import scienceGrade8 from './meta/science-grade-8.js'
import scienceGrade9 from './meta/science-grade-9.js'
import tanakhGrade2 from './meta/tanakh-grade-2.js'
import tanakhGrade3 from './meta/tanakh-grade-3.js'
import tanakhGrade4 from './meta/tanakh-grade-4.js'
import tanakhGrade5 from './meta/tanakh-grade-5.js'
import tanakhGrade6 from './meta/tanakh-grade-6.js'
import tanakhGrade7 from './meta/tanakh-grade-7.js'
import tanakhGrade8 from './meta/tanakh-grade-8.js'
import tanakhGrade9 from './meta/tanakh-grade-9.js'
import tanakhHighSchool from './meta/tanakh-high-school.js'
import moledetGrade2 from './meta/moledet-grade-2.js'
import moledetGrade3 from './meta/moledet-grade-3.js'
import moledetGrade4 from './meta/moledet-grade-4.js'
import geographyGrade5 from './meta/geography-grade-5.js'
import geographyGrade6 from './meta/geography-grade-6.js'
import geographyGrade7 from './meta/geography-grade-7.js'
import geographyGrade8 from './meta/geography-grade-8.js'
import historyGrade6 from './meta/history-grade-6.js'
import historyGrade7 from './meta/history-grade-7.js'
import historyGrade8 from './meta/history-grade-8.js'
import historyGrade9 from './meta/history-grade-9.js'
import historyHighSchool from './meta/history-high-school.js'
import civicsHighSchool from './meta/civics-high-school.js'
import biologyHighSchool from './meta/biology-high-school.js'
import literatureHighSchool from './meta/literature-high-school.js'
import bagrutBiology5Units from './meta/bagrut-biology-5-units.js'
import bagrutChemistry5Units from './meta/bagrut-chemistry-5-units.js'
import bagrutCivics2Units from './meta/bagrut-civics-2-units.js'
import bagrutHistory2Units from './meta/bagrut-history-2-units.js'
import bagrutLashon2Units from './meta/bagrut-lashon-2-units.js'
import bagrutLiterature2Units from './meta/bagrut-literature-2-units.js'
import bagrutMath3Units from './meta/bagrut-math-3-units.js'
import bagrutMath4Units from './meta/bagrut-math-4-units.js'
import bagrutMath5UnitsA from './meta/bagrut-math-5-units-a.js'
import bagrutMath5UnitsB from './meta/bagrut-math-5-units-b.js'
import bagrutPhysics5Units from './meta/bagrut-physics-5-units.js'
import bagrutTanakh2Units from './meta/bagrut-tanakh-2-units.js'

const subject = content => () => Promise.all([import('./subjectKit.jsx'), content()]).then(([kit, c]) => ({ default: kit.bookletFor(c.default) }))

export const SUBJECT_BOOKLETS = [
  { ...mathGrade1, load: subject(() => import('./content/math-grade-1.js')) },
  { ...mathGrade4, load: subject(() => import('./content/math-grade-4.js')) },
  { ...mathGrade5, load: subject(() => import('./content/math-grade-5.js')) },
  { ...mathGrade6, load: subject(() => import('./content/math-grade-6.js')) },
  { ...mathGrade7, load: subject(() => import('./content/math-grade-7.js')) },
  { ...mathGrade8, load: subject(() => import('./content/math-grade-8.js')) },
  { ...mathGrade9, load: subject(() => import('./content/math-grade-9.js')) },
  { ...mathHighSchool, load: subject(() => import('./content/math-high-school.js')) },
  { ...hebrewGrade1, load: subject(() => import('./content/hebrew-grade-1.js')) },
  { ...hebrewGrade2, load: subject(() => import('./content/hebrew-grade-2.js')) },
  { ...hebrewGrade3, load: subject(() => import('./content/hebrew-grade-3.js')) },
  { ...hebrewGrade4, load: subject(() => import('./content/hebrew-grade-4.js')) },
  { ...hebrewGrade5, load: subject(() => import('./content/hebrew-grade-5.js')) },
  { ...hebrewGrade6, load: subject(() => import('./content/hebrew-grade-6.js')) },
  { ...hebrewGrade7, load: subject(() => import('./content/hebrew-grade-7.js')) },
  { ...hebrewGrade8, load: subject(() => import('./content/hebrew-grade-8.js')) },
  { ...hebrewGrade9, load: subject(() => import('./content/hebrew-grade-9.js')) },
  { ...hebrewHighSchool, load: subject(() => import('./content/hebrew-high-school.js')) },
  { ...readingGrade3, load: subject(() => import('./content/reading-grade-3.js')) },
  { ...scienceGrade1, load: subject(() => import('./content/science-grade-1.js')) },
  { ...scienceGrade2, load: subject(() => import('./content/science-grade-2.js')) },
  { ...scienceGrade3, load: subject(() => import('./content/science-grade-3.js')) },
  { ...scienceGrade4, load: subject(() => import('./content/science-grade-4.js')) },
  { ...scienceGrade5, load: subject(() => import('./content/science-grade-5.js')) },
  { ...scienceGrade6, load: subject(() => import('./content/science-grade-6.js')) },
  { ...scienceGrade7, load: subject(() => import('./content/science-grade-7.js')) },
  { ...scienceGrade8, load: subject(() => import('./content/science-grade-8.js')) },
  { ...scienceGrade9, load: subject(() => import('./content/science-grade-9.js')) },
  { ...tanakhGrade2, load: subject(() => import('./content/tanakh-grade-2.js')) },
  { ...tanakhGrade3, load: subject(() => import('./content/tanakh-grade-3.js')) },
  { ...tanakhGrade4, load: subject(() => import('./content/tanakh-grade-4.js')) },
  { ...tanakhGrade5, load: subject(() => import('./content/tanakh-grade-5.js')) },
  { ...tanakhGrade6, load: subject(() => import('./content/tanakh-grade-6.js')) },
  { ...tanakhGrade7, load: subject(() => import('./content/tanakh-grade-7.js')) },
  { ...tanakhGrade8, load: subject(() => import('./content/tanakh-grade-8.js')) },
  { ...tanakhGrade9, load: subject(() => import('./content/tanakh-grade-9.js')) },
  { ...tanakhHighSchool, load: subject(() => import('./content/tanakh-high-school.js')) },
  { ...moledetGrade2, load: subject(() => import('./content/moledet-grade-2.js')) },
  { ...moledetGrade3, load: subject(() => import('./content/moledet-grade-3.js')) },
  { ...moledetGrade4, load: subject(() => import('./content/moledet-grade-4.js')) },
  { ...geographyGrade5, load: subject(() => import('./content/geography-grade-5.js')) },
  { ...geographyGrade6, load: subject(() => import('./content/geography-grade-6.js')) },
  { ...geographyGrade7, load: subject(() => import('./content/geography-grade-7.js')) },
  { ...geographyGrade8, load: subject(() => import('./content/geography-grade-8.js')) },
  { ...historyGrade6, load: subject(() => import('./content/history-grade-6.js')) },
  { ...historyGrade7, load: subject(() => import('./content/history-grade-7.js')) },
  { ...historyGrade8, load: subject(() => import('./content/history-grade-8.js')) },
  { ...historyGrade9, load: subject(() => import('./content/history-grade-9.js')) },
  { ...historyHighSchool, load: subject(() => import('./content/history-high-school.js')) },
  { ...civicsHighSchool, load: subject(() => import('./content/civics-high-school.js')) },
  { ...biologyHighSchool, load: subject(() => import('./content/biology-high-school.js')) },
  { ...literatureHighSchool, load: subject(() => import('./content/literature-high-school.js')) },
  { ...bagrutBiology5Units, load: subject(() => import('./content/bagrut-biology-5-units.js')) },
  { ...bagrutChemistry5Units, load: subject(() => import('./content/bagrut-chemistry-5-units.js')) },
  { ...bagrutCivics2Units, load: subject(() => import('./content/bagrut-civics-2-units.js')) },
  { ...bagrutHistory2Units, load: subject(() => import('./content/bagrut-history-2-units.js')) },
  { ...bagrutLashon2Units, load: subject(() => import('./content/bagrut-lashon-2-units.js')) },
  { ...bagrutLiterature2Units, load: subject(() => import('./content/bagrut-literature-2-units.js')) },
  { ...bagrutMath3Units, load: subject(() => import('./content/bagrut-math-3-units.js')) },
  { ...bagrutMath4Units, load: subject(() => import('./content/bagrut-math-4-units.js')) },
  { ...bagrutMath5UnitsA, load: subject(() => import('./content/bagrut-math-5-units-a.js')) },
  { ...bagrutMath5UnitsB, load: subject(() => import('./content/bagrut-math-5-units-b.js')) },
  { ...bagrutPhysics5Units, load: subject(() => import('./content/bagrut-physics-5-units.js')) },
  { ...bagrutTanakh2Units, load: subject(() => import('./content/bagrut-tanakh-2-units.js')) },
]
