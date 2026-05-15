"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary rounded-[1.75rem] px-8 py-10 flex flex-col md:flex-row justify-between gap-8 items-center relative overflow-hidden"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMEwzMCAzME0wIDMwTDYwIDMwTTAgMEw2MCA2ME02MCAwTDAgNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              {t("title")}
            </h2>
            <p className="mt-2 text-primary-foreground/80">
              {t("subtitle")}
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          >
            <Input
              type="text"
              placeholder={t("namePlaceholder")}
              className="h-12 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent min-w-0 sm:w-44 rounded-full"
            />
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="h-12 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent min-w-0 sm:w-52 rounded-full"
            />
            <Button
              type="submit"
              className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold whitespace-nowrap shadow-lg rounded-full"
            >
              {t("button")}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
