import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
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
  {
    id: 1,
    name: "Professor Muhammad Tahir Hasni",
    image: "/Our Team/Muhammad_Tahir_Hasni.jpg",
    role: "Founder of Tibyaan Academy",
    description: "Professor Muhammad Tahir Hasni founded Tibyaan Academy with a vision to make authentic Islamic education accessible to Muslims across the globe. With decades of academic excellence, he has been a pioneer in bringing traditional Islamic learning to the online world. His mission is to bridge the gap between technology and religion, serving the Ummah through modern yet authentic means.",
    whatsapp: "923478599839",
  },
  {
    id: 2,
    name: "Mufti Muhammad Rafeeq Golarwi",
    image: "/Our Team/Mufti_Muhammad_Rafeeq_Golarwi.jpeg",
    role: "Director of Tibyaan Academy",
    description: "Mufti Muhammad Rafeeq Golarwi oversees the day-to-day academic operations of Tibyaan Academy. His core expertise lies in Islamic Jurisprudence (Fiqh) and Usool-ul-Fiqh, and he has played a key role in adapting the traditional Dars-e-Nizami curriculum for the modern digital age. Under his leadership, Tibyaan's Aalim Course and Fatwa department serve students from around the world.",
    whatsapp: "923212485198",
  },
  {
    id: 3,
    name: "Mufti Owais Ahmed",
    image: "/Our Team/Mufti_Owais_Ahmed.png",
    role: "Head of Aalim Course",
    description: "Mufti Owais Ahmed leads Tibyaan Academy's flagship Aalim Course. He has successfully restructured the complete Dars-e-Nizami syllabus into an effective online format, enabling students to pursue the full journey of becoming a qualified Aalim from the comfort of their homes. His teaching style is clear, engaging, and deeply rooted in classical Islamic scholarship.",
    whatsapp: "923218035236",
  },
  {
    id: 4,
    name: "Sheikh Abdul Jabbar",
    image: "/Our Team/Sheikh Abdul Jabbar.jpeg",
    role: "Head of Arabic Language",
    description: "Sheikh Abdul Jabbar is a specialist in the Arabic language with deep expertise in Sarf, Nahw, Balaghat, and Classical Arabic Literature. He firmly believes that the direct path to understanding the Quran and Hadith is through mastering the Arabic language. His classes are structured in a way that even absolute beginners can quickly begin to understand the Quran with confidence.",
    whatsapp: "923152363498",
  },
  {
    id: 5,
    name: "Maulana Ali Haider",
    image: "/Our Team/Maulana Ali Haider.jpeg",
    role: "Head of Hifz-ul-Quran",
    description: "Maulana Ali Haider has dedicated his entire life to the service of the Holy Quran. He specializes in teaching Hifz to students of all ages — from young children to adults. His proven teaching methodology instills consistency and strength in memorization. He has designed Tibyaan's online Hifz program in a way that allows every student to progress at their own pace without compromising quality.",
    whatsapp: "923476676147",
  },
  {
    id: 6,
    name: "Qari Muhammad Musheer",
    image: "/Our Team/Qari Muhammad Musheer.jpg",
    role: "Head of Nazrat-ul-Quran",
    description: "Qari Muhammad Musheer heads the Nazrat and Tajweed department at Tibyaan Academy. His specialty lies in the precise articulation of Arabic letters (Makhaarij) and the rules of Tajweed. Thousands of students have learned to recite the Quran correctly under his guidance. His interactive and engaging teaching approach makes learning Quran enjoyable, particularly for children.",
    whatsapp: "923269244960",
  },
  {
    id: 7,
    name: "Qari Muhammad Ismail Hasni",
    image: "/Our Team/Qari Muhammad Ismail Hasni.jpeg",
    role: "Admin of Tibyaan Academy",
    description: "Qari Muhammad Ismail Hasni manages the complete administrative framework of Tibyaan Academy. From student enrollments and scheduling to fee management and teacher coordination — every operational matter falls under his supervision. His dedication and organizational skills ensure that the entire Academy runs smoothly and efficiently. He is always available and approachable for students' needs.",
    whatsapp: "923453184434",
  },
  {
    id: 8,
    name: "Ustaza Fatima Al-Zahra",
    image: "/Our Team/Ustaza Fatima Al-Zahra.jpg",
    role: "Head of Women's & Children's Programs",
    description: "Ustaza Fatima Al-Zahra oversees all women's and children's programs at Tibyaan Academy. Her teaching approach is built on innovative methods and a nurturing, compassionate style that has helped thousands of women and children learn the Quran and Islamic sciences. She is the creative force behind Tibyaan's Kids Activities section. She believes that every Muslim home should be the first school of Deen.",
    whatsapp: "923042043314",
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Expert Team</h2>
              <p className="mt-3 text-muted-foreground">Qualified scholars and educators from renowned Islamic institutions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.id} className="bg-background rounded-2xl border p-6 text-center hover:shadow-md transition-shadow flex flex-col items-center">
                  <div className="w-[160px] h-[160px] relative rounded-xl overflow-hidden mb-4 mx-auto">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                  <p className="mt-1 text-xs text-primary font-semibold">{member.role}</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">{member.description}</p>
                  <a
                    href={`https://wa.me/${member.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp ${member.name}`}
                    className="mt-4 inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
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
