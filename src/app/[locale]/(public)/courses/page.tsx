import type { Metadata } from "next";
import CoursesPageClient from "@/components/courses/courses-page-client";

import { SITE_URL as BASE_URL, localeMetadataAlternates } from "@/lib/site-config";

const coursesMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "کورسز — قرآن، حفظ، عربی اور عالم کورس",
    description:
      "تبیان اکیڈمی کے تمام کورسز دیکھیں — ناظرہ قرآن، حفظ، عربی زبان اور دارس نظامی۔ $25 ماہانہ سے شروع۔",
  },
  ar: {
    title: "الدورات — القرآن والحفظ والعربية ودورة العالم",
    description:
      "تصفح جميع دورات أكاديمية تبيان — الناظرة والحفظ والعربية والعالم. تبدأ من 25 دولار شهرياً.",
  },
  en: {
    title: "Courses — Quran, Hifz, Arabic & Aalim Course",
    description:
      "Browse all Tibyaan Academy courses — Nazra Quran, Hifz, Arabic Language & Dars-e-Nizami. Plans from $25/month.",
  },
  fr: {
    title: "Cours — Coran, Hifz, Arabe et Cours Aalim",
    description:
      "Découvrez tous les cours de Tibyaan Academy — Nazra Coran, Hifz, Langue Arabe & Dars-e-Nizami. À partir de 25$/mois.",
  },
  id: {
    title: "Kursus — Quran, Hifz, Bahasa Arab & Kursus Aalim",
    description:
      "Jelajahi semua kursus Tibyaan Academy — Nazra Quran, Hifz, Bahasa Arab & Dars-e-Nizami. Mulai dari $25/bulan.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = coursesMeta[locale] || coursesMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/courses"),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/courses`,
    },
  };
}

export default function CoursesPage() {
  return <CoursesPageClient />;
}
