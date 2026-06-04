export const PRICING = {
  nazra: {
    human_ai: 33,
    ai_only: 25,
    human_ai_yearly: 330,
    ai_only_yearly: 250,
    currency: "USD",
  },
  hifz: {
    human_ai: 45,
    ai_only: 37,
    human_ai_yearly: 450,
    ai_only_yearly: 370,
    currency: "USD",
  },
  arabic: {
    human_ai: 43,
    ai_only: 35,
    human_ai_yearly: 430,
    ai_only_yearly: 350,
    currency: "USD",
  },
  aalim: {
    human_ai: 50,
    ai_only: 40,
    human_ai_yearly: 500,
    ai_only_yearly: 400,
    currency: "USD",
  },
} as const;

export type CourseKey = keyof typeof PRICING;

export function formatPrice(amount: number): string {
  return `$${amount}`;
}

export function getLowestPrice(): number {
  return Math.min(...Object.values(PRICING).map((p) => p.ai_only));
}

export function getLowestHumanAiPrice(): number {
  return Math.min(...Object.values(PRICING).map((p) => p.human_ai));
}
