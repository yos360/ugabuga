// Sources cited on the /speech/parents pages. `url` only where the address is known to be stable.
export const SOURCES = {
  asha: { title: 'ASHA (האיגוד האמריקאי לשמיעה, שפה ודיבור) — Communication Milestones, Birth to 5 Years (2023)', url: 'https://www.asha.org/public/developmental-milestones/' },
  cdc: { title: 'CDC — Learn the Signs. Act Early: אבני דרך התפתחותיות (עדכון 2022)', url: 'https://www.cdc.gov/ncbddd/actearly/milestones/index.html' },
  zubler: { title: 'Zubler et al. (2022). Evidence-Informed Milestones for Developmental Surveillance Tools. Pediatrics 149(3)', url: 'https://doi.org/10.1542/peds.2021-052138' },
  ishla: { title: 'האגודה הישראלית של קלינאי תקשורת — דפי מידע להורים (התפתחות תקשורת, שפה ודיבור בינקות; לקות שפה התפתחותית)', url: 'https://ishla.org.il/' },
  ishlaBilingual: { title: 'נייר עמדה: דו־לשוניות ולקות שפה בקרב ילדים בישראל (האגודה הישראלית של קלינאי תקשורת)', url: 'https://cris.haifa.ac.il/en/publications/position-paper-bilingualism-and-language-impairment-in-children-%D7%A0/' },
  armonLotem: { title: 'ערמון־לוטם, ש׳ — דו־לשוניות אצל ילדים, הד האולפן (משרד החינוך)', url: 'https://meyda.education.gov.il/files/AdultEducation/hed_haulpan/hed_24_102_sharon_armon.pdf' },
  moh: { title: 'משרד הבריאות — מעקב התפתחות הילד בטיפות חלב (אבני דרך התפתחותיות)' },
  moe03: { title: 'משרד החינוך — התפתחות שפה מלידה עד גיל 3', url: 'https://pop.education.gov.il/kindergarten/magar-ganey-yeladim/language-development-from-birth-to-age-3' },
  moe36: { title: 'משרד החינוך — התפתחות שפה מגיל 3 עד 6', url: 'https://pop.education.gov.il/kindergarten/magar-ganey-yeladim/language-development-from-age-four-to-three-to-age-six/' },
  stuttering: { title: 'The Stuttering Foundation — מתי כדאי לפנות להערכה', url: 'https://www.stutteringhelp.org/' },
  ambi: { title: 'כל זכות — אמב״י, ארגון מגמגמים בישראל', url: 'https://www.kolzchut.org.il/he/%D7%90%D7%9E%D7%91%22%D7%99_-_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%9E%D7%92%D7%9E%D7%92%D7%9E%D7%99%D7%9D_%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C' },
  hanen: { title: 'The Hanen Centre — Observe, Wait and Listen (OWL)', url: 'https://www.hanen.org/' },
  aap: { title: 'American Academy of Pediatrics (2016). Media and Young Minds. Pediatrics 138(5)', url: 'https://doi.org/10.1542/peds.2016-2591' },
  coplan: { title: 'Coplan & Gleason (1988). Unclear speech: recognition and significance of unintelligible speech in preschool children. Pediatrics 82(3) — מקור "כלל האצבע" למובנות הדיבור' },
  lateTalkers: { title: 'Late talkers — סקירה (PMC, 2021): פחות מ־50 מילים או בלי צירופים בגיל 24 חודשים', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8219342' },
  benDavid: { title: 'בן־דוד, א׳ — נורמות רכישה פונולוגית בעברית. ד״ש ברשת 34 (2015), האגודה הישראלית של קלינאי תקשורת', url: 'https://ishla.org.il/wp-content/uploads/2022/10/34-2015-compressed.pdf' },
  meuhedet: { title: 'מאוחדת — תהליך רכישת הצלילים', url: 'https://www.meuhedet.co.il/%D7%A7%D7%9C%D7%99%D7%A0%D7%90%D7%95%D7%AA-%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA/%D7%A7%D7%9C%D7%99%D7%A0%D7%90%D7%95%D7%AA-%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-%D7%A2%D7%93-%D7%92%D7%99%D7%9C-9/%D7%94%D7%A4%D7%A8%D7%A2%D7%95%D7%AA-%D7%94%D7%99%D7%92%D7%95%D7%99/%D7%AA%D7%94%D7%9C%D7%99%D7%9A-%D7%A8%D7%9B%D7%99%D7%A9%D7%AA-%D7%94%D7%A6%D7%9C%D7%99%D7%9C%D7%99%D7%9D/' },
  maccabi: { title: 'מכבי — התפתחות הדיבור', url: 'https://www.maccabi4u.co.il/maccabi_circles/child_development/development-basics/speaking/' },
}

export const MILESTONE_SOURCES = ['asha', 'cdc', 'zubler', 'ishla', 'moh', 'moe03', 'moe36', 'coplan', 'lateTalkers', 'hanen', 'aap', 'ishlaBilingual', 'armonLotem', 'stuttering', 'ambi'].map(k => SOURCES[k])
export const SOUND_SOURCES = ['benDavid', 'meuhedet', 'maccabi', 'ishla', 'asha', 'coplan'].map(k => SOURCES[k])
