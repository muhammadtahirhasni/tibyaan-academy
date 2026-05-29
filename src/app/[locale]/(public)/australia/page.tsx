import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

export const metadata: Metadata = {
  title: "Quran Classes Online Australia | Tibyaan Academy",
  description:
    "Learn Quran, Hifz, and Arabic online in Australia. Live certified teachers + AI Ustaz. Schedules for AEST/AEDT time zones. 5-day free trial. Start today.",
  keywords: [
    "online Quran classes Australia",
    "Quran tutor Sydney",
    "Islamic education Australia",
    "Hifz program Australia",
    "learn Arabic Australia",
    "online madrasah Australia",
    "Quran classes Melbourne",
    "Quran classes Brisbane",
  ],
  alternates: {
    canonical: `${BASE_URL}/en/australia`,
  },
  openGraph: {
    title: "Quran Classes Online Australia | Tibyaan Academy",
    description:
      "Learn Quran, Hifz, and Arabic online in Australia. Live teachers + AI Ustaz. Flexible AEST schedules.",
    url: `${BASE_URL}/en/australia`,
  },
};

export default function AustraliaLandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🇦🇺 Serving Muslim Families Across Australia
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Quran Classes Online Australia
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tibyaan Academy brings certified Quran teachers to Muslim families in Sydney,
              Melbourne, Brisbane, Perth, Adelaide, and across Australia. Live online classes, AI
              Ustaz support, and flexible AEST/AEDT scheduling — all from home.
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
              Why Australian Muslims Choose Tibyaan Academy
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Live 1-on-1 sessions with certified Quran teachers",
                "Flexible scheduling for AEST, ACST, and AWST time zones",
                "AI Ustaz available 24/7 for practice",
                "Courses for all ages — children and adults",
                "Hifz, Nazra, Arabic and Aalim programs",
                "5-day free trial — no credit card needed",
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
                { slug: "nazra-quran", title: "Nazra Quran", desc: "Read Quran with correct Tajweed.", price: "From $8/month" },
                { slug: "hifz-quran", title: "Hifz Quran", desc: "Memorise the Quran with structured daily sessions.", price: "From $12/month" },
                { slug: "arabic-language", title: "Arabic Language", desc: "Quranic Arabic for understanding the Quran.", price: "From $10/month" },
                { slug: "aalim-course", title: "Aalim Course", desc: "Complete Islamic sciences program.", price: "From $15/month" },
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
              5 days free — no credit card required. Experience live Quran teaching from certified
              teachers across Australia with Tibyaan Academy.
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
