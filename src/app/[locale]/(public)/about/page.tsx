import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BookOpen, Users, GraduationCap, Heart } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

const aboutMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "ہمارے بارے میں — تبیان اکیڈمی",
    description:
      "تبیان اکیڈمی ایک جدید ڈیجیٹل مدرسہ ہے جو آن لائن قرآن، حفظ، عربی اور اسلامی تعلیم فراہم کرتا ہے۔",
  },
  ar: {
    title: "عن أكاديمية تبيان",
    description:
      "أكاديمية تبيان هي مدرسة رقمية حديثة توفر تعليم القرآن والحفظ والعربية والعلوم الإسلامية عبر الإنترنت.",
  },
  en: {
    title: "About Us — Tibyaan Academy",
    description:
      "Tibyaan Academy is a modern digital madrasah offering online Quran, Hifz, Arabic & Islamic education with live teachers and AI support.",
  },
  fr: {
    title: "À propos — Tibyaan Academy",
    description:
      "Tibyaan Academy est une madrasah numérique moderne offrant l'enseignement du Coran, du Hifz, de l'arabe et des sciences islamiques en ligne.",
  },
  id: {
    title: "Tentang Kami — Tibyaan Academy",
    description:
      "Tibyaan Academy adalah madrasah digital modern yang menawarkan pendidikan Quran, Hifz, Bahasa Arab & Islam online.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = aboutMeta[locale] || aboutMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${BASE_URL}/${locale}/about` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/about`,
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  const values = [
    { icon: BookOpen, titleKey: "value1Title" as const, descKey: "value1Desc" as const },
    { icon: Users, titleKey: "value2Title" as const, descKey: "value2Desc" as const },
    { icon: GraduationCap, titleKey: "value3Title" as const, descKey: "value3Desc" as const },
    { icon: Heart, titleKey: "value4Title" as const, descKey: "value4Desc" as const },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-primary">
              {t("missionTitle")}
            </h2>
            <p className="mt-4 text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
              {t("missionDesc")}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-10">
              {t("valuesTitle")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div
                  key={v.titleKey}
                  className="bg-background rounded-xl border p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {t(v.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(v.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
