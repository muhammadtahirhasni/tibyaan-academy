"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stats = [
  { key: "students", value: "500+" },
  { key: "countries", value: "15+" },
  { key: "classes", value: "10,000+" },
  { key: "huffaz", value: "50+" },
] as const;

const highlights = [
  "Free Trial Available",
  "1-on-1 Live Classes",
  "500+ Students Worldwide",
  "5 Languages Supported",
] as const;

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Islamic geometric pattern */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-center">

          {/* Left Column */}
          <div>
            <div className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
              Online Islamic Academy
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight"
            >
              {t("headline")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl"
            >
              {t("subheadline")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/25 rounded-full"
                >
                  {t("cta1")}
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-full"
                >
                  {t("cta2")}
                </Button>
              </Link>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="text-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t(stat.key)}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-3xl p-7 shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-border"
          >
            <h3 className="font-bold text-foreground text-lg mt-0">Contact Information</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="font-semibold text-foreground">WhatsApp</div>
                <a
                  href="https://wa.me/923129114002"
                  className="text-primary hover:underline"
                >
                  +92 312 9114002
                </a>
              </div>
              <div>
                <div className="font-semibold text-foreground">Email</div>
                <a
                  href="mailto:academytibyaan@gmail.com"
                  className="text-primary hover:underline"
                >
                  academytibyaan@gmail.com
                </a>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-accent font-bold">✓</span>
                  {item}
                </div>
              ))}
            </div>

            <Link href="/courses" className="block mt-6">
              <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {t("cta2")}
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
