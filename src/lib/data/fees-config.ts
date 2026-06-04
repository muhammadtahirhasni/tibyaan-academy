import { PRICING } from "@/lib/pricing";

export const COURSE_FEES = {
  nazra: {
    plan1Monthly: PRICING.nazra.human_ai,
    plan2Monthly: PRICING.nazra.ai_only,
    plan1Yearly: PRICING.nazra.human_ai_yearly,
    plan2Yearly: PRICING.nazra.ai_only_yearly,
  },
  hifz: {
    plan1Monthly: PRICING.hifz.human_ai,
    plan2Monthly: PRICING.hifz.ai_only,
    plan1Yearly: PRICING.hifz.human_ai_yearly,
    plan2Yearly: PRICING.hifz.ai_only_yearly,
  },
  arabic: {
    plan1Monthly: PRICING.arabic.human_ai,
    plan2Monthly: PRICING.arabic.ai_only,
    plan1Yearly: PRICING.arabic.human_ai_yearly,
    plan2Yearly: PRICING.arabic.ai_only_yearly,
  },
  aalim: {
    plan1Monthly: PRICING.aalim.human_ai,
    plan2Monthly: PRICING.aalim.ai_only,
    plan1Yearly: PRICING.aalim.human_ai_yearly,
    plan2Yearly: PRICING.aalim.ai_only_yearly,
  },
} as const;

export type CourseKey = keyof typeof COURSE_FEES;

export const COURSE_PRICING_TABLE = [
  { course: "Nazra Quran", key: "nazra" as CourseKey },
  { course: "Hifz Quran", key: "hifz" as CourseKey },
  { course: "Arabic Language", key: "arabic" as CourseKey },
  { course: "Aalim Course", key: "aalim" as CourseKey },
] as const;

export function formatFee(amount: number): string {
  return `$${amount}`;
}
