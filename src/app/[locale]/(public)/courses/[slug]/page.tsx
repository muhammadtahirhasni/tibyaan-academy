import type { Metadata } from "next";
import CourseDetailClient from "@/components/courses/course-detail-client";

const BASE_URL = "https://tibyaan.com";

const courseInfo: Record<
  string,
  {
    nameEn: string;
    nameUr: string;
    nameAr: string;
    nameFr: string;
    nameId: string;
    descEn: string;
    descUr: string;
    price: string;
  }
> = {
  "nazra-quran": {
    nameEn: "Nazra Quran — Learn to Read Quran",
    nameUr: "ناظرہ قرآن — قرآن پاک پڑھنا سیکھیں",
    nameAr: "الناظرة — تعلم قراءة القرآن",
    nameFr: "Nazra Coran — Apprendre à lire le Coran",
    nameId: "Nazra Quran — Belajar Membaca Quran",
    descEn:
      "Learn to read Quran with proper Tajweed from certified teachers + AI Ustaz. 3-6 months program. From $8/month.",
    descUr:
      "تجوید کے ساتھ قرآن پاک پڑھنا سیکھیں۔ مستند اساتذہ + AI استاذ۔ 3-6 ماہ۔ $8 ماہانہ سے۔",
    price: "8",
  },
  "hifz-quran": {
    nameEn: "Hifz Quran — Memorize the Holy Quran",
    nameUr: "حفظ قرآن — قرآن پاک حفظ کریں",
    nameAr: "حفظ القرآن — احفظ القرآن الكريم",
    nameFr: "Hifz Coran — Mémoriser le Saint Coran",
    nameId: "Hifz Quran — Hafal Al-Quran",
    descEn:
      "Complete Hifz program with daily Sabaq, Sabqi & Manzil tracking. AI-powered revision. From $12/month.",
    descUr:
      "مکمل حفظ پروگرام — روزانہ سبق، سبقی اور منزل ٹریکنگ۔ AI سے ریویژن۔ $12 ماہانہ سے۔",
    price: "12",
  },
  "arabic-language": {
    nameEn: "Arabic Language — Learn Arabic for Quran",
    nameUr: "عربی زبان — قرآن کے لیے عربی سیکھیں",
    nameAr: "اللغة العربية — تعلم العربية للقرآن",
    nameFr: "Langue Arabe — Apprendre l'arabe pour le Coran",
    nameId: "Bahasa Arab — Belajar Bahasa Arab untuk Quran",
    descEn:
      "Learn Arabic grammar, vocabulary & conversation with Quran focus. 6-12 months. From $10/month.",
    descUr:
      "عربی گرامر، الفاظ اور مکالمہ سیکھیں — قرآنی عربی پر فوکس۔ 6-12 ماہ۔ $10 ماہانہ سے۔",
    price: "10",
  },
  "aalim-course": {
    nameEn: "Aalim Course — Dars-e-Nizami Online",
    nameUr: "عالم کورس — آن لائن درس نظامی",
    nameAr: "دورة العالم — درس نظامي أونلاين",
    nameFr: "Cours Aalim — Dars-e-Nizami en ligne",
    nameId: "Kursus Aalim — Dars-e-Nizami Online",
    descEn:
      "Complete Dars-e-Nizami / Aalim program online — Fiqh, Hadith, Tafseer & more. 2-8 years. From $15/month.",
    descUr:
      "مکمل درس نظامی / عالم کورس — فقہ، حدیث، تفسیر اور مزید۔ 2-8 سال۔ $15 ماہانہ سے۔",
    price: "15",
  },
};

type LocaleKey = "en" | "ur" | "ar" | "fr" | "id";

function getCourseTitle(
  info: (typeof courseInfo)[string],
  locale: string
): string {
  const nameMap: Record<LocaleKey, string> = {
    en: info.nameEn,
    ur: info.nameUr,
    ar: info.nameAr,
    fr: info.nameFr,
    id: info.nameId,
  };
  return nameMap[locale as LocaleKey] || info.nameEn;
}

function getCourseDesc(
  info: (typeof courseInfo)[string],
  locale: string
): string {
  if (locale === "ur") return info.descUr;
  return info.descEn;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const info = courseInfo[slug];

  if (!info) {
    return { title: "Course Not Found" };
  }

  const title = getCourseTitle(info, locale);
  const description = getCourseDesc(info, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/courses/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/courses/${slug}`,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = courseInfo[slug];

  const courseJsonLd = info
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: info.nameEn,
        description: info.descEn,
        provider: {
          "@type": "Organization",
          name: "Tibyaan Academy",
          url: BASE_URL,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: info.price,
          availability: "https://schema.org/InStock",
        },
        educationalLevel: "Beginner to Advanced",
        inLanguage: ["en", "ur", "ar", "fr", "id"],
      }
    : null;

  return (
    <>
      {courseJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}
      <CourseDetailClient />
    </>
  );
}
