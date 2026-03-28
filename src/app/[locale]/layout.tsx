import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PWAInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { ServiceWorkerRegistration } from "@/components/shared/sw-register";

const BASE_URL = "https://tibyaan.com";

const localeMetadata: Record<string, { title: string; description: string }> = {
  ur: {
    title: "تبیان اکیڈمی — آن لائن قرآن و اسلامی تعلیم",
    description:
      "قرآن، حفظ، عربی اور اسلامی علوم آن لائن سیکھیں — لائیو اساتذہ + AI استاذ کے ساتھ۔ ماہانہ صرف $8 سے۔",
  },
  ar: {
    title: "أكاديمية تبيان — تعليم القرآن والعلوم الإسلامية",
    description:
      "تعلم القرآن والحفظ والعربية والعلوم الإسلامية عبر الإنترنت مع معلمين مباشرين + أستاذ ذكاء اصطناعي.",
  },
  en: {
    title: "Tibyaan Academy — Online Quran & Islamic Education",
    description:
      "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz. Plans from $8/month.",
  },
  fr: {
    title: "Tibyaan Academy — Éducation Coranique et Islamique en Ligne",
    description:
      "Apprenez le Coran, le Hifz, l'arabe et les sciences islamiques en ligne avec des enseignants en direct + AI Ustaz.",
  },
  id: {
    title: "Tibyaan Academy — Pendidikan Quran & Islam Online",
    description:
      "Belajar Quran, Hifz, Bahasa Arab & Ilmu Islam online dengan guru langsung + AI Ustaz. Mulai dari $8/bulan.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale] || localeMetadata.en;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}`;
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}`,
      locale: locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider>
        {children}
        <PWAInstallPrompt />
      </NextIntlClientProvider>
      <ServiceWorkerRegistration />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}
