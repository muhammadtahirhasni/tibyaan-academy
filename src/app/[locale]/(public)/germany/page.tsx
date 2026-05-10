import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "Online Quran Lernen Deutschland | Tibyaan Academy",
  description:
    "Quran, Hifz und Arabisch online lernen in Deutschland. Zertifizierte Lehrer + KI-Ustaz. Flexible Zeiten für deutsche Zeitzonen. 5 Tage kostenlos testen.",
  keywords: [
    "Quran online lernen Deutschland",
    "islamische Kurse online",
    "Hifz Programm Deutschland",
    "Arabisch lernen online",
    "islamische Bildung online",
    "Quran Unterricht Berlin",
    "Quran Unterricht Hamburg",
    "online Madrasa Deutschland",
  ],
  alternates: {
    canonical: `${BASE_URL}/en/germany`,
  },
  openGraph: {
    title: "Online Quran Lernen Deutschland | Tibyaan Academy",
    description:
      "Quran, Hifz und Arabisch online lernen. Zertifizierte Lehrer + KI-Ustaz. Für Muslime in ganz Deutschland.",
    url: `${BASE_URL}/en/germany`,
  },
};

export default function GermanyLandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🇩🇪 Für muslimische Familien in Deutschland
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Online Quran Lernen in Deutschland
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tibyaan Academy verbindet muslimische Familien in Berlin, Hamburg, München, Köln und
              ganz Deutschland mit zertifizierten Quran-Lehrern. Lerne den Quran, Hifz, Arabisch
              und islamische Wissenschaften — online, flexibel, von zu Hause aus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Kostenlos Starten
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                Kurse Ansehen
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white dark:bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">
              Warum Muslime in Deutschland Tibyaan Academy wählen
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Live 1-on-1-Unterricht mit zertifizierten Lehrern",
                "Flexible Zeiten für MEZ/MESZ-Zeitzonen",
                "KI-Ustaz rund um die Uhr verfügbar",
                "Kurse für Kinder und Erwachsene",
                "Hifz, Nazra, Arabisch und Aalim-Programm",
                "5 Tage kostenlos testen — keine Kreditkarte nötig",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">Unsere Kurse</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { slug: "nazra-quran", title: "Nazra Quran", desc: "Quran korrekt mit Tajweed lesen lernen.", price: "Ab $8/Monat" },
                { slug: "hifz-quran", title: "Hifz Quran", desc: "Strukturiertes Auswendiglernen des Quran.", price: "Ab $12/Monat" },
                { slug: "arabic-language", title: "Arabische Sprache", desc: "Koranisches Arabisch und Grammatik.", price: "Ab $10/Monat" },
                { slug: "aalim-course", title: "Aalim Kurs", desc: "Vollständiges islamisches Wissenschaftsprogramm.", price: "Ab $15/Monat" },
              ].map((course) => (
                <Link key={course.slug} href={`/courses/${course.slug}`} className="block p-6 rounded-xl border bg-white dark:bg-card hover:border-emerald-400 transition-colors">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.desc}</p>
                  <span className="text-emerald-600 font-medium text-sm">{course.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-emerald-600 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Starte deinen kostenlosen Test</h2>
            <p className="text-emerald-100 mb-8">
              5 Tage kostenlos — keine Kreditkarte erforderlich. Erlebe Live-Quran-Unterricht mit
              zertifizierten Lehrern von überall in Deutschland mit Tibyaan Academy.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
            >
              Jetzt Starten
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
