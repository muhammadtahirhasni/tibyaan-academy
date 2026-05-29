import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "Online Quran Classes Canada | Tibyaan Academy",
  description:
    "Join Muslim families across Canada learning Quran, Hifz, and Arabic online. Live certified teachers + AI Ustaz. Flexible for all Canadian time zones. 5-day free trial.",
  keywords: [
    "online Quran classes Canada",
    "Quran tutor Toronto",
    "Islamic education Canada",
    "Hifz program Canada",
    "learn Arabic Canada",
    "online madrasah Canada",
    "Quran classes Vancouver",
    "Quran classes Montreal",
  ],
  alternates: {
    canonical: `${BASE_URL}/en/canada`,
  },
  openGraph: {
    title: "Online Quran Classes Canada | Tibyaan Academy",
    description:
      "Join Muslim families across Canada learning Quran, Hifz, and Arabic online. Live teachers + AI Ustaz.",
    url: `${BASE_URL}/en/canada`,
  },
};

export default function CanadaLandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🇨🇦 Serving Muslim Families Across Canada
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Online Quran Classes Canada
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tibyaan Academy serves Muslim families in Toronto, Vancouver, Calgary, Montreal, Ottawa,
              and across Canada. Learn Quran, Hifz, Arabic and Islamic Sciences with certified live
              teachers and our AI Ustaz — anytime, from your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                View Courses
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white dark:bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">
              Why Canadian Muslims Choose Tibyaan Academy
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Live 1-on-1 classes with certified Quran teachers",
                "Covers all Canadian time zones (ET, CT, MT, PT, AT)",
                "AI Ustaz available 24/7 for revision",
                "Bilingual support in English and French",
                "Hifz, Nazra, Arabic and full Aalim programs",
                "5-day free trial — no credit card required",
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
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">Our Courses</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { slug: "nazra-quran", title: "Nazra Quran", desc: "Learn to read Quran with proper Tajweed.", price: "From $8/month" },
                { slug: "hifz-quran", title: "Hifz Quran", desc: "Memorize the Holy Quran with structured daily lessons.", price: "From $12/month" },
                { slug: "arabic-language", title: "Arabic Language", desc: "Quranic and Modern Standard Arabic.", price: "From $10/month" },
                { slug: "aalim-course", title: "Aalim Course", desc: "Complete Islamic sciences — Fiqh, Hadith, Tafseer.", price: "From $15/month" },
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
            <h2 className="text-3xl font-bold mb-4">Start Your Free Trial Today</h2>
            <p className="text-emerald-100 mb-8">
              5 days free — no credit card required. Join Muslim families across Canada learning
              Quran online with Tibyaan Academy.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
