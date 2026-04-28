export interface BookEntry {
  name: string;
  image: string;
  pdfUrl?: string;
}

export interface SyllabusSection {
  id: number;
  titleKey: string;
  descKey: string;
  /** Single book / lesson image */
  bookName?: string;
  bookImage?: string;
  /** PDF link for single-book sections */
  pdfUrl?: string;
  /** Multiple books shown as thumbnail row */
  books?: BookEntry[];
}

// ─── Supabase Storage PDF base URL ───────────────────────────────────────────
const PDF_BASE =
  "https://ukfvjadlonmjeugatyub.supabase.co/storage/v1/object/public/course-pdfs";

function sbPdf(path: string): string {
  return `${PDF_BASE}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

// ─── Para metadata ────────────────────────────────────────────────────────────
const PARA_NAMES: Record<number, string> = {
  1: "Alif Lam Meem",       2: "Sayaqool",          3: "Tilkal Rusul",
  4: "Lan Tanaloo",         5: "Wal Muhsanaat",      6: "La Yuhibbullah",
  7: "Wa Iza Samiu",        8: "Wa Lau Annana",      9: "Qalal Malao",
  10: "Wa A'lamu",          11: "Ya'tazeroon",       12: "Wa Ma Min Daabbah",
  13: "Wa Ma Ubarri'u",     14: "Rubama",            15: "Subhanallazi",
  16: "Qal Alam",           17: "Iqtaraba",          18: "Qad Aflaha",
  19: "Wa Qalallazina",     20: "A'man Khalaq",      21: "Utlu Ma Uhiya",
  22: "Wa Man Yaqnut",      23: "Wa Mali",           24: "Faman Azlam",
  25: "Ilayhi Yuraddu",     26: "Ha Meem",           27: "Qala Fama Khatbukum",
  28: "Qad Sami Allah",     29: "Tabarakallazi",     30: "Amma",
};

const PARA_EXTS: Record<number, string> = {
  1: "webp", 2: "webp", 3: "png",  4: "png",  5: "png",
  6: "png",  7: "png",  8: "png",  9: "png",  10: "webp",
  11: "webp",12: "png", 13: "webp",14: "webp",15: "webp",
  16: "webp",17: "webp",18: "webp",19: "webp",20: "png",
  21: "png", 22: "png", 23: "png", 24: "png", 25: "png",
  26: "png", 27: "png", 28: "png", 29: "png", 30: "png",
};

function paraImage(n: number): string {
  return `/Quran Parah Images/Para ${n} — ${PARA_NAMES[n]}.${PARA_EXTS[n]}`;
}

// Para PDFs hosted on Supabase Storage (uploaded with clean filenames)
function paraPdf(n: number): string {
  return sbPdf(`Quran Parah Images/Para-${n}.pdf`);
}

// ─── All image paths ─────────────────────────────────────────────────────────
const B = {
  // Nazra per-lesson images
  nazra1: "/Nazra/Huroof-e-Mufradat (Alif to Yaa).jpg",
  nazra2: "/Nazra/Huroof-e-Murakkabat.jpg",
  nazra3: "/Nazra/Harakaat (Fatha, Kasra, Damma).jpg",
  nazra4: "/Nazra/Tanween.jpg",
  nazra5: "/Nazra/Madd (Long Vowels).jpg",
  nazra6: "/Nazra/Jazm o Sukoon.jpg",
  nazra7: "/Nazra/Tashdeed.jpg",
  nazra8: "/Nazra/Practice Exercises.jpg",
  nazra9: "/Nazra/Beginning Quran Reading.png",

  // Aalim Course — Arabic grammar + Fiqh
  nahvMeer:      "/Aalim Course/Nahv Meer.webp",
  ilmusSeeghah:  "/Aalim Course/Ilm-us-Seeghah.jpg",
  hidayatulNahv: "/Aalim Course/Hidayat-ul-Nahv.webp",
  sharhMiatAmil: "/Aalim Course/Sharh Miat Amil.webp",
  qudoori:       "/Aalim Course/Qudoori.webp",
  kanzulDaqaiq:  "/Aalim Course/Kanzul Daqaiq.webp",
  sharhJami:     "/Aalim Course/Sharh Jami.webp",
  mishkat:       "/Aalim Course/Mishkat-ul-Masabih.jpg",
  jalalain:      "/Aalim Course/Tafseer Jalalain.webp",

  // Aalim Course — Siha Sitta
  bukhari:  "/Aalim Course/Sahih Bukhari.webp",
  muslim:   "/Aalim Course/Sahih Muslim.webp",
  tirmidhi: "/Aalim Course/Tirmidhi.webp",
  abuDawud: "/Aalim Course/Abu Dawud.webp",
  nasai:    "/Aalim Course/Nasai.jpg",
  ibnMajah: "/Aalim Course/Ibn Majah.jpg",

  // Aalim Course — Year 7-8
  muwatta: "/Aalim Course/Muwatta Imam Malik.jpg",
  tahawi:  "/Aalim Course/Tahawi.png",
  hidaya:  "/Aalim Course/Hidaya.webp",

  // Arabic Language
  arabNahwMeer:      "/Arabic Language/Nahw Meer.webp",
  arabIlmusSeeghah:  "/Arabic Language/Ilm-us-Seeghah.jpg",
  arabVocabulary:    "/Arabic Language/Basic Vocabulary building.png",
  arabHidayatulNahw: "/Arabic Language/Hidayat-un-Nahw.webp",
  arabSharhMiatAmil: "/Arabic Language/Sharh Miat Amil.webp",
  arabSarf:          "/Arabic Language/Sarf exercises.png",
  arabKafiya:        "/Arabic Language/Kafiya.jpeg",
  arabIbnAqeel:      "/Arabic Language/Sharah Ibn Aqeel.webp",
  arabLiterature:    "/Arabic Language/Arabic Literature.jpg",
  arabConversation:  "/Arabic Language/Conversational Practice.jpg",
  arabComposition:   "/Arabic Language/Composition.webp",
};

// ─── Nazra (9 sections — per-lesson images) ──────────────────────────────────
const nazraSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "nazraSyllabusTitle1", descKey: "nazraSyllabusDesc1", bookImage: B.nazra1, pdfUrl: sbPdf("Nazra/Individual Arabic letters recognition and pronunciation.pdf") },
  { id: 2, titleKey: "nazraSyllabusTitle2", descKey: "nazraSyllabusDesc2", bookImage: B.nazra2 },
  { id: 3, titleKey: "nazraSyllabusTitle3", descKey: "nazraSyllabusDesc3", bookImage: B.nazra3 },
  { id: 4, titleKey: "nazraSyllabusTitle4", descKey: "nazraSyllabusDesc4", bookImage: B.nazra4 },
  { id: 5, titleKey: "nazraSyllabusTitle5", descKey: "nazraSyllabusDesc5", bookImage: B.nazra5 },
  { id: 6, titleKey: "nazraSyllabusTitle6", descKey: "nazraSyllabusDesc6", bookImage: B.nazra6 },
  { id: 7, titleKey: "nazraSyllabusTitle7", descKey: "nazraSyllabusDesc7", bookImage: B.nazra7 },
  { id: 8, titleKey: "nazraSyllabusTitle8", descKey: "nazraSyllabusDesc8", bookImage: B.nazra8 },
  { id: 9, titleKey: "nazraSyllabusTitle9", descKey: "nazraSyllabusDesc9", bookImage: B.nazra9 },
];

// ─── Hifz (30 Para sections) ─────────────────────────────────────────────────
const hifzSyllabus: SyllabusSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titleKey: `hifzSyllabusTitle${i + 1}`,
  descKey:  `hifzSyllabusDesc${i + 1}`,
  bookImage: paraImage(i + 1),
  pdfUrl:    paraPdf(i + 1),
}));

// ─── Aalim (4 year-based sections) ───────────────────────────────────────────
// Note: Hidaya, Muwatta, Sahih Muslim PDFs exceed Supabase free-tier 50MB limit — no PDF link
const aalimSyllabus: SyllabusSection[] = [
  {
    id: 1,
    titleKey: "aalimSyllabusTitle1",
    descKey:  "aalimSyllabusDesc1",
    books: [
      { name: "Nahv Meer",         image: B.nahvMeer,      pdfUrl: sbPdf("Aalim Course/Nahw Meer.pdf") },
      { name: "Ilm us Seeghah",    image: B.ilmusSeeghah,  pdfUrl: sbPdf("Aalim Course/Ilm-us-Seeghah.pdf") },
      { name: "Hidayat ul Nahv",   image: B.hidayatulNahv, pdfUrl: sbPdf("Aalim Course/Hidayat-un-Nahw.pdf") },
      { name: "Sharh Miat Amil",   image: B.sharhMiatAmil, pdfUrl: sbPdf("Aalim Course/Sharh Miat Amil.pdf") },
      { name: "Qudoori",           image: B.qudoori,       pdfUrl: sbPdf("Aalim Course/Qudoori.pdf") },
    ],
  },
  {
    id: 2,
    titleKey: "aalimSyllabusTitle2",
    descKey:  "aalimSyllabusDesc2",
    books: [
      { name: "Kanzul Daqaiq",      image: B.kanzulDaqaiq, pdfUrl: sbPdf("Aalim Course/Kanz-ud-Daqaiq.pdf") },
      { name: "Sharh Jami",         image: B.sharhJami,    pdfUrl: sbPdf("Aalim Course/Sharh Jami.pdf") },
      { name: "Mishkat al-Masabih", image: B.mishkat,      pdfUrl: sbPdf("Aalim Course/Mishkat-ul-Masabih.pdf") },
      { name: "Tafseer Jalalain",   image: B.jalalain,     pdfUrl: sbPdf("Aalim Course/Tafseer Jalalain.pdf") },
    ],
  },
  {
    id: 3,
    titleKey: "aalimSyllabusTitle3",
    descKey:  "aalimSyllabusDesc3",
    books: [
      { name: "Sahih Al-Bukhari", image: B.bukhari,  pdfUrl: sbPdf("Aalim Course/Sahih Bukhari.pdf") },
      { name: "Sahih Muslim",     image: B.muslim },
      { name: "Jami Tirmidhi",    image: B.tirmidhi, pdfUrl: sbPdf("Aalim Course/Tirmidhi.pdf") },
      { name: "Abu Dawud",        image: B.abuDawud, pdfUrl: sbPdf("Aalim Course/Abu Dawud.pdf") },
      { name: "Nasai",            image: B.nasai,    pdfUrl: sbPdf("Aalim Course/Nasai.pdf") },
      { name: "Ibn Majah",        image: B.ibnMajah, pdfUrl: sbPdf("Aalim Course/Ibn Majah.pdf") },
    ],
  },
  {
    id: 4,
    titleKey: "aalimSyllabusTitle4",
    descKey:  "aalimSyllabusDesc4",
    books: [
      { name: "Muwatta Imam Malik", image: B.muwatta },
      { name: "Tahawi",             image: B.tahawi,  pdfUrl: sbPdf("Aalim Course/Tahawi.pdf") },
      { name: "Hidayah",            image: B.hidaya },
    ],
  },
];

// ─── Arabic (4 level sections) ───────────────────────────────────────────────
const arabicSyllabus: SyllabusSection[] = [
  {
    id: 1,
    titleKey: "arabicSyllabusTitle1",
    descKey:  "arabicSyllabusDesc1",
    books: [
      { name: "Nahw Meer",        image: B.arabNahwMeer,     pdfUrl: sbPdf("Arabic Language/Nahw Meer.pdf") },
      { name: "Ilm us Seeghah",   image: B.arabIlmusSeeghah, pdfUrl: sbPdf("Arabic Language/Ilm-us-Seeghah.pdf") },
      { name: "Basic Vocabulary", image: B.arabVocabulary,   pdfUrl: sbPdf("Arabic Language/Basic Vocabulary building.pdf") },
    ],
  },
  {
    id: 2,
    titleKey: "arabicSyllabusTitle2",
    descKey:  "arabicSyllabusDesc2",
    books: [
      { name: "Hidayat ul Nahw", image: B.arabHidayatulNahw, pdfUrl: sbPdf("Arabic Language/Hidayat-un-Nahw.pdf") },
      { name: "Sharh Miat Amil", image: B.arabSharhMiatAmil, pdfUrl: sbPdf("Arabic Language/Sharh Miat Amil.pdf") },
      { name: "Sarf Exercises",  image: B.arabSarf,          pdfUrl: sbPdf("Arabic Language/Sarf exercises.pdf") },
    ],
  },
  {
    id: 3,
    titleKey: "arabicSyllabusTitle3",
    descKey:  "arabicSyllabusDesc3",
    books: [
      { name: "Kafiya",           image: B.arabKafiya,   pdfUrl: sbPdf("Arabic Language/Kafiya.pdf") },
      { name: "Sharah Ibn Aqeel", image: B.arabIbnAqeel, pdfUrl: sbPdf("Arabic Language/Sharah Ibn Aqeel.pdf") },
    ],
  },
  {
    id: 4,
    titleKey: "arabicSyllabusTitle4",
    descKey:  "arabicSyllabusDesc4",
    books: [
      { name: "Arabic Literature",       image: B.arabLiterature,   pdfUrl: sbPdf("Arabic Language/Arabic Literature.pdf") },
      { name: "Conversational Practice", image: B.arabConversation, pdfUrl: sbPdf("Arabic Language/Conversational Practice.pdf") },
      { name: "Composition",             image: B.arabComposition,  pdfUrl: sbPdf("Arabic Language/Composition.pdf") },
    ],
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
