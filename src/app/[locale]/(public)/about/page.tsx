import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BookOpen, Users, GraduationCap, Heart, Globe, Star, Award, Video, Bot, Shield } from "lucide-react";
import { Link } from "@/i18n/navigation";

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

const stats = [
  { value: "5000+", label: "Students Worldwide" },
  { value: "50+", label: "Expert Teachers" },
  { value: "30+", label: "Countries" },
  { value: "10K+", label: "Classes Delivered" },
];

const features = [
  {
    icon: BookOpen,
    title: "Quran & Hifz",
    desc: "From basic Nazra to complete Hifz with certified Qaris",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    icon: Bot,
    title: "AI Ustaz 24/7",
    desc: "Ask any Islamic question — powered by Claude AI",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    icon: Video,
    title: "Live Classes",
    desc: "One-on-one & group sessions with qualified teachers",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    icon: GraduationCap,
    title: "Aalim Course",
    desc: "Full Dars-e-Nizami program — 2 to 8 year Ijazah",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    icon: Globe,
    title: "5 Languages",
    desc: "Urdu, Arabic, English, French & Indonesian",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  {
    icon: Shield,
    title: "Safe & Trusted",
    desc: "Verified teachers, parent monitoring & reports",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
];

const team = [
  { name: "Sheikh Abdullah", role: "Head of Quran Studies", emoji: "🎓" },
  { name: "Ustaz Ibrahim", role: "Hifz Program Director", emoji: "📖" },
  { name: "Dr. Fatima", role: "Arabic Language Lead", emoji: "🌟" },
  { name: "Maulana Yusuf", role: "Aalim Course Supervisor", emoji: "🕌" },
];

const testimonials = [
  {
    name: "Ahmed Ali",
    country: "Pakistan",
    flag: "🇵🇰",
    text: "My son completed his Hifz with Tibyaan Academy in just 3 years. The AI Ustaz helped him revise every night.",
    stars: 5,
  },
  {
    name: "Fatima Hassan",
    country: "United Kingdom",
    flag: "🇬🇧",
    text: "As a working mother, I couldn't find time to take my daughter to a local madrasa. Tibyaan made Islamic education possible at home.",
    stars: 5,
  },
  {
    name: "Abdur Rahman",
    country: "Malaysia",
    flag: "🇲🇾",
    text: "The Aalim Course quality is outstanding. I'm learning from authentic scholars and the curriculum is well-structured.",
    stars: 5,
  },
];

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">

        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
          <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-primary" />
              Trusted by 5,000+ Students Across 30+ Countries
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight">
              {t("title")}
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Start 5-Day Free Trial
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 border border-primary/30 text-primary hover:bg-primary/5 font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                View Courses
              </Link>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="mt-1 text-primary-foreground/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== MISSION ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2 text-sm font-semibold mb-4">
                <Heart className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                {t("missionTitle")}
              </h2>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-8 md:p-12">
              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                {t("missionDesc")}
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: BookOpen, label: "Authentic Curriculum" },
                  { icon: Users, label: "Qualified Teachers" },
                  { icon: Award, label: "Certified Programs" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 bg-background rounded-xl border p-4">
                    <item.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== VIDEO INTRO ===== */}
        <section className="py-8 md:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">See Tibyaan in Action</h2>
              <p className="mt-3 text-muted-foreground">Watch how our students learn Quran from anywhere in the world</p>
            </div>
            <div className="rounded-2xl overflow-hidden border shadow-xl bg-black aspect-video flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="Tibyaan Academy Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Visit our{" "}
              <a
                href="https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                YouTube Channel
              </a>{" "}
              for more lessons & student success stories
            </p>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">{t("valuesTitle")}</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Everything you need for a complete Islamic education — in one platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-background rounded-2xl border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color} mb-4`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TEAM ===== */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Expert Team</h2>
              <p className="mt-3 text-muted-foreground">Qualified scholars and educators from renowned Islamic institutions</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="bg-background rounded-2xl border p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-3">{member.emoji}</div>
                  <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">What Parents & Students Say</h2>
              <p className="mt-3 text-muted-foreground">Real stories from our global community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-background rounded-2xl border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-2xl">{testimonial.flag}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-5xl mb-4">🕌</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Begin Your Islamic Journey Today
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Join thousands of students learning Quran and Islamic sciences online. Your first 5 days are completely free.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-primary hover:bg-white/90 font-bold px-10 py-4 rounded-xl transition-colors text-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-xl transition-colors text-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
