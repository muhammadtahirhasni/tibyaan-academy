export interface SyllabusSection {
  id: number;
  titleKey: string;
  descKey: string;
}

export interface CourseSyllabus {
  courseType: string;
  sections: SyllabusSection[];
}

const nazraSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "nazraSyllabusTitle1", descKey: "nazraSyllabusDesc1" },
  { id: 2, titleKey: "nazraSyllabusTitle2", descKey: "nazraSyllabusDesc2" },
  { id: 3, titleKey: "nazraSyllabusTitle3", descKey: "nazraSyllabusDesc3" },
  { id: 4, titleKey: "nazraSyllabusTitle4", descKey: "nazraSyllabusDesc4" },
  { id: 5, titleKey: "nazraSyllabusTitle5", descKey: "nazraSyllabusDesc5" },
  { id: 6, titleKey: "nazraSyllabusTitle6", descKey: "nazraSyllabusDesc6" },
  { id: 7, titleKey: "nazraSyllabusTitle7", descKey: "nazraSyllabusDesc7" },
  { id: 8, titleKey: "nazraSyllabusTitle8", descKey: "nazraSyllabusDesc8" },
  { id: 9, titleKey: "nazraSyllabusTitle9", descKey: "nazraSyllabusDesc9" },
];

const hifzSyllabus: SyllabusSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titleKey: `hifzSyllabusTitle${i + 1}`,
  descKey: `hifzSyllabusDesc${i + 1}`,
}));

const aalimSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "aalimSyllabusTitle1", descKey: "aalimSyllabusDesc1" },
  { id: 2, titleKey: "aalimSyllabusTitle2", descKey: "aalimSyllabusDesc2" },
  { id: 3, titleKey: "aalimSyllabusTitle3", descKey: "aalimSyllabusDesc3" },
  { id: 4, titleKey: "aalimSyllabusTitle4", descKey: "aalimSyllabusDesc4" },
];

const arabicSyllabus: SyllabusSection[] = [
  { id: 1, titleKey: "arabicSyllabusTitle1", descKey: "arabicSyllabusDesc1" },
  { id: 2, titleKey: "arabicSyllabusTitle2", descKey: "arabicSyllabusDesc2" },
  { id: 3, titleKey: "arabicSyllabusTitle3", descKey: "arabicSyllabusDesc3" },
  { id: 4, titleKey: "arabicSyllabusTitle4", descKey: "arabicSyllabusDesc4" },
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
