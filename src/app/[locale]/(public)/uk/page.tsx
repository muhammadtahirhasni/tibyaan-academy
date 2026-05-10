import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle, Star, Clock, Users } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "Best Online Quran Classes in UK | Tibyaan Academy",
  description:
    "Join 500+ Muslims in the UK learning Quran, Hifz, and Arabic online. Live 1-on-1 teachers + AI Ustaz. Start your 5-day free trial today.",
  keywords: [
    "online Quran classes UK",
    "Quran tutor London",
    "Hifz program UK",
    "Islamic education UK",
    "learn Arabic UK",
    "online madrasah UK",
    "Quran classes Birmingham",
    "Quran classes Manchester",
  ],
  alternates: {
    canonical: `${BASE_URL}/en/uk`,
  },
  openGraph: {
    title: "Best Online Quran Classes in UK | Tibyaan Academy",
    description:
      "Join 500+ Muslims in the UK learning Quran, Hifz, and Arabic online. Live 1-on-1 teachers + AI Ustaz.",
    url: `${BASE_URL}/en/uk`,
  },
};

const features = [
  "Live 1-on-1 classes with certified teachers",
  "AI Ustaz available 24/7 for practice",
  "Flexible scheduling across all UK time zones",
  "Courses for children and adults",
  "Hifz, Nazra, Arabic, and full Aalim program",
  "5-day free trial — no credit card needed",
];

export default function UKLandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🇬🇧 Serving Muslim Families Across the UK
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Best Online Quran Classes in the UK
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join hundreds of Muslim families across London, Birmingham, Manchester, Leeds, and the
              rest of the UK who are learning Quran with Tibyaan Academy. Expert teachers, flexible
              schedules, and AI-powered learning — all from the comfort of your home.
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
              Why UK Muslims Choose Tibyaan Academy
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
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Courses Available for UK Students
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              All courses are available online. Classes are scheduled at times convenient for UK time zones (GMT/BST).
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  slug: "nazra-quran",
                  title: "Nazra Quran",
                  desc: "Learn to read Quran with proper Tajweed. Perfect for beginners.",
                  price: "From £6/month",
                },
                {
                  slug: "hifz-quran",
                  title: "Hifz Quran",
                  desc: "Memorise the Holy Quran with structured daily Sabaq & revision tracking.",
                  price: "From £9/month",
                },
                {
                  slug: "arabic-language",
                  title: "Arabic Language",
                  desc: "Learn Arabic grammar and conversation with a focus on Quranic Arabic.",
                  price: "From £8/month",
                },
                {
                  slug: "aalim-course",
                  title: "Aalim Course",
                  desc: "Complete Dars-e-Nizami / Aalim program — Fiqh, Hadith, Tafseer & more.",
                  price: "From £12/month",
                },
              ].map((course) => (
                <Link
                  key={course.slug}
                  href={`/courses/${course.slug}`}
                  className="block p-6 rounded-xl border bg-white dark:bg-card hover:border-emerald-400 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.desc}</p>
                  <span className="text-emerald-600 font-medium text-sm">{course.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white dark:bg-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Trusted by UK Muslim Families
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                { stat: "500+", label: "UK Students" },
                { stat: "4.9★", label: "Average Rating" },
                { stat: "5-day", label: "Free Trial" },
              ].map(({ stat, label }) => (
                <div key={label} className="text-center p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{stat}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-emerald-600 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Free Trial Today
            </h2>
            <p className="text-emerald-100 mb-8">
              5 days free — no credit card required. Experience live Quran teaching and AI-powered
              learning from the comfort of your home anywhere in the UK.
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
