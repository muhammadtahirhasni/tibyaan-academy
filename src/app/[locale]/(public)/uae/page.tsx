import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "Online Islamic Education in UAE & Dubai | Tibyaan Academy",
  description:
    "Learn Quran, Hifz, Arabic and Islamic Sciences online in UAE and Dubai. Live certified teachers + AI Ustaz. Classes in English, Arabic & Urdu. 5-day free trial.",
  keywords: [
    "online Quran classes UAE",
    "Quran classes Dubai",
    "learn Quran Abu Dhabi",
    "Islamic education UAE",
    "Hifz program Dubai",
    "Arabic classes UAE",
    "online madrasah UAE",
    "Quran tutor UAE",
  ],
  alternates: {
    canonical: `${BASE_URL}/en/uae`,
  },
  openGraph: {
    title: "Online Islamic Education in UAE & Dubai | Tibyaan Academy",
    description:
      "Learn Quran, Hifz, Arabic and Islamic Sciences online in UAE and Dubai. Live teachers + AI Ustaz.",
    url: `${BASE_URL}/en/uae`,
  },
};

const features = [
  "Live 1-on-1 sessions with certified Quran teachers",
  "Classes in English, Arabic, and Urdu",
  "Flexible scheduling for Gulf Standard Time (GST)",
  "Children and adult programs",
  "AI Ustaz for anytime practice and revision",
  "5-day free trial — no credit card required",
];

export default function UAELandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🇦🇪 Serving Muslim Families in UAE & Dubai
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Online Islamic Education in UAE & Dubai
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you live in Dubai, Abu Dhabi, Sharjah, or anywhere in the UAE, Tibyaan Academy
              connects you with certified Quran teachers for live online classes. Learn Quran, Hifz,
              Arabic, and Islamic Sciences — in your language, at your schedule.
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
              Why UAE Families Choose Tibyaan Academy
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature) => (
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
                { slug: "nazra-quran", title: "Nazra Quran", desc: "Read Quran with correct Tajweed — for all ages.", price: "From $8/month" },
                { slug: "hifz-quran", title: "Hifz Quran", desc: "Structured Hifz program with daily tracking and AI revision.", price: "From $12/month" },
                { slug: "arabic-language", title: "Arabic Language", desc: "Classical and Quranic Arabic for non-native speakers.", price: "From $10/month" },
                { slug: "aalim-course", title: "Aalim Course", desc: "Full Dars-e-Nizami — Fiqh, Hadith, Tafseer and more.", price: "From $15/month" },
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
              5 days free — no credit card required. Start learning Quran and Islamic Sciences
              online from anywhere in the UAE with Tibyaan Academy.
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
