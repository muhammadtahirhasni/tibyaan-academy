"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Languages,
  GraduationCap,
  Check,
  Bot,
  MessageCircle,
  Clock,
  Globe,
  UserCheck,
  Video,
  Star,
  ChevronDown,
} from "lucide-react";
import { getSyllabus } from "@/lib/data/course-syllabus";

type CourseKey = "nazra" | "hifz" | "arabic" | "aalim";

const courseData: Record<
  string,
  {
    key: CourseKey;
    icon: typeof BookOpen;
    color: string;
    iconColor: string;
    heroGradient: string;
    plan1Price: string;
    plan2Price: string;
    duration: string;
  }
> = {
  "nazra-quran": {
    key: "nazra",
    icon: BookOpen,
    color: "emerald",
    iconColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    heroGradient: "from-emerald-600/10 via-background to-emerald-600/5",
    plan1Price: "$55",
    plan2Price: "$38",
    duration: "3-6 months",
  },
  "hifz-quran": {
    key: "hifz",
    icon: Sparkles,
    color: "amber",
    iconColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    heroGradient: "from-amber-600/10 via-background to-amber-600/5",
    plan1Price: "$60",
    plan2Price: "$42",
    duration: "2-4 years",
  },
  "arabic-language": {
    key: "arabic",
    icon: Languages,
    color: "blue",
    iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    heroGradient: "from-blue-600/10 via-background to-blue-600/5",
    plan1Price: "$58",
    plan2Price: "$40",
    duration: "6-12 months",
  },
  "aalim-course": {
    key: "aalim",
    icon: GraduationCap,
    color: "purple",
    iconColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    heroGradient: "from-purple-600/10 via-background to-purple-600/5",
    plan1Price: "$65",
    plan2Price: "$45",
    duration: "2-8 years",
  },
};

const reviews = [
  { name: "Ahmed", stars: 5 },
  { name: "Fatima", stars: 5 },
  { name: "Ibrahim", stars: 4 },
];

export default function CourseDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("courseDetail");
  const tc = useTranslations("coursesSection");
  const tp = useTranslations("coursesPage");

  const course = courseData[slug];
  const [showAllSyllabus, setShowAllSyllabus] = useState(false);

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Course not found
            </h1>
            <Link href="/courses">
              <Button className="mt-4" variant="outline">
                Back to Courses
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = course.icon;
  const k = course.key;
  const syllabus = getSyllabus(k);
  const isHifz = k === "hifz";
  const visibleSyllabus = isHifz && !showAllSyllabus ? syllabus.slice(0, 5) : syllabus;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section
          className={`relative overflow-hidden bg-gradient-to-br ${course.heroGradient} py-16 md:py-24`}
        >
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${course.iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              <h1 className="mt-6 text-3xl md:text-5xl font-bold text-primary">
                {tc(`${k}Title`)}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-xl">
                {t(`${k}Tagline`)}
              </p>
              <Badge variant="secondary" className="mt-4 text-sm px-4 py-1">
                {course.duration}
              </Badge>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
                  >
                    {t("enrollNow")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                  >
                    {t("startTrial")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What You Will Learn */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("overview")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {t(`${k}Overview${n}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Syllabus */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("syllabus")}
            </motion.h2>
            <div className="mt-8 space-y-4">
              {visibleSyllabus.map((section, i) => {
                const hasMultiBooks = section.books && section.books.length > 0;
                const hasSingleBook = !hasMultiBooks && !!section.bookImage;

                return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-5 rounded-xl bg-card border shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* Left: number badge or single book image */}
                    {hasSingleBook ? (
                      <div className="shrink-0 w-20 text-center">
                        <img
                          src={section.bookImage!}
                          alt={section.bookName ?? t(section.titleKey)}
                          className="w-20 h-28 object-cover rounded-lg shadow border border-muted mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        {section.pdfUrl && (
                          <a
                            href={section.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1.5 text-[10px] font-medium text-primary hover:text-primary/80 underline"
                          >
                            📄 PDF
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{section.id}</span>
                      </div>
                    )}

                    {/* Right: title + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {hasSingleBook && (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{section.id}</span>
                          </div>
                        )}
                        <p className="text-sm font-semibold text-foreground">
                          {t(section.titleKey)}
                        </p>
                      </div>
                      {/* Hide description for multi-book sections — book names shown in thumbnails below */}
                      {!hasMultiBooks && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t(section.descKey)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Multiple book thumbnails row (Aalim / Arabic multi-book sections) */}
                  {hasMultiBooks && (
                    <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                      {section.books!.map((book) => (
                        <div key={book.name} className="flex-none text-center w-20">
                          {book.pdfUrl ? (
                            <a
                              href={book.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block group"
                              title={`Open ${book.name} PDF`}
                            >
                              <img
                                src={book.image}
                                alt={book.name}
                                className="w-20 h-28 object-cover rounded-lg shadow border border-muted mx-auto group-hover:shadow-md transition-shadow"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <p className="text-[11px] font-medium text-foreground mt-1.5 leading-tight line-clamp-2">
                                {book.name}
                              </p>
                              <p className="text-[10px] text-primary mt-0.5">📄 PDF</p>
                            </a>
                          ) : (
                            <>
                              <img
                                src={book.image}
                                alt={book.name}
                                className="w-20 h-28 object-cover rounded-lg shadow border border-muted mx-auto"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <p className="text-[11px] font-medium text-foreground mt-1.5 leading-tight line-clamp-2">
                                {book.name}
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
                );
              })}
              {isHifz && (
                <button
                  onClick={() => setShowAllSyllabus(!showAllSyllabus)}
                  className="flex items-center gap-2 mx-auto text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {showAllSyllabus ? t("showLess") : t("showAllParas")}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllSyllabus ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("whoIsItFor")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-accent/5 border border-accent/20 text-center"
                >
                  <UserCheck className="w-6 h-6 text-accent mx-auto" />
                  <p className="mt-3 text-sm text-foreground">
                    {t(`${k}Who${n}`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Teacher */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl bg-card border shadow-sm"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {t("teacherIntro")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("teacherDesc")}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* AI Ustaz Features */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("aiFeatures")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: MessageCircle, key: "aiF1" },
                { icon: BookOpen, key: "aiF2" },
                { icon: Clock, key: "aiF3" },
                { icon: Globe, key: "aiF4" },
              ].map((item, i) => {
                const AIIcon = item.icon;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <AIIcon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {t(item.key)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary text-center"
            >
              {t("pricing")}
            </motion.h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Plan 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl border-2 border-primary bg-card p-6 shadow-lg"
              >
                <Badge className="absolute -top-3 start-4 bg-primary text-primary-foreground">
                  {tp("plan1Label")}
                </Badge>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-primary">
                      {course.plan1Price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tp("perMonth")}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("liveClasses")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("aiUstaz")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("weeklyTests")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("certificates")}</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="block mt-6">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {t("enrollNow")}
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Plan 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border bg-card p-6"
              >
                <Badge
                  variant="secondary"
                  className="bg-accent/10 text-accent"
                >
                  {tp("plan2Label")}
                </Badge>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-accent">
                      {course.plan2Price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tp("perMonth")}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("aiUstaz")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("hifzTracker")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("kidsActivities")}</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="block mt-6">
                    <Button
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      {t("startTrial")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Student Reviews */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("reviews")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-card border shadow-sm"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s < review.stars
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;Great course, learned so much!&rdquo;
                  </p>
                  <p className="mt-3 text-xs font-semibold text-foreground">
                    {review.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary text-center"
            >
              {t("faq")}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8"
            >
              <Accordion>
                {[1, 2, 3, 4].map((n) => (
                  <AccordionItem key={n} className="border-b">
                    <AccordionTrigger className="py-4 text-sm font-medium">
                      {t(`faq${n}Q`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground pb-2">
                        {t(`faq${n}A`)}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold"
            >
              {t("enrollCta")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 text-primary-foreground/80"
            >
              {t("enrollCtaDesc")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
                >
                  {t("enrollNow")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-white/30 text-white hover:bg-white/10 font-semibold"
                >
                  {t("startTrial")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
