import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://tibyaan.com";
const rtlLocales = ["ur", "ar"];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Tibyaan Academy",
  url: BASE_URL,
  description:
    "Modern Digital Madrasah for Quran & Islamic Sciences — live teachers + AI Ustaz",
  sameAs: [
    "https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg",
    "https://www.linkedin.com/in/tibyaan-academy-0263b73bb/",
    "https://x.com/TibyaanAcademy",
    "https://web.facebook.com/profile.php?id=61576509186955",
    "https://www.instagram.com/tibyaanacademy/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Urdu", "Arabic", "French", "Indonesian"],
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "8",
    highPrice: "25",
    offerCount: "8",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Tibyaan Academy — Modern Digital Madrasah",
    template: "%s | Tibyaan Academy",
  },
  description:
    "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz. Affordable plans starting at $8/month. Free trial available.",
  keywords: [
    "online Quran classes",
    "learn Quran online",
    "Hifz program",
    "Tajweed course",
    "Arabic language course",
    "Islamic education",
    "digital madrasah",
    "AI Quran tutor",
    "Dars-e-Nizami online",
    "Aalim course",
    "Tibyaan Academy",
  ],
  authors: [{ name: "Tibyaan Academy" }],
  creator: "Tibyaan Academy",
  publisher: "Tibyaan Academy",
  openGraph: {
    type: "website",
    siteName: "Tibyaan Academy",
    title: "Tibyaan Academy — Modern Digital Madrasah",
    description:
      "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz.",
    url: BASE_URL,
    locale: "en_US",
    alternateLocale: ["ur_PK", "ar_SA", "fr_FR", "id_ID"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tibyaan Academy — Modern Digital Madrasah",
    description:
      "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B4332" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="alternate" type="application/rss+xml" title="Tibyaan Academy Blog" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
