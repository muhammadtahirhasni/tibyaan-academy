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

// Reliable book cover image URLs
const BOOK_IMAGES = {
  nooraniQaida: "https://covers.openlibrary.org/b/isbn/9780955604720-M.jpg",
  quran: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Quran_sharif.jpg/200px-Quran_sharif.jpg",
  madinahArabic1: "https://covers.openlibrary.org/b/isbn/9789960673837-M.jpg",
  madinahArabic2: "https://covers.openlibrary.org/b/isbn/9789960673851-M.jpg",
  arabicBetweenHands: "https://covers.openlibrary.org/b/isbn/9789960798233-M.jpg",
  islamicAqaid: "https://covers.openlibrary.org/b/isbn/9789960897714-M.jpg",
  hidayah: "https://covers.openlibrary.org/b/isbn/9781597843287-M.jpg",
  mishkat: "https://covers.openlibrary.org/b/isbn/9789693501018-M.jpg",
  tafseerIbnKathir: "https://covers.openlibrary.org/b/isbn/9781591440819-M.jpg",
};

const nazraSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "nazraSyllabusTitle1", descKey: "nazraSyllabusDesc1", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 2, titleKey: "nazraSyllabusTitle2", descKey: "nazraSyllabusDesc2", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 3, titleKey: "nazraSyllabusTitle3", descKey: "nazraSyllabusDesc3", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 4, titleKey: "nazraSyllabusTitle4", descKey: "nazraSyllabusDesc4", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 5, titleKey: "nazraSyllabusTitle5", descKey: "nazraSyllabusDesc5", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 6, titleKey: "nazraSyllabusTitle6", descKey: "nazraSyllabusDesc6", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 7, titleKey: "nazraSyllabusTitle7", descKey: "nazraSyllabusDesc7", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 8, titleKey: "nazraSyllabusTitle8", descKey: "nazraSyllabusDesc8", bookName: "Noorani Qaida", bookImage: BOOK_IMAGES.nooraniQaida },
  { id: 9, titleKey: "nazraSyllabusTitle9", descKey: "nazraSyllabusDesc9", bookName: "Al-Quran Al-Kareem", bookImage: BOOK_IMAGES.quran },
];

const hifzSyllabus: SyllabusSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titleKey: `hifzSyllabusTitle${i + 1}`,
  descKey: `hifzSyllabusDesc${i + 1}`,
  bookName: "Al-Quran Al-Kareem",
  bookImage: BOOK_IMAGES.quran,
}));

const aalimSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "aalimSyllabusTitle1", descKey: "aalimSyllabusDesc1", bookName: "Ilm ul Aqaid (Islamic Beliefs)", bookImage: BOOK_IMAGES.islamicAqaid },
  { id: 2, titleKey: "aalimSyllabusTitle2", descKey: "aalimSyllabusDesc2", bookName: "Hidayah (Islamic Jurisprudence)", bookImage: BOOK_IMAGES.hidayah },
  { id: 3, titleKey: "aalimSyllabusTitle3", descKey: "aalimSyllabusDesc3", bookName: "Mishkat Al-Masabih (Hadith)", bookImage: BOOK_IMAGES.mishkat },
  { id: 4, titleKey: "aalimSyllabusTitle4", descKey: "aalimSyllabusDesc4", bookName: "Tafseer Ibn Kathir", bookImage: BOOK_IMAGES.tafseerIbnKathir },
];

const arabicSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "arabicSyllabusTitle1", descKey: "arabicSyllabusDesc1", bookName: "Madinah Arabic Book 1", bookImage: BOOK_IMAGES.madinahArabic1 },
  { id: 2, titleKey: "arabicSyllabusTitle2", descKey: "arabicSyllabusDesc2", bookName: "Madinah Arabic Book 1", bookImage: BOOK_IMAGES.madinahArabic1 },
  { id: 3, titleKey: "arabicSyllabusTitle3", descKey: "arabicSyllabusDesc3", bookName: "Madinah Arabic Book 2", bookImage: BOOK_IMAGES.madinahArabic2 },
  { id: 4, titleKey: "arabicSyllabusTitle4", descKey: "arabicSyllabusDesc4", bookName: "Al-Arabiyya bayna Yadayk", bookImage: BOOK_IMAGES.arabicBetweenHands },
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
