export const COURSES = [
  {
    id: "e46b8a53-49cf-41ea-9cd9-98d1415e5acf",
    shortId: "TBA-C001",
    nameEn: "Nazra Quran",
    nameUr: "ناظرہ قرآن",
    type: "nazra" as const,
  },
  {
    id: "38f43c01-d61f-4f30-a49b-7fcc9acd04a8",
    shortId: "TBA-C002",
    nameEn: "Hifz Quran",
    nameUr: "حفظ قرآن",
    type: "hifz" as const,
  },
  {
    id: "ec6d4a3f-7068-4b69-baae-13e56d866e8b",
    shortId: "TBA-C003",
    nameEn: "Arabic Language",
    nameUr: "عربی زبان",
    type: "arabic" as const,
  },
  {
    id: "96a209f9-465c-411e-a48e-64238e86ce15",
    shortId: "TBA-C004",
    nameEn: "Aalim Course",
    nameUr: "عالم کورس",
    type: "aalim" as const,
  },
] as const;

export type CourseType = (typeof COURSES)[number]["type"];

export function getCourseById(id: string) {
  return COURSES.find((c) => c.id === id) ?? null;
}
