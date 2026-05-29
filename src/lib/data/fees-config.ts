export const COURSE_FEES = {
  nazra:  { plan1Monthly: 25, plan2Monthly: 18, plan1Yearly: 250, plan2Yearly: 180 },
  hifz:   { plan1Monthly: 30, plan2Monthly: 22, plan1Yearly: 300, plan2Yearly: 220 },
  arabic: { plan1Monthly: 28, plan2Monthly: 20, plan1Yearly: 280, plan2Yearly: 200 },
  aalim:  { plan1Monthly: 35, plan2Monthly: 25, plan1Yearly: 350, plan2Yearly: 250 },
} as const;

export type CourseKey = keyof typeof COURSE_FEES;

export const COURSE_PRICING_TABLE = [
  { course: "Nazra Quran",     key: "nazra"  as CourseKey },
  { course: "Hifz Quran",      key: "hifz"   as CourseKey },
  { course: "Arabic Language", key: "arabic" as CourseKey },
  { course: "Aalim Course",    key: "aalim"  as CourseKey },
] as const;

export function formatFee(amount: number): string {
  return `$${amount}`;
}
