export interface BookEntry {
  name: string;
  image: string;
}

export interface SyllabusSection {
  id: number;
  titleKey: string;
  descKey: string;
  /** Single book (used for Nazra, Hifz, and individual book sections) */
  bookName?: string;
  bookImage?: string;
  /** Multiple books shown as a row of thumbnails (used for Aalim year sections) */
  books?: BookEntry[];
}

export interface CourseSyllabus {
  courseType: string;
  sections: SyllabusSection[];
}

// ─── Para image extensions (verified against public/Quran Parah Images/) ────
const PARA_EXTS: Record<number, string> = {
  1: "webp", 2: "webp", 3: "png", 4: "png", 5: "png",
  6: "png",  7: "png",  8: "png", 9: "png", 10: "webp",
  11: "webp",12: "png", 13: "webp",14: "webp",15: "webp",
  16: "webp",17: "webp",18: "webp",19: "webp",20: "png",
  21: "png", 22: "png", 23: "png", 24: "png", 25: "png",
  26: "png", 27: "png", 28: "png", 29: "png", 30: "png",
};

function paraImage(n: number): string {
  return `/Quran Parah Images/${n}.${PARA_EXTS[n]}`;
}

// ─── All book images (paths verified against public/ folders) ────────────────
const B = {
  // Nazra
  nooraniQaida: "/Nazra/Norani Quaida.png",
  namaz:        "/Nazra/Namaz.png",

  // Aalim Course — Arabic grammar
  nahvMeer:      "/Aalim Course/Nahv Meer.webp",
  ilmusSegha:    "/Aalim Course/ILMUS Segha.jpg",
  hidayatulNahv: "/Aalim Course/Hidayat-ul-Nahv.webp",
  sharahMiatu:   "/Aalim Course/Sharah Miatu Aamil.webp",

  // Aalim Course — Fiqh
  qudoori:      "/Aalim Course/Qudoori.jpg",
  kanzulDaqaiq: "/Aalim Course/Kanzul Daqaiq.webp",
  hidaya:       "/Aalim Course/Hidaya.webp",

  // Aalim Course — Hadith & Tafseer
  mishkat:   "/Aalim Course/Miashkaat.webp",
  jalalain:  "/Aalim Course/Jalalain.webp",
  bukhari:   "/Aalim Course/Bukhari.webp",
  muslim:    "/Aalim Course/Muslim.webp",
  tirmidhi:  "/Aalim Course/Tirmidhi.webp",
  jami:      "/Aalim Course/Jami.webp",
  muwatta:   "/Aalim Course/Muwatta Imam Malik.jpg",
  nisai:     "/Aalim Course/Nisai p Ibne Maja.webp",
  tahawi:    "/Aalim Course/Tahawi.png",
};

// ─── Nazra (9 sections) ──────────────────────────────────────────────────────
const nazraSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "nazraSyllabusTitle1", descKey: "nazraSyllabusDesc1", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 2, titleKey: "nazraSyllabusTitle2", descKey: "nazraSyllabusDesc2", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 3, titleKey: "nazraSyllabusTitle3", descKey: "nazraSyllabusDesc3", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 4, titleKey: "nazraSyllabusTitle4", descKey: "nazraSyllabusDesc4", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 5, titleKey: "nazraSyllabusTitle5", descKey: "nazraSyllabusDesc5", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 6, titleKey: "nazraSyllabusTitle6", descKey: "nazraSyllabusDesc6", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 7, titleKey: "nazraSyllabusTitle7", descKey: "nazraSyllabusDesc7", bookName: "Noorani Qaida", bookImage: B.nooraniQaida },
  { id: 8, titleKey: "nazraSyllabusTitle8", descKey: "nazraSyllabusDesc8", bookName: "Namaz Book",    bookImage: B.namaz },
  { id: 9, titleKey: "nazraSyllabusTitle9", descKey: "nazraSyllabusDesc9", bookName: "Al-Quran — Para 1", bookImage: paraImage(1) },
];

// ─── Hifz (30 Para sections) ─────────────────────────────────────────────────
const hifzSyllabus: SyllabusSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titleKey: `hifzSyllabusTitle${i + 1}`,
  descKey:  `hifzSyllabusDesc${i + 1}`,
  bookName:  `Para ${i + 1}`,
  bookImage: paraImage(i + 1),
}));

// ─── Aalim (4 year-based sections — each shows all books of that stage) ──────
//
// Year 1-2  → Arabic grammar + Qudoori
// Year 3-4  → Advanced Fiqh + Mishkat + Jalalain
// Year 5-6  → Siha Sitta (six major Hadith books)
// Year 7-8  → Muwatta, Tahawi, Hidaya + Ijazah
//
// Using existing translation keys (aalimSyllabusTitle1..4 / aalimSyllabusDesc1..4)
const aalimSyllabus: SyllabusSection[] = [
  {
    id: 1,
    titleKey: "aalimSyllabusTitle1",
    descKey:  "aalimSyllabusDesc1",
    books: [
      { name: "Nahv Meer",         image: B.nahvMeer },
      { name: "Ilm us Seeghah",    image: B.ilmusSegha },
      { name: "Hidayat ul Nahv",   image: B.hidayatulNahv },
      { name: "Sharah Miatu Aamil",image: B.sharahMiatu },
      { name: "Qudoori",           image: B.qudoori },
    ],
  },
  {
    id: 2,
    titleKey: "aalimSyllabusTitle2",
    descKey:  "aalimSyllabusDesc2",
    books: [
      { name: "Kanzul Daqaiq",       image: B.kanzulDaqaiq },
      { name: "Mishkat al-Masabih",  image: B.mishkat },
      { name: "Tafseer Jalalain",    image: B.jalalain },
    ],
  },
  {
    id: 3,
    titleKey: "aalimSyllabusTitle3",
    descKey:  "aalimSyllabusDesc3",
    books: [
      { name: "Sahih Al-Bukhari", image: B.bukhari },
      { name: "Sahih Muslim",     image: B.muslim },
      { name: "Jami Tirmidhi",    image: B.tirmidhi },
      { name: "Jami",             image: B.jami },
      { name: "Nasai & Ibn Maja", image: B.nisai },
    ],
  },
  {
    id: 4,
    titleKey: "aalimSyllabusTitle4",
    descKey:  "aalimSyllabusDesc4",
    books: [
      { name: "Muwatta Imam Malik", image: B.muwatta },
      { name: "Tahawi",             image: B.tahawi },
      { name: "Hidayah",            image: B.hidaya },
    ],
  },
];

// ─── Arabic (4 level sections) ───────────────────────────────────────────────
//
// Level 1 Foundation   → Nahv Meer + Ilm us Seeghah
// Level 2 Intermediate → Hidayat ul Nahv + Sharah Miatu Aamil
// Level 3 Advanced     → Advanced texts (no local images — show grammar icon)
// Level 4 Mastery      → Literature & composition (no local images)
const arabicSyllabus: SyllabusSection[] = [
  {
    id: 1,
    titleKey: "arabicSyllabusTitle1",
    descKey:  "arabicSyllabusDesc1",
    books: [
      { name: "Nahv Meer",      image: B.nahvMeer },
      { name: "Ilm us Seeghah", image: B.ilmusSegha },
    ],
  },
  {
    id: 2,
    titleKey: "arabicSyllabusTitle2",
    descKey:  "arabicSyllabusDesc2",
    books: [
      { name: "Hidayat ul Nahv",    image: B.hidayatulNahv },
      { name: "Sharah Miatu Aamil", image: B.sharahMiatu },
    ],
  },
  {
    id: 3,
    titleKey: "arabicSyllabusTitle3",
    descKey:  "arabicSyllabusDesc3",
    // Kafiya / Sharah Ibn Aqeel — images not available locally
  },
  {
    id: 4,
    titleKey: "arabicSyllabusTitle4",
    descKey:  "arabicSyllabusDesc4",
    // Literature & conversation — no specific book image
  },
];

// ─── Exports ─────────────────────────────────────────────────────────────────
const syllabusMap: Record<string, SyllabusSection[]> = {
  nazra:  nazraSyllabus,
  hifz:   hifzSyllabus,
  aalim:  aalimSyllabus,
  arabic: arabicSyllabus,
};

export function getSyllabus(courseType: string): SyllabusSection[] {
  return syllabusMap[courseType] || [];
}
