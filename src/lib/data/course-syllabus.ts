export interface SyllabusSection {
  id: number;
  titleKey: string;
  descKey: string;
  bookName?: string;
  bookImage?: string;
}

export interface CourseSyllabus {
  courseType: string;
  sections: SyllabusSection[];
}

// Para image extensions (1-30)
const PARA_EXTS: Record<number, string> = {
  1: "webp", 2: "webp", 3: "png", 4: "png", 5: "png",
  6: "png", 7: "png", 8: "png", 9: "png", 10: "webp",
  11: "webp", 12: "png", 13: "webp", 14: "webp", 15: "webp",
  16: "webp", 17: "webp", 18: "webp", 19: "webp", 20: "png",
  21: "png", 22: "png", 23: "png", 24: "png", 25: "png",
  26: "png", 27: "png", 28: "png", 29: "png", 30: "png",
};

function paraImage(n: number): string {
  return `/Quran Parah Images/${n}.${PARA_EXTS[n]}`;
}

const BOOK_IMAGES = {
  nooraniQaida: "/Nazra/Norani Quaida.png",
  namaz: "/Nazra/Namaz.png",
  // Aalim Course books
  hidaya: "/Aalim Course/Hidaya.webp",
  mishkat: "/Aalim Course/Miashkaat.webp",
  jalalain: "/Aalim Course/Jalalain.webp",
  qudoori: "/Aalim Course/Qudoori.jpg",
  bukhari: "/Aalim Course/Bukhari.webp",
  muslim: "/Aalim Course/Muslim.webp",
  tirmidhi: "/Aalim Course/Tirmidhi.webp",
  jami: "/Aalim Course/Jami.webp",
  tahawi: "/Aalim Course/Tahawi.png",
  muwatta: "/Aalim Course/Muwatta Imam Malik.jpg",
  nisai: "/Aalim Course/Nisai p Ibne Maja.webp",
  kanzulDaqaiq: "/Aalim Course/Kanzul Daqaiq.webp",
  // Arabic books (using nahv books)
  nahvMeer: "/Aalim Course/Nahv Meer.webp",
  hidayatulNahv: "/Aalim Course/Hidayat-ul-Nahv.webp",
  ilmusSegha: "/Aalim Course/ILMUS Segha.jpg",
  sharahMiatu: "/Aalim Course/Sharah Miatu Aamil.webp",
};

const nazraSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "nazraSyllabusTitle1", descKey: "nazraSyllabusDesc1", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 2, titleKey: "nazraSyllabusTitle2", descKey: "nazraSyllabusDesc2", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 3, titleKey: "nazraSyllabusTitle3", descKey: "nazraSyllabusDesc3", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 4, titleKey: "nazraSyllabusTitle4", descKey: "nazraSyllabusDesc4", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 5, titleKey: "nazraSyllabusTitle5", descKey: "nazraSyllabusDesc5", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 6, titleKey: "nazraSyllabusTitle6", descKey: "nazraSyllabusDesc6", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 7, titleKey: "nazraSyllabusTitle7", descKey: "nazraSyllabusDesc7", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 8, titleKey: "nazraSyllabusTitle8", descKey: "nazraSyllabusDesc8", bookName: "Namaz Book", bookImage: BOOK_IMAGES.namaz },
  { id: 9, titleKey: "nazraSyllabusTitle9", descKey: "nazraSyllabusDesc9", bookName: "Al-Quran — Para 1", bookImage: paraImage(1) },
];

const hifzSyllabus: SyllabusSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titleKey: `hifzSyllabusTitle${i + 1}`,
  descKey: `hifzSyllabusDesc${i + 1}`,
  bookName: `Para ${i + 1}`,
  bookImage: paraImage(i + 1),
}));

const aalimSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "aalimSyllabusTitle1", descKey: "aalimSyllabusDesc1", bookName: "Qudoori (Islamic Fiqh)", bookImage: BOOK_IMAGES.qudoori },
  { id: 2, titleKey: "aalimSyllabusTitle2", descKey: "aalimSyllabusDesc2", bookName: "Hidayah (Islamic Jurisprudence)", bookImage: BOOK_IMAGES.hidaya },
  { id: 3, titleKey: "aalimSyllabusTitle3", descKey: "aalimSyllabusDesc3", bookName: "Mishkat Al-Masabih (Hadith)", bookImage: BOOK_IMAGES.mishkat },
  { id: 4, titleKey: "aalimSyllabusTitle4", descKey: "aalimSyllabusDesc4", bookName: "Tafseer Al-Jalalain", bookImage: BOOK_IMAGES.jalalain },
  { id: 5, titleKey: "aalimSyllabusTitle5", descKey: "aalimSyllabusDesc5", bookName: "Sahih Al-Bukhari", bookImage: BOOK_IMAGES.bukhari },
  { id: 6, titleKey: "aalimSyllabusTitle6", descKey: "aalimSyllabusDesc6", bookName: "Sahih Muslim", bookImage: BOOK_IMAGES.muslim },
  { id: 7, titleKey: "aalimSyllabusTitle7", descKey: "aalimSyllabusDesc7", bookName: "Jami Al-Tirmidhi", bookImage: BOOK_IMAGES.tirmidhi },
  { id: 8, titleKey: "aalimSyllabusTitle8", descKey: "aalimSyllabusDesc8", bookName: "Kanzul Daqaiq", bookImage: BOOK_IMAGES.kanzulDaqaiq },
];

const arabicSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "arabicSyllabusTitle1", descKey: "arabicSyllabusDesc1", bookName: "Ilm us Seeghah", bookImage: BOOK_IMAGES.ilmusSegha },
  { id: 2, titleKey: "arabicSyllabusTitle2", descKey: "arabicSyllabusDesc2", bookName: "Nahv Meer", bookImage: BOOK_IMAGES.nahvMeer },
  { id: 3, titleKey: "arabicSyllabusTitle3", descKey: "arabicSyllabusDesc3", bookName: "Hidayat ul Nahv", bookImage: BOOK_IMAGES.hidayatulNahv },
  { id: 4, titleKey: "arabicSyllabusTitle4", descKey: "arabicSyllabusDesc4", bookName: "Sharah Miatu Aamil", bookImage: BOOK_IMAGES.sharahMiatu },
];

const syllabusMap: Record<string, SyllabusSection[]> = {
  nazra: nazraSyllabus,
  hifz: hifzSyllabus,
  aalim: aalimSyllabus,
  arabic: arabicSyllabus,
};

export function getSyllabus(courseType: string): SyllabusSection[] {
  return syllabusMap[courseType] || [];
}
