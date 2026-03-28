"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMEwzMCAzME0wIDMwTDYwIDMwTTAgMEw2MCA2ME02MCAwTDAgNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            {t("subtitle")}
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <Input
              type="text"
              placeholder={t("namePlaceholder")}
              className="h-12 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent"
            />
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="h-12 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent"
            />
            <Button
              type="submit"
              className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold whitespace-nowrap shadow-lg"
            >
              {t("button")}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
